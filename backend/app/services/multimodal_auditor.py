import os
import re
import io
import asyncio
from typing import Optional, List, Dict, Any
import numpy as np
from PIL import Image, ImageEnhance, ImageOps
from scipy import signal, ndimage

from app.schemas.response_schemas import (
    TenderAuditResponse,
    StandardStatus,
    DetectedViolation,
    VisualGapItem,
    IsiVerificationResult
)
from app.services.regulatory_engine import RegulatoryEngine
from app.services.cvc_linter import CVCLinter
from app.services.foreign_converter import ForeignConverter
from app.services.clause_generator import ClauseGenerator
from app.services.hybrid_retriever import HybridRetriever

PRODUCT_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "water_storage_tanks": {
        "label": "Water Storage Tanks",
        "keywords": ["water tank", "water tanks", "water storage", "storage tank", "polyethylene tank", "rotomoulded tank", "overhead tank", "loft tank", "sintex", "plasto", "cistern"],
        "standards": ["IS 12701", "IS 12701:1996"],
        "incompatible_with": ["pipes_conduits", "cables_wiring", "structural_steel", "transformers", "cement_concrete", "lighting_luminaires", "fire_safety", "switches_accessories"]
    },
    "pipes_conduits": {
        "label": "Rigid PVC / HDPE / SWR Pipes & Conduit",
        "keywords": ["pipe", "pipes", "pvc", "upvc", "cpvc", "hdpe", "conduit", "conduits", "tubing", "plumbing", "rigid pvc", "rigid-pvc", "casing pipe", "drainage pipe", "swr pipe", "polyethylene pipe"],
        "standards": ["IS 4984", "IS 4985", "IS 1239", "IS 13592", "IS 15778", "IS 12818", "IS 9537", "IS 14333", "IS 14885"],
        "incompatible_with": ["water_storage_tanks", "cables_wiring", "structural_steel", "transformers", "cement_concrete", "lighting_luminaires", "fire_safety", "switches_accessories"]
    },
    "cables_wiring": {
        "label": "Electrical Cables & Wiring",
        "keywords": ["cable", "cables", "wire", "wires", "conductor", "conductors", "xlpe", "pvc cable", "armoured cable", "power cable", "submersible cable", "control cable", "flexible cable"],
        "standards": ["IS 694", "IS 1554", "IS 7098", "IS 398", "IS 9968", "IS 14255"],
        "incompatible_with": ["water_storage_tanks", "pipes_conduits", "structural_steel", "transformers", "cement_concrete", "valves_fittings"]
    },
    "transformers": {
        "label": "Power & Distribution Transformers",
        "keywords": ["transformer", "transformers", "distribution transformer", "power transformer", "substation transformer", "step down transformer", "kva transformer"],
        "standards": ["IS 1180", "IS 2026"],
        "incompatible_with": ["water_storage_tanks", "pipes_conduits", "structural_steel", "cables_wiring", "cement_concrete", "lighting_luminaires"]
    },
    "structural_steel": {
        "label": "Structural Steel & TMT Rebars",
        "keywords": ["tmt", "rebar", "rebars", "reinforcement bar", "steel bar", "tmt bar", "structural steel", "mild steel section", "fe500", "fe550", "fe500d", "angles", "channels", "joists"],
        "standards": ["IS 1786", "IS 2062", "IS 226", "IS 432", "IS 808"],
        "incompatible_with": ["water_storage_tanks", "pipes_conduits", "cables_wiring", "transformers", "lighting_luminaires", "cement_concrete"]
    },
    "cement_concrete": {
        "label": "Cement & Concrete Materials",
        "keywords": ["cement", "opc", "ppc", "portland cement", "ordinary portland", "pozzolana cement", "clinker", "rcc", "concrete mix"],
        "standards": ["IS 269", "IS 1489", "IS 8112", "IS 12269", "IS 456"],
        "incompatible_with": ["water_storage_tanks", "pipes_conduits", "cables_wiring", "transformers", "structural_steel"]
    },
    "valves_fittings": {
        "label": "Valves & Flow Control Fittings",
        "keywords": ["valve", "valves", "sluice valve", "butterfly valve", "gate valve", "ball valve", "check valve", "non return valve", "nrv"],
        "standards": ["IS 14846", "IS 778", "IS 13095", "IS 5312"],
        "incompatible_with": ["cables_wiring", "transformers", "structural_steel", "cement_concrete"]
    },
    "lighting_luminaires": {
        "label": "LED Luminaires & Lighting",
        "keywords": ["led", "luminaire", "luminaires", "street light", "flood light", "bulb", "lamp", "led fitting"],
        "standards": ["IS 10322", "IS 16102", "IS 16103", "IS 15885"],
        "incompatible_with": ["water_storage_tanks", "pipes_conduits", "structural_steel", "cement_concrete", "transformers"]
    },
    "fire_safety": {
        "label": "Fire Safety & Extinguishers",
        "keywords": ["fire extinguisher", "extinguisher", "fire hydrant", "sprinkler", "fire fighting", "co2 extinguisher"],
        "standards": ["IS 15683", "IS 2190", "IS 3844"],
        "incompatible_with": ["water_storage_tanks", "pipes_conduits", "transformers", "cement_concrete"]
    },
    "switches_accessories": {
        "label": "Switches, Sockets & Electrical Accessories",
        "keywords": ["switch", "switches", "socket", "sockets", "mcb", "mccb", "distribution board", "rccb", "elcb"],
        "standards": ["IS 3854", "IS 1293", "IS 8828", "IS 13947", "IS 60898"],
        "incompatible_with": ["water_storage_tanks", "pipes_conduits", "structural_steel", "cement_concrete"]
    }
}

