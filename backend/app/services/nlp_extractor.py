"""
NLP & Technical Parameter Extractor for Indian Public Procurement Specifications
Uses spaCy (en_core_web_sm) combined with domain-specific regex heuristics.
"""
import re
from typing import Dict, Any, List, Optional
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

class ParameterExtractor:
    """
    Extracts physical dimensions, pressure ratings, electrical ratings,
    material grades, and cited standards from unstructured tender requirements.
    """

    # Compiled regex patterns for Indian engineering specifications
    PATTERNS = {
        "dimensions": re.compile(r'\b(\d+(?:\.\d+)?\s*(?:mm|cm|m|meter|metre|inch|inches|OD|DN|NB|sqmm))\b', re.IGNORECASE),
        "pressure_ratings": re.compile(r'\b(PN\s*\d+(?:\.\d+)?|(?:\d+(?:\.\d+)?\s*(?:bar|kg/cm2|kg/cm\^2|MPa|PSI)))\b', re.IGNORECASE),
        "electrical_ratings": re.compile(r'\b(\d+(?:\.\d+)?\s*(?:kVA|MVA|kV|kW|MW|Watts?|W|Amp|Amps|A|HP))\b', re.IGNORECASE),
        "voltage_levels": re.compile(r'\b(11\s*kV|33\s*kV|22\s*kV|433\s*V|415\s*V|230\s*V|240\s*V|1100\s*V|1\.1\s*kV|6\.6\s*kV)\b', re.IGNORECASE),
        "material_grades": re.compile(r'\b(PE-?100|PE-?80|PE-?63|Fe\s*500D|Fe\s*500|Fe\s*550D|Fe\s*550|Fe\s*415|E250|E350|E410|SS304|SS316|M20|M25|M30|OPC\s*53|OPC\s*43|PPC|PSC|Class\s*K9|Class\s*K7|SDR\s*11|SDR\s*17)\b', re.IGNORECASE),
        "cited_standards": re.compile(r'\b((?:IS|ASTM|DIN|ISO|BS|EN|IEC)\s*[A-Z0-9\/\.\-]+(?:\s*:\s*\d{4})?)\b', re.IGNORECASE),
        "brand_names": re.compile(r'\b(Havells|Finolex|Tata\s*Tiscon|Kirloskar|Supreme|Astral|Ashirvad|Cisco|HP|Dell|Polycab|Schneider|L&T|Siemens|ABB|Anchor|Legrand|Philips|Syska|Bosch|Honeywell|Hikvision|Dahua|Crompton|Sail|Ultratech|Ambuja|ACC)\b', re.IGNORECASE)
    }

    def extract(self, text: str) -> Dict[str, Any]:
        """Extracts structured technical parameters from free text."""
        results = {
            "dimensions": [],
            "pressure_ratings": [],
            "electrical_ratings": [],
            "voltage_levels": [],
            "material_grades": [],
            "cited_standards": [],
            "detected_brands": [],
            "named_entities": []
        }

        # Regex extractions
        for key, pattern in self.PATTERNS.items():
            matches = pattern.findall(text)
            cleaned = []
            for m in matches:
                val = m.strip() if isinstance(m, str) else m[0].strip()
                if val and val not in cleaned:
                    cleaned.append(val)
            if key == "brand_names":
                results["detected_brands"] = cleaned
            else:
                results[key] = cleaned

        # spaCy NLP entity extraction (ORG, PRODUCT, QUANTITY)
        if nlp:
            try:
                doc = nlp(text)
                for ent in doc.ents:
                    if ent.label_ in ("ORG", "PRODUCT", "QUANTITY", "CARDINAL"):
                        results["named_entities"].append({
                            "text": ent.text,
                            "label": ent.label_
                        })
            except Exception:
                pass

        return results

    def get_search_tokens(self, text: str) -> List[str]:
        """Extracts key search tokens with technical terms prioritized."""
        params = self.extract(text)
        tokens = []
        for std in params["cited_standards"]:
            tokens.append(std.upper())
        for grade in params["material_grades"]:
            tokens.append(grade.upper())
        for rating in params["pressure_ratings"]:
            tokens.append(rating.upper())
        for ele in params["electrical_ratings"]:
            tokens.append(ele.upper())
        for dim in params["dimensions"]:
            tokens.append(dim.lower())
        return list(dict.fromkeys(tokens))