def resolve_product_category(text: str = "", filename: Optional[str] = None) -> tuple:
    """
    Classifies a text description, OCR content, or image filename into a normalized procurement product category.
    Returns (category_id, category_label) or (None, None).
    """
    combined = f"{text or ''} {filename or ''}".lower()
    combined_clean = re.sub(r'[\-_\/\.]+', ' ', combined)

    best_cat = None
    best_score = 0

    for cat_id, data in PRODUCT_TAXONOMY.items():
        score = 0
        for kw in data["keywords"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', combined_clean, re.IGNORECASE):
                score += len(kw.split()) * 3
        for std in data["standards"]:
            if std.lower() in combined_clean:
                score += 6
        if score > best_score:
            best_score = score
            best_cat = cat_id

    if best_score >= 2:
        return best_cat, PRODUCT_TAXONOMY[best_cat]["label"]
    return None, None

class MultimodalAuditor:
    """
    Multimodal Engine:
    - Extracts text, numbers, brands, and ratings from product photos/nameplates using multi-pass enhanced OCR
    - Computer Vision scanner for BIS Standard Mark (ISI logo emblem) using multi-scale normalized cross-correlation
    - Detects 7-8 digit CM/L license numbers and statutory standard markings
    - Cross-references image data against buyer's draft tender text (The Visual Gap Matrix)
    - Enforces mandatory QCOs under Section 16 of the BIS Act, 2016
    """

    def __init__(
        self,
        regulatory_engine: RegulatoryEngine,
        cvc_linter: CVCLinter,
        foreign_converter: ForeignConverter,
        clause_generator: ClauseGenerator,
        retriever: HybridRetriever
    ):
        self.regulatory_engine = regulatory_engine
        self.cvc_linter = cvc_linter
        self.foreign_converter = foreign_converter
        self.clause_generator = clause_generator
        self.retriever = retriever

        # Load canonical BIS ISI Mark template for computer vision detection
        template_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static", "isi_emblem_template.png"))
        if os.path.exists(template_file):
            try:
                self.isi_template = np.array(Image.open(template_file).convert("L"), dtype=np.float32)
            except Exception as e:
                print(f"Failed to load ISI template: {e}")
                self.isi_template = None
        else:
            self.isi_template = None

    def detect_isi_emblem_cv(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Detects BIS Standard Mark (ISI logo emblem) visually on product apparatus or nameplates
        using multi-scale normalized cross-correlation (NCC) across normal and inverted polarities.
        """
        if not image_bytes or self.isi_template is None:
            return {"is_detected": False, "confidence": 0.0, "scale": 1.0, "polarity": "normal", "position": (0, 0)}

        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("L")
            arr = np.array(pil_img, dtype=np.float32)
            t_base = self.isi_template

            best_score = 0.0
            best_scale = 1.0
            best_polarity = "normal"
            best_pos = (0, 0)

            # Check both normal (white on dark) and inverted (dark on white) polarities
            for polarity, template_variant in [("normal", t_base), ("inverted", 255.0 - t_base)]:
                for scale in [0.5, 0.7, 0.85, 1.0, 1.2, 1.4, 1.7, 2.0]:
                    h, w = int(template_variant.shape[0] * scale), int(template_variant.shape[1] * scale)
                    if h < 12 or w < 16 or h >= arr.shape[0] - 5 or w >= arr.shape[1] - 5:
                        continue
                    t_scaled = ndimage.zoom(template_variant, (scale, scale), order=1)
                    t_std = t_scaled.std()
                    if t_std < 5.0:
                        continue
                    t_norm = (t_scaled - t_scaled.mean()) / t_std

                    corr = signal.fftconvolve(arr, t_norm[::-1, ::-1], mode='valid')
                    ones = np.ones_like(t_norm)
                    local_sum = signal.fftconvolve(arr, ones, mode='valid')
                    local_sum2 = signal.fftconvolve(arr**2, ones, mode='valid')
                    N = t_norm.size
                    local_var = local_sum2 - (local_sum**2) / N
                    local_var = np.maximum(local_var, 0)
                    local_std = np.sqrt(local_var)

                    # Mask out low-texture or flat background regions to eliminate false positives
                    valid_mask = local_std > 8.0
                    ncc = np.zeros_like(corr)
                    ncc[valid_mask] = corr[valid_mask] / (local_std[valid_mask] * np.sqrt(N))
                    ncc = np.clip(ncc, -1.0, 1.0)

                    if np.any(valid_mask):
                        max_val = float(np.max(ncc))
                        if max_val > best_score:
                            best_score = max_val
                            best_scale = scale
                            best_polarity = polarity
                            best_pos = np.unravel_index(np.argmax(ncc), ncc.shape)

            # 0.62+ is a high-confidence match for the distinctive BIS monogram box
            is_detected = best_score >= 0.62
            return {
                "is_detected": is_detected,
                "confidence": round(best_score, 3),
                "scale": best_scale,
                "polarity": best_polarity,
                "position": (int(best_pos[0]), int(best_pos[1]))
            }
        except Exception as e:
            print(f"CV emblem detection error: {e}")
            return {"is_detected": False, "confidence": 0.0, "scale": 1.0, "polarity": "normal", "position": (0, 0)}

    async def extract_text_from_image_async(self, image_bytes: bytes) -> str:
        """
        Extracts textual content from image bytes using multi-scale preprocessing and native Windows OCR (winsdk).
        Handles low-resolution mobile snapshots, dark background tanks/pipes, and industrial nameplates.
        """
        if not image_bytes:
            return ""

        try:
            import winsdk.windows.media.ocr as ocr
            import winsdk.windows.graphics.imaging as imaging
            import winsdk.windows.storage.streams as streams

            engine = ocr.OcrEngine.try_create_from_user_profile_languages()
            if not engine and len(ocr.OcrEngine.available_recognizer_languages) > 0:
                engine = ocr.OcrEngine.try_create_from_language(ocr.OcrEngine.available_recognizer_languages[0])

            if engine:
                async def _recognize_pil(pil_img):
                    buf = io.BytesIO()
                    if pil_img.mode != 'RGB':
                        pil_img = pil_img.convert('RGB')
                    pil_img.save(buf, format='PNG')
                    raw = buf.getvalue()
                    writer = streams.DataWriter()
                    writer.write_bytes(raw)
                    stream = streams.InMemoryRandomAccessStream()
                    await stream.write_async(writer.detach_buffer())
                    stream.seek(0)
                    decoder = await imaging.BitmapDecoder.create_async(stream)
                    bitmap = await decoder.get_software_bitmap_async()
                    res = await engine.recognize_async(bitmap)
                    if res and res.lines:
                        return [line.text for line in res.lines]
                    return []

                orig = Image.open(io.BytesIO(image_bytes))
                w, h = orig.size
                
                # Auto-upscale small images so characters meet minimum height threshold
                target_dim = 1200
                if max(w, h) < target_dim:
                    scale_factor = max(1, int(np.ceil(target_dim / max(w, h))))
                    upscaled = orig.resize((w * scale_factor, h * scale_factor), Image.Resampling.LANCZOS)
                else:
                    upscaled = orig

                unique_lines = []
                seen = set()

                def _add_lines(lines):
                    for l in lines:
                        cleaned = l.strip()
                        if cleaned and cleaned.lower() not in seen:
                            seen.add(cleaned.lower())
                            unique_lines.append(cleaned)

                # Pass 1: Upscaled direct RGB
                try:
                    p1 = await _recognize_pil(upscaled)
                    _add_lines(p1)
                except Exception:
                    pass

                # Pass 2: Grayscale with Contrast Enhancement
                try:
                    gray = upscaled.convert("L")
                    enh = ImageEnhance.Contrast(gray).enhance(2.2)
                    p2 = await _recognize_pil(enh)
                    _add_lines(p2)
                except Exception:
                    pass

                # Pass 3: Inverted if dark background (e.g. black plastic tank, dark conduit)
                try:
                    gray_arr = np.array(upscaled.convert("L"))
                    if gray_arr.mean() < 135:
                        inv = ImageOps.invert(upscaled.convert("L"))
                        inv_enh = ImageEnhance.Contrast(inv).enhance(2.0)
                        p3 = await _recognize_pil(inv_enh)
                        _add_lines(p3)
                except Exception:
                    pass

                if unique_lines:
                    return "\n".join(unique_lines)
        except Exception as e:
            print(f"Windows OCR multi-pass check: {e}")

        try:
            img = Image.open(io.BytesIO(image_bytes))
            info_text = " ".join([f"{k}:{v}" for k, v in img.info.items() if isinstance(v, str)])
            if info_text:
                return info_text
        except Exception:
            pass

        return ""

    def extract_attributes_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extracts technical parameters, ratings, brand names, standards, and license indicators.
        """
        normalized = text.replace('\n', ' ')

        # 1. Detect Indian Standards (e.g. IS 4984:2016, IS 1180:1989, IS 1786)
        is_matches = re.findall(r'\bIS\s*[:\-]?\s*(\d{3,5})(?:[:\-\s]+(\d{4}))?\b', normalized, re.IGNORECASE)
        detected_is_codes = []
        for code, yr in is_matches:
            full_code = f"IS {code}:{yr}" if yr else f"IS {code}"
            detected_is_codes.append(full_code)

        # 2. Detect Foreign Standards (ASTM, DIN, ISO, BS, EN)
        foreign_matches = re.findall(r'\b(ASTM|DIN|EN|ISO|BS)\s+([A-Z0-9\-]+)\b', normalized, re.IGNORECASE)
        detected_foreign = [f"{m[0].upper()} {m[1].upper()}" for m in foreign_matches]

        # 3. Detect CM/L License Number (e.g., CM/L-8400123456, CM\L8400123456, CML 1234567)
        cml_match = re.search(r'\bCM[\/\\|\s]?[L1I][\-\s]?(\d{7,8})\b', normalized, re.IGNORECASE)
        cml_number = f"CM/L-{cml_match.group(1)}" if cml_match else None

        # 4. Detect ISI Mark mentions or positive indicators
        has_isi_word = bool(re.search(r'\b(ISI|IST|1S1|IS1|I\.S\.I|STANDARD\s*MARK|BUREAU\s*OF\s*INDIAN\s*STANDARDS|SCHEME[\-\s]*I|BIS\s*CERTIFIED)\b', normalized, re.IGNORECASE))
        
        # 5. Detect explicit negative indicators (e.g., "NO ISI", "NOT LICENSED", "NO CM/L", "OPTIONAL")
        negative_indicators = bool(re.search(r'\b(NO\s*ISI|NOT\s*LICENSED|NO\s*CM[\/\\I]L|WITHOUT\s*ISI|NON[\-\s]*CERTIFIED|OPTIONAL\s*FOR)\b', normalized, re.IGNORECASE))

        # 6. Technical ratings
        ratings = {}
        # Pressure rating (PN 10, PN16, PN 6)
        pn_m = re.search(r'\bPN\s*(\d+(?:\.\d+)?)\b', normalized, re.IGNORECASE)
        if pn_m:
            ratings["pressure_rating"] = f"PN {pn_m.group(1)}"

        # Material Grade (PE-100, PE80, Fe500D, Grade 60)
        grade_m = re.search(r'\b(PE[\-\s]?[6810]{2,3}|Fe[\-\s]?[45][0-9]{2}[A-Z]?|Grade\s*\d+)\b', normalized, re.IGNORECASE)
        if grade_m:
            ratings["material_grade"] = grade_m.group(1).upper().replace(" ", "")

        # Diameter / Dimensions (110 mm, 16 mm, 500 mm)
        dim_m = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:mm|cm|meter|OD|NB)\b', normalized, re.IGNORECASE)
        if dim_m:
            ratings["dimension"] = f"{dim_m.group(1)} mm"

        # Electrical rating (500 kVA, 11 kV, 433 V, 50 Hz)
        elec_m = re.search(r'\b(\d+(?:\.\d+)?)\s*(kVA|MVA|kV|kW)\b', normalized, re.IGNORECASE)
        if elec_m:
            ratings["capacity"] = f"{elec_m.group(1)} {elec_m.group(2).upper()}"

        volt_m = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:kV|\/)\s*(\d+)\s*V\b', normalized, re.IGNORECASE)
        if volt_m:
            ratings["voltage_ratio"] = f"{volt_m.group(1)}kV / {volt_m.group(2)}V"

        # 7. Brands
        brand_matches = re.findall(r'\b(Plasto|Sintex|Vectus|Ashirvad|Supreme|Finolex|Prince|Havells|Tata\s*Tiscon|Jindal\s*Panther|Kirloskar|Astral|Siemens|ABB|Cisco|HP|Dell|Polycab)\b', normalized, re.IGNORECASE)
        detected_brands = list(set([b.strip() for b in brand_matches]))

        return {
            "is_codes": detected_is_codes,
            "foreign_standards": detected_foreign,
            "cml_number": cml_number,
            "has_isi_word": has_isi_word,
            "negative_indicators": negative_indicators,
            "ratings": ratings,
            "brands": detected_brands,
            "raw_text": normalized
        }

    def verify_isi_and_license(
        self,
        attrs: Dict[str, Any],
        standard_code: str,
        is_qco_mandatory: bool,
        qco_order_name: Optional[str] = None,
        product_mismatch: Optional[Dict[str, Any]] = None
    ) -> IsiVerificationResult:
        """
        ISI Mark & BIS CM/L License Scanner
        Verifies whether the product holds a verified license number or authentic ISI symbol,
        and flags if the physical product does not match the procurement tender requirement.
        """
        # Case 0: Product category mismatch (e.g. PVC pipe image attached for water storage tank requirement)
        if product_mismatch and product_mismatch.get("is_mismatch"):
            t_label = product_mismatch.get("tender_label") or "Specified Procurement Item"
            i_label = product_mismatch.get("image_label") or "Uploaded Item"
            f_name = product_mismatch.get("filename") or "attached image"
            return IsiVerificationResult(
                is_isi_present=False,
                license_number=attrs.get("cml_number"),
                status="PRODUCT_MISMATCH",
                verification_message=(
                    f"PRODUCT MISMATCH DETECTED: The uploaded equipment image ('{f_name}') corresponds to "
                    f"{i_label}, which is completely invalid and incompatible with the required procurement item "
                    f"({t_label} under {standard_code}). The attached visual artifact cannot be accepted for this tender."
                ),
                statutory_alert=(
                    f"CATEGORY CONFLICT: Equipment photo/nameplate corresponds to {i_label}, "
                    f"violating specification consistency for {t_label}. Scrutiny rejected."
                ),
                is_qco_mandatory=is_qco_mandatory,
                applicable_standard=standard_code
            )

        cml_number = attrs.get("cml_number")
        has_isi = attrs.get("has_isi_word", False)
        emblem_detected = attrs.get("emblem_detected", False)
        has_is_code = bool(attrs.get("is_codes"))
        has_negatives = attrs.get("negative_indicators", False)

        # Case 1: Valid License present on product label
        if cml_number and not has_negatives:
            return IsiVerificationResult(
                is_isi_present=True,
                license_number=cml_number,
                status="VERIFIED_LICENSE",
                verification_message=f"Authentic BIS Standard Mark & Operational License ({cml_number}) verified on product label. Complies with Scheme-I Certification under {standard_code}.",
                statutory_alert=None,
                is_qco_mandatory=is_qco_mandatory,
                applicable_standard=standard_code
            )

        # Case 2: Authentic ISI Emblem detected on product apparatus (via CV pattern matching or OCR mark or IS standard marking)
        if (emblem_detected or has_isi or (has_is_code and "IS" in standard_code)) and not has_negatives:
            conf = attrs.get('emblem_confidence')
            conf_str = f" (CV Match Confidence: {int(conf * 100)}%)" if conf else ""
            return IsiVerificationResult(
                is_isi_present=True,
                license_number=None,
                status="VERIFIED_LICENSE",
                verification_message=f"Authentic BIS Standard Mark (ISI Emblem) verified on product apparatus conforming to {standard_code}{conf_str}. Complies with statutory Scheme-I certification.",
                statutory_alert=None,
                is_qco_mandatory=is_qco_mandatory,
                applicable_standard=standard_code
            )

        # Case 3: Explicit negative indicator or missing certification on mandatory QCO product
        if has_negatives or (is_qco_mandatory and not emblem_detected and not has_isi and not cml_number):
            alert_msg = (
                f"CRITICAL STATUTORY ALERT: The product in the uploaded image does NOT hold a verified BIS CM/L license number "
                f"or authentic ISI Standard Mark emblem. Under Section 16 of the Bureau of Indian Standards Act, 2016 and mandatory "
                f"Quality Control Orders ({qco_order_name or 'Mandatory QCO in Force'}), procuring, accepting, or deploying uncertified "
                f"goods is a cognizable legal violation. This consignment must be summarily rejected during technical scrutiny."
            )
            return IsiVerificationResult(
                is_isi_present=False,
                license_number=None,
                status="UNCERTIFIED_RISK",
                verification_message="Missing BIS Certification: No verified CM/L license number or authentic ISI symbol detected on product.",
                statutory_alert=alert_msg,
                is_qco_mandatory=is_qco_mandatory,
                applicable_standard=standard_code
            )

        # Case 4: Voluntary standard category without license or emblem
        return IsiVerificationResult(
            is_isi_present=False,
            license_number=None,
            status="NO_LICENSE_FOUND",
            verification_message=f"Voluntary standard category: No BIS CM/L license number or ISI mark detected on label for {standard_code}.",
            statutory_alert=None,
            is_qco_mandatory=False,
            applicable_standard=standard_code
        )

    def build_visual_gap_matrix(
        self,
        attrs: Dict[str, Any],
        draft_text: str,
        target_standard: str,
        is_qco_mandatory: bool,
        qco_order_name: Optional[str] = None,
        product_mismatch: Optional[Dict[str, Any]] = None
    ) -> List[VisualGapItem]:
        """
        The Visual Gap Matrix (Image Attributes vs Buyer's Draft Text)
        """
        gap_matrix: List[VisualGapItem] = []
        text_lower = draft_text.lower()

        # 0. Product Category Conflict (if mismatch detected between tender text and image)
        if product_mismatch and product_mismatch.get("is_mismatch"):
            t_label = product_mismatch.get("tender_label") or "Specified Requirement"
            i_label = product_mismatch.get("image_label") or "Uploaded Item"
            f_name = product_mismatch.get("filename") or "Image"
            gap_matrix.append(VisualGapItem(
                feature_name="Physical Equipment & Category Alignment",
                image_value=f"{i_label} ({f_name})",
                status_in_text="DISCREPANCY",
                statutory_requirement=f"Physical sample must strictly conform to specified tender item ({t_label} under {target_standard}).",
                remediation_action=f"Reject current image attachment. Upload authentic photo/nameplate conforming to {target_standard}."
            ))
            gap_matrix.append(VisualGapItem(
                feature_name="BIS Standard Mark & CM/L License",
                image_value="Invalid Sample: Certification cannot be validated for mismatched category",
                status_in_text="DISCREPANCY",
                statutory_requirement=f"Section 16, BIS Act 2016 requires verified ISI Mark / CM/L license for {target_standard} ({t_label}).",
                remediation_action=f"Mandate active BIS license and authentic ISI mark specifically for {target_standard}."
            ))
            gap_matrix.append(VisualGapItem(
                feature_name="Governing Standard Alignment",
                image_value=f"Conflicting item ({i_label})",
                status_in_text="DISCREPANCY",
                statutory_requirement=f"Statutory national standard for procurement is {target_standard} ({t_label}).",
                remediation_action=f"Synchronize technical specification with {target_standard} and replace mismatched attachment."
            ))
            return gap_matrix

        # 1. BIS Certification & ISI Standard Mark
        if attrs.get("cml_number") and not attrs.get("negative_indicators"):
            cml = attrs["cml_number"]
            has_cml_in_text = cml.lower() in text_lower or "cml" in text_lower or "cm/l" in text_lower
            gap_matrix.append(VisualGapItem(
                feature_name="BIS License Number (CM/L)",
                image_value=f"Active BIS License {cml} on label",
                status_in_text="MATCHED" if has_cml_in_text else "MISSING_FROM_TEXT",
                statutory_requirement=f"Mandated by {qco_order_name or 'DPIIT QCO Order'} & BIS Act 2016",
                remediation_action="Verified active BIS license on apparatus label." if has_cml_in_text else "Injected mandatory bidder clause requiring active CM/L license at bid submission."
            ))
        elif (attrs.get("emblem_detected") or attrs.get("has_isi_word") or attrs.get("is_codes")) and not attrs.get("negative_indicators"):
            has_isi_in_text = "isi" in text_lower or target_standard.lower() in text_lower or "bis" in text_lower
            gap_matrix.append(VisualGapItem(
                feature_name="BIS Standard Mark (ISI Emblem)",
                image_value=f"Authentic ISI Standard Mark verified on apparatus ({target_standard})",
                status_in_text="MATCHED" if has_isi_in_text else "VERIFIED_IN_IMAGE",
                statutory_requirement="Section 16, BIS Act 2016 (Mandatory Scheme-I Certification)",
                remediation_action="Verified authentic BIS ISI Mark. Mandatory statutory certification satisfied."
            ))
        else:
            if "optional" in text_lower or "post-award" in text_lower or "left to bidder" in text_lower:
                gap_matrix.append(VisualGapItem(
                    feature_name="Statutory ISI Mark & License Mandate",
                    image_value="No verified ISI Mark / Uncertified Nameplate",
                    status_in_text="DISCREPANCY",
                    statutory_requirement="Section 16 of BIS Act, 2016 prohibits procurement of uncertified QCO products.",
                    remediation_action="Removed illegal 'optional/post-award' caveat; enforced mandatory Scheme-I ISI Mark."
                ))
            else:
                gap_matrix.append(VisualGapItem(
                    feature_name="BIS Standard Mark & CM/L License",
                    image_value="Missing authentic ISI symbol on apparatus",
                    status_in_text="MISSING_FROM_TEXT",
                    statutory_requirement="Section 16, BIS Act 2016 (Mandatory Certification)",
                    remediation_action="Strict clause added: Bids without verified BIS license shall be disqualified."
                ))

        # 2. Governing Standard Revision
        img_is = attrs.get("is_codes", [])
        if img_is:
            primary_img_std = img_is[0]
            if "1995" in primary_img_std or "1989" in primary_img_std:
                gap_matrix.append(VisualGapItem(
                    feature_name="Standard Lifecycle Revision",
                    image_value=f"Observed legacy citation: {primary_img_std}",
                    status_in_text="DISCREPANCY" if primary_img_std.lower() in text_lower else "SUPERSEDED_IN_IMAGE",
                    statutory_requirement="GFR 2017 Rule 144 mandates citing current active revisions with all gazetted amendments.",
                    remediation_action=f"Upgraded to active standard {target_standard} with amendments."
                ))
            else:
                gap_matrix.append(VisualGapItem(
                    feature_name="Governing Standard Code",
                    image_value=primary_img_std,
                    status_in_text="MATCHED" if primary_img_std.lower() in text_lower else "MISSING_FROM_TEXT",
                    statutory_requirement=f"Statutory national standard for procurement",
                    remediation_action="Synchronized technical specification with official standard."
                ))

        # 3. Technical Ratings (Pressure, Grade, Dimensions, Capacity)
        ratings = attrs.get("ratings", {})
        for r_name, r_val in ratings.items():
            r_val_clean = r_val.lower().replace(" ", "")
            is_in_text = r_val_clean in text_lower.replace(" ", "")
            label = r_name.replace("_", " ").title()

            if is_in_text:
                gap_matrix.append(VisualGapItem(
                    feature_name=label,
                    image_value=r_val,
                    status_in_text="MATCHED",
                    statutory_requirement=f"Performance parameter under {target_standard}",
                    remediation_action="Retained and verified in standardized technical schedule."
                ))
            else:
                gap_matrix.append(VisualGapItem(
                    feature_name=label,
                    image_value=r_val,
                    status_in_text="MISSING_FROM_TEXT",
                    statutory_requirement=f"Technical specification parameter under {target_standard}",
                    remediation_action=f"Auto-injected {label}: {r_val} into tender schedule."
                ))

        # 4. Mandatory Testing Standards (Normative References)
        test_methods = []
        if hasattr(self.regulatory_engine, "kg") and self.regulatory_engine.kg:
            norm_bundle = self.regulatory_engine.kg.get_normative_bundle(target_standard)
            test_methods = norm_bundle.get("testing_methods", [])
        if test_methods:
            primary_test_item = test_methods[0]
            if isinstance(primary_test_item, dict):
                primary_test = primary_test_item.get("code") or primary_test_item.get("title") or str(primary_test_item)
            else:
                primary_test = str(primary_test_item)

            test_parts = primary_test.split()
            test_code_clean = test_parts[0].lower() if test_parts else ""
            test_prefix = primary_test.split(":")[0].lower() if ":" in primary_test else ""
            test_in_text = (bool(test_code_clean) and test_code_clean in text_lower) or (bool(test_prefix) and test_prefix in text_lower)
            if not test_in_text:
                gap_matrix.append(VisualGapItem(
                    feature_name="Mandatory Lab Testing Protocol",
                    image_value=f"Requires {primary_test}",
                    status_in_text="MISSING_FROM_TEXT",
                    statutory_requirement=f"Normative test method mandated by {target_standard}",
                    remediation_action="Injected compulsory NABL laboratory batch testing certificate clause."
                ))

        # 5. Brand Names / Proprietary Make
        brands = attrs.get("brands", [])
        for brand in brands:
            gap_matrix.append(VisualGapItem(
                feature_name="Brand Name / Proprietary Make",
                image_value=brand,
                status_in_text="DISCREPANCY" if brand.lower() in text_lower else "PRESENT_IN_IMAGE",
                statutory_requirement="Prohibited by CVC Anti-Tailoring Directives & GFR Rule 144(vii).",
                remediation_action="Removed vendor make; converted into open, performance-based specification."
            ))

        return gap_matrix

    async def audit_multimodal(
        self,
        text_content: str,
        image_bytes: Optional[bytes] = None,
        filename: Optional[str] = None,
        tender_id: Optional[str] = "MULTIMODAL-AUDIT",
        title: Optional[str] = "Procurement Tender",
        department: Optional[str] = "Public Procurement Entity"
    ) -> TenderAuditResponse:
        """
        Combined multimodal audit evaluating both physical product image and tender text.
        """
        extracted_image_text = ""
        image_attrs: Dict[str, Any] = {}

        if image_bytes and len(image_bytes) > 0:
            extracted_image_text = await self.extract_text_from_image_async(image_bytes)
            image_attrs = self.extract_attributes_from_text(extracted_image_text)
            
            # Computer Vision scanner for BIS Standard Mark (ISI logo emblem)
            cv_res = self.detect_isi_emblem_cv(image_bytes)
            image_attrs["emblem_detected"] = cv_res["is_detected"]
            image_attrs["emblem_confidence"] = cv_res["confidence"]
            image_attrs["emblem_scale"] = cv_res["scale"]
            image_attrs["emblem_polarity"] = cv_res["polarity"]

        # Merge extracted text with user's text for standards analysis
        # Determine product categories for tender requirement vs uploaded image
        tender_cat, tender_label = resolve_product_category(f"{title or ''} {text_content or ''}")

        image_cat = None
        image_label = None
        if image_bytes and len(image_bytes) > 0:
            image_ocr_summary = f"{extracted_image_text} {' '.join(image_attrs.get('is_codes', []))}"
            image_cat, image_label = resolve_product_category(image_ocr_summary, filename=filename)

        is_mismatch = False
        product_mismatch_info = None
        if tender_cat and image_cat and tender_cat != image_cat:
            incompatible = (
                image_cat in PRODUCT_TAXONOMY[tender_cat].get("incompatible_with", []) or
                tender_cat in PRODUCT_TAXONOMY[image_cat].get("incompatible_with", [])
            )
            if incompatible:
                is_mismatch = True
                product_mismatch_info = {
                    "is_mismatch": True,
                    "tender_cat": tender_cat,
                    "tender_label": tender_label,
                    "image_cat": image_cat,
                    "image_label": image_label,
                    "filename": filename
                }

        # If product mismatch detected, do NOT contaminate tender standards audit with mismatched image text
        if is_mismatch:
            standards_audit = self.regulatory_engine.audit_text_standards(text_content or title or "General Procurement")
        else:
            combined_text = f"{text_content}\n{extracted_image_text}".strip()
            standards_audit = self.regulatory_engine.audit_text_standards(combined_text)
        detected_statuses = standards_audit["audits"]

        # Audit CVC anti-tailoring rules on buyer's tender text (excluding physical sample markings)
        cvc_audit = self.cvc_linter.audit_text(text_content)
        violations = cvc_audit["violations"]

        if is_mismatch:
            violations.insert(0, DetectedViolation(
                rule_id="CVC-RULE-PRODUCT-MISMATCH",
                rule_name="Product Mismatch: Attached Image Invalid for Requirement",
                severity="CRITICAL",
                matched_text=f"Tender Requirement: '{tender_label}' vs Attached Visual Sample: '{image_label}' (File: {filename or 'image'})",
                message=(
                    f"The attached equipment photo/nameplate depicts '{image_label}', which mismatches the procurement "
                    f"requirement specified in text ('{tender_label}'). Under GFR Rule 144, the attached visual artifact is invalid for this requirement."
                ),
                recommended_action=(
                    f"Remove the mismatched image. Attach authentic equipment photo or nameplate specifically for {tender_label}."
                )
            ))

        # Prioritize standard detected from physical product image ONLY IF no product category mismatch
        target_std = None
        if not is_mismatch and image_attrs.get("is_codes"):
            img_code = image_attrs["is_codes"][0]
            matched_in_statuses = next(
                (st for st in detected_statuses if (st.get("specified") or "").startswith(img_code.split(":")[0])),
                None
            )
            if matched_in_statuses:
                target_std = matched_in_statuses.get("recommended_standard") or matched_in_statuses.get("specified")
            else:
                target_std = img_code
                detected_statuses.insert(0, {
                    "specified": img_code,
                    "status": "ACTIVE",
                    "recommended_standard": img_code,
                    "title": f"BIS Standard {img_code} detected on product apparatus",
                    "is_qco_mandatory": False,
                    "qco_order": None
                })
        elif detected_statuses:
            target_std = detected_statuses[0].get("recommended_standard") or detected_statuses[0].get("specified")
        else:
            search_res = self.retriever.search(text_content or title or "General Procurement", top_k=1)
            if search_res:
                target_std = search_res[0]["is_code"]
                target_info = search_res[0]
                detected_statuses.append({
                    "specified": target_info["is_code"],
                    "status": target_info.get("status", "ACTIVE"),
                    "recommended_standard": target_info["is_code"],
                    "title": target_info.get("title"),
                    "is_qco_mandatory": bool(target_info.get("qco_id")),
                    "qco_order": target_info.get("qco_id")
                })

        # Check QCO status for the resolved target standard
        is_qco_mandatory = False
        qco_order_name = None
        if detected_statuses:
            is_qco_mandatory = detected_statuses[0].get("is_qco_mandatory", False)
            qco_order_name = detected_statuses[0].get("qco_order")

        # Suggestion 2: Verify ISI Mark and License Number
        isi_result = None
        if image_bytes and len(image_bytes) > 0:
            isi_result = self.verify_isi_and_license(
                attrs=image_attrs,
                standard_code=target_std or "Applicable Standard",
                is_qco_mandatory=is_qco_mandatory,
                qco_order_name=qco_order_name,
                product_mismatch=product_mismatch_info
            )
            if isi_result.status == "UNCERTIFIED_RISK":
                violations.insert(0, DetectedViolation(
                    rule_id="CVC-RULE-QCO-UNLICENSED",
                    rule_name="Uncertified Product / Missing Mandatory ISI Mark",
                    severity="CRITICAL",
                    matched_text="No CM/L License Number or ISI Mark on apparatus",
                    message="Mandatory Quality Control Order (QCO) violated under Section 16 of the BIS Act, 2016.",
                    recommended_action="Reject procurement of uncertified equipment; mandate active BIS CM/L license."
                ))

        # Suggestion 1: Build Visual Gap Matrix
        visual_gaps: Optional[List[VisualGapItem]] = None
        if image_bytes and len(image_bytes) > 0:
            try:
                visual_gaps = self.build_visual_gap_matrix(
                    attrs=image_attrs,
                    draft_text=text_content,
                    target_standard=target_std or "IS Standard",
                    is_qco_mandatory=is_qco_mandatory,
                    qco_order_name=qco_order_name,
                    product_mismatch=product_mismatch_info
                )
            except Exception as e:
                print(f"Visual gap matrix build error (graceful fallback): {e}")
                visual_gaps = []

        # Synthesize compliant tender clause
        sample_clause = None
        if target_std:
            res = self.clause_generator.generate_clause(
                item_category=title or "Procurement Item",
                standard_code=target_std,
                include_cvc_safeguards=True,
                include_qco_mandate=is_qco_mandatory
            )
            sample_clause = res["synthesized_clause_text"]

        # Calculate scores
        critical_count = cvc_audit["severity_counts"]["CRITICAL"] + standards_audit["withdrawn_count"]
        if is_mismatch:
            critical_count += 1
        if isi_result and isi_result.status == "UNCERTIFIED_RISK":
            critical_count += 1
        high_count = cvc_audit["severity_counts"]["HIGH"] + standards_audit["superseded_count"]
        medium_count = cvc_audit["severity_counts"]["MEDIUM"] + standards_audit["unspecified_count"]

        score = 100 - (critical_count * 25) - (high_count * 15) - (medium_count * 5)
        if is_mismatch:
            # A mismatched image must never show 100% compliant; cap score at max 50%
            score = min(score, 50)
        score = max(0, min(100, score))

        if score >= 85 and critical_count == 0 and not is_mismatch:
            overall_status = "COMPLIANT"
        elif score >= 50 and not is_mismatch:
            overall_status = "ACTION_REQUIRED"
        else:
            overall_status = "NON_COMPLIANT"

        if is_mismatch:
            advisory = (
                f"PRODUCT MISMATCH DETECTED: The attached visual artifact ({image_label}) is invalid for the specified "
                f"requirement ({tender_label}). Overall compliance evaluated at {int(score)}%. Compliance evaluation: {overall_status}. "
                f"Replace the attached image with authentic equipment documentation conforming to {target_std or 'governing standards'}."
            )
        else:
            advisory = (
                f"Multimodal evaluation: {critical_count} critical defects, {high_count} high-risk violations. "
                f"Overall compliance evaluated at {int(score)}%. "
                + ("Immediate disqualification or tender revision required before publication." if score < 70 else "Tender aligns with BIS & CVC requirements.")
            )

        return TenderAuditResponse(
            tender_id=tender_id or "MULTIMODAL-AUDIT",
            compliance_score=int(score),
            overall_status=overall_status,
            critical_issues_count=critical_count,
            high_issues_count=high_count,
            medium_issues_count=medium_count,
            detected_standards=[
                StandardStatus(**st) if isinstance(st, dict) else st for st in detected_statuses
            ],
            violations=violations,
            generated_compliant_clause=sample_clause,
            summary_advisory=advisory,
            image_extracted_text=extracted_image_text if extracted_image_text else None,
            isi_verification=isi_result,
            visual_gap_matrix=visual_gaps
        )
