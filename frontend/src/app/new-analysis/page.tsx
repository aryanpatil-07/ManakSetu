'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  auditTender,
  auditMultimodalTender,
  uploadTenderPdf,
  uploadBoqExcel,
  TenderAuditResponse,
  PdfScorecardResponse,
  BoqAuditResponse,
} from '@/lib/api';
import VisualGapMatrix from '@/components/VisualGapMatrix';

const EVALUATION_PRESETS = [
  {
    id: 'pipe',
    label: 'Preset 1: Water Supply HDPE Pipeline',
    title: 'HDPE Water Supply Pipes',
    department: 'Municipal Water Supply Directorate',
    badge: 'Obsolete IS 4984:1995 + ASTM D3035 + Brand Lock-in',
    text: `TECHNICAL SPECIFICATIONS FOR HDPE PIPELINE AUGMENTATION:
1. Pipes shall strictly conform to IS 4984:1995 (Fourth Revision) or ASTM D3035.
2. Only Supreme or Astral make pipes shall be accepted by the Engineer-in-Charge.
3. Pipe raw material grade shall be PE-80, pressure rating PN 10, SDR 11.
4. BIS ISI Mark under Pipes QCO 2020 is optional for imported consignments.
5. Minimum annual average financial turnover of bidder must be Rs 650 Crores.`,
  },
  {
    id: 'transformer',
    label: 'Preset 2: Substation Distribution Transformer',
    title: 'Distribution Transformers',
    department: 'State Electricity Distribution Co. (DISCOM)',
    badge: 'IS 1180:1989 + Siemens/ABB Make + Transformers QCO',
    text: `TECHNICAL SPECIFICATIONS FOR SUBSTATION DISTRIBUTION TRANSFORMERS:
1. Supply of 500 kVA, 11 kV / 433 V, 3-Phase 50 Hz outdoor oil-immersed distribution transformer.
2. Transformer design, manufacture and testing shall conform strictly to IS 1180:1989.
3. Proprietary OEM components: only ABB or Siemens high-voltage bushings permitted.
4. Testing of transformer insulating oil as per obsolete IS 335:1993.
5. Compliance with Electrical Transformers (Quality Control) Order is left to bidder declaration.`,
  },
  {
    id: 'steel',
    label: 'Preset 3: Civil Works TMT Rebars',
    title: 'TMT Reinforcement Steel',
    department: 'Central Public Works Department (CPWD)',
    badge: 'ASTM A615 + Tata Tiscon/Jindal Panther Lock-in',
    text: `TECHNICAL SPECIFICATIONS FOR CIVIL WORKS REINFORCEMENT STEEL:
1. Supply of 50 Metric Tonnes Thermo-Mechanically Treated (TMT) bars 16mm diameter.
2. Reinforcement steel shall strictly be Tata Tiscon or Jindal Panther make only.
3. Material shall conform to ASTM A615 Grade 60 without domestic Indian Standard equivalence.
4. Bidders must have sole authorized distributor certificate directly from primary producer.
5. Steel Quality Control Order (QCO) Scheme-I BIS certification may be submitted post-award.`,
  },
];

const SAMPLE_IMAGE_PRESETS = [
  {
    id: 'pipe-image',
    label: 'Sample 1: Municipal HDPE Pipe',
    subtitle: 'IS 4984:2016 • CM/L-8400123456 • PE-100 PN10',
    imagePath: '/samples/sample_certified_hdpe_pipe.png',
    fileName: 'sample_certified_hdpe_pipe.png',
    title: 'HDPE Water Supply Pipes',
    department: 'Municipal Water Supply Directorate',
    draftText: `TECHNICAL SPECIFICATIONS FOR HDPE PIPELINE AUGMENTATION:
1. Pipes shall strictly conform to IS 4984:1995 (Fourth Revision) or ASTM D3035.
2. Only Supreme or Astral make pipes shall be accepted by the Engineer-in-Charge.
3. Pipe raw material grade shall be PE-80, pressure rating PN 10, SDR 11.
4. BIS ISI Mark under Pipes QCO 2020 is optional for imported consignments.
5. Minimum annual average financial turnover of bidder must be Rs 650 Crores.`,
  },
  {
    id: 'transformer-image',
    label: 'Sample 2: Substation Transformer',
    subtitle: 'IS 1180:1989 • Missing BIS License • Uncertified Risk',
    imagePath: '/samples/sample_uncertified_transformer.png',
    fileName: 'sample_uncertified_transformer.png',
    title: 'Distribution Transformers',
    department: 'State Electricity Distribution Co. (DISCOM)',
    draftText: `TECHNICAL SPECIFICATIONS FOR SUBSTATION DISTRIBUTION TRANSFORMERS:
1. Supply of 500 kVA, 11 kV / 433 V, 3-Phase 50 Hz outdoor oil-immersed distribution transformer.
2. Transformer design, manufacture and testing shall conform strictly to IS 1180:1989.
3. Proprietary OEM components: only ABB or Siemens high-voltage bushings permitted.
4. Testing of transformer insulating oil as per obsolete IS 335:1993.
5. Compliance with Electrical Transformers (Quality Control) Order is left to bidder declaration.`,
  },
  {
    id: 'steel-image',
    label: 'Sample 3: TMT Steel Rebars',
    subtitle: 'IS 1786 Fe500D • Tata Tiscon Make • Brand Stamping',
    imagePath: '/samples/sample_flawed_tmt_steel.png',
    fileName: 'sample_flawed_tmt_steel.png',
    title: 'TMT Reinforcement Steel',
    department: 'Central Public Works Department (CPWD)',
    draftText: `TECHNICAL SPECIFICATIONS FOR CIVIL WORKS REINFORCEMENT STEEL:
1. Supply of 50 Metric Tonnes Thermo-Mechanically Treated (TMT) bars 16mm diameter.
2. Reinforcement steel shall strictly be Tata Tiscon or Jindal Panther make only.
3. Material shall conform to ASTM A615 Grade 60 without domestic Indian Standard equivalence.
4. Bidders must have sole authorized distributor certificate directly from primary producer.
5. Steel Quality Control Order (QCO) Scheme-I BIS certification may be submitted post-award.`,
  },
];

export default function NewAnalysisPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'text' | 'upload' | 'image'>('text');
  const [activePreset, setActivePreset] = useState<string>('pipe');
  const [descriptionText, setDescriptionText] = useState(EVALUATION_PRESETS[0].text);
  const [tenderTitle, setTenderTitle] = useState(EVALUATION_PRESETS[0].title);
  const [department, setDepartment] = useState(EVALUATION_PRESETS[0].department);

  // Upload State (Document Ingestion)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Image & Multimodal State
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedSampleImage, setSelectedSampleImage] = useState<string | null>(null);

  // Execution State
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [auditResult, setAuditResult] = useState<TenderAuditResponse | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfScorecardResponse | null>(null);
  const [boqResult, setBoqResult] = useState<BoqAuditResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerDirectAudit = async (textToAudit: string, titleToAudit: string) => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Evaluating GFR 144(vii), Section 16 BIS Act 2016, and CVC anti-tailoring rules...');

    try {
      const res = await auditTender({
        title: titleToAudit,
        text_content: textToAudit,
        tender_id: `NIT-${Date.now().toString().slice(-6)}`,
      });
      setAuditResult(res);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('manaksetu_active_audit', JSON.stringify(res));
        sessionStorage.setItem('manaksetu_audit_input', textToAudit);
        sessionStorage.setItem('manaksetu_audit_title', titleToAudit);
      }
    } catch (err: any) {
      console.error('Audit analysis failed:', err);
      setErrorMessage(
        err?.response?.data?.detail || err?.message || 'Failed to communicate with ManakSetu Engine on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if returning from Specification Builder with a rectified clause to auto-verify
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldAutoAudit = sessionStorage.getItem('manaksetu_auto_audit');
      const storedInput = sessionStorage.getItem('manaksetu_audit_input');
      const storedTitle = sessionStorage.getItem('manaksetu_audit_title');

      if (storedTitle) setTenderTitle(storedTitle);
      if (storedInput) setDescriptionText(storedInput);

      if (shouldAutoAudit === 'true' && storedInput) {
        sessionStorage.removeItem('manaksetu_auto_audit');
        triggerDirectAudit(storedInput, storedTitle || tenderTitle);
      }
    }
  }, []);

  const applyPreset = (preset: (typeof EVALUATION_PRESETS)[0]) => {
    setActivePreset(preset.id);
    setActiveTab('text');
    setDescriptionText(preset.text);
    setTenderTitle(preset.title);
    setDepartment(preset.department);
    setAuditResult(null);
    setErrorMessage(null);
  };

  const loadRectifiedClause = () => {
    const rectifiedText = `### TECHNICAL SPECIFICATION & STATUTORY COMPLIANCE SCHEDULE
**Item Nomenclature / Scope:** HDPE Water Supply Pipes
**Governing National Standard:** IS 4984:2016 — High Density Polyethylene Pipes for Water Supply — Specification
**BIS Technical Division:** Civil / Electrotechnical / Mechanical Engineering
---

#### 1. MANDATORY NATIONAL STANDARD & REVISION STATUS
1.1 The materials, components, and finished goods supplied under this contract shall strictly conform to the latest active revision of **IS 4984:2016** along with all gazetted amendments.
1.2 The bidder shall ensure compliance with the following active statutory amendments:
    - Amendment No. 1 (2018)
    - Amendment No. 2 (2021)
1.3 Citing obsolete, superseded, or withdrawn revisions of the standard is strictly prohibited under GFR 2017 Rule 144.

#### 2. STATUTORY QUALITY CONTROL ORDER (QCO) ENFORCEMENT
2.1 **MANDATORY STATUTORY REGULATION IN FORCE:** Pursuant to the **Pipes and Fittings (Quality Control) Order, 2021** gazetted by the **Ministry of Commerce and Industry (DPIIT)** under Notification No. **S.O. 4321(E)** in exercise of powers conferred by Section 16 of the Bureau of Indian Standards Act, 2016:
    (a) All goods supplied under this schedule must compulsorily bear the authentic Standard Mark (**Scheme-I (ISI Mark)**) under a valid and operational BIS license.
    (b) The bidder / OEM must hold an active BIS License (CM/L Number) for the offered product category on the date of technical bid opening.
    (c) **Summary Technical Disqualification:** Any bid proposing uncertified products, self-certification, or goods not bearing the mandatory BIS Standard Mark shall be summarily rejected during technical evaluation without seeking post-bid clarification.
    (d) **Penal Safeguards:** Contravention of Section 16 of the BIS Act, 2016 is a cognizable statutory offense punishable under Section 29 with imprisonment up to two years or fine.

#### 3. NORMATIVE RAW MATERIAL & TESTING PROTOCOLS
3.1 The supplied items shall adhere to the normative reference standards cited within IS 4984:2016:
    - **Governing Raw Material Specifications:** IS 7328:2020
    - **Prescribed Testing Protocols:** IS 12235 (Part 1 to 19), IS 2530:1963, IS 5382:2018
    - **Allied & Installation Practices:** IS 14333:1996, IS 8008 (Part 1 to 7)

#### 4. QUALITY ASSURANCE, LAB TESTING & ACCEPTANCE
4.1 The contractor shall submit authentic Manufacturer Test Certificates (MTC) alongside dispatch documents confirming 100% batch testing in an NABL-accredited or BIS-recognized testing laboratory.
4.2 The Purchaser reserves the statutory right to appoint an independent Third-Party Inspection (TPI) agency (e.g., RITES / CEIL) for stage-wise inspection and sampling at the manufacturer works prior to dispatch.

#### 5. CVC BRAND NEUTRALITY & ANTI-TAILORING SAFEGUARDS
5.1 In strict accordance with Central Vigilance Commission (CVC) Directives (Office Memorandum No. 03-05-1-CTE-9) and General Financial Rules (GFR 2017) Rule 144(vii) & Rule 157:
    (a) This specification is strictly generic and performance-based. No proprietary make, trade name, patent, or restrictive dimension is mandated.
    (b) Any inadvertent or historical reference in tender documents to specific brand names or makes shall be construed strictly as illustrative and shall be read as *"or equivalent product certified to IS 4984:2016"*.
    (c) Foreign standards (ASTM / DIN / ISO / BS / IEC / EN) cited by prospective bidders shall be evaluated strictly against the equivalent Indian Standard (**IS 4984:2016**) pursuant to GFR 2017 Rule 144(vii).`;

    setDescriptionText(rectifiedText);
    setTenderTitle('HDPE Water Supply Pipes (Rectified)');
    triggerDirectAudit(rectifiedText, 'HDPE Water Supply Pipes (Rectified)');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setAuditResult(null);
      setPdfResult(null);
      setBoqResult(null);
      setErrorMessage(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setSelectedSampleImage(null);
      setImagePreviewUrl(URL.createObjectURL(file));
      setAuditResult(null);
      setErrorMessage(null);
    }
  };

  const applySampleImagePreset = async (preset: (typeof SAMPLE_IMAGE_PRESETS)[0]) => {
    setSelectedSampleImage(preset.id);
    setImagePreviewUrl(preset.imagePath);
    setTenderTitle(preset.title);
    setDepartment(preset.department);
    setDescriptionText(preset.draftText);
    setAuditResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch(preset.imagePath);
      const blob = await res.blob();
      const file = new File([blob], preset.fileName, { type: 'image/png' });
      setUploadedImage(file);
    } catch (err) {
      console.warn('Could not fetch local sample image blob', err);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImagePreviewUrl(null);
    setSelectedSampleImage(null);
    setAuditResult(null);
    setErrorMessage(null);
  };

  const runAnalysis = async () => {
    if (activeTab === 'text') {
      if (uploadedImage) {
        // Multimodal execution when an optional image is attached in Tab 1
        setLoading(true);
        setErrorMessage(null);
        setStatusMessage('Extracting OCR text from nameplate & auditing against BIS repository...');
        try {
          const res = await auditMultimodalTender({
            title: tenderTitle,
            department: department,
            text_content: descriptionText,
            tender_id: `MM-${Date.now().toString().slice(-6)}`,
            image: uploadedImage,
          });
          setAuditResult(res);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('manaksetu_active_audit', JSON.stringify(res));
          }
        } catch (err: any) {
          console.error('Multimodal audit failed:', err);
          setErrorMessage(
            err?.response?.data?.detail || err?.message || 'Multimodal inspection failed.'
          );
        } finally {
          setLoading(false);
        }
      } else {
        await triggerDirectAudit(descriptionText, tenderTitle);
      }
    } else if (activeTab === 'image') {
      if (!uploadedImage) {
        setErrorMessage('Please upload a product photo or select a sample nameplate preset first.');
        return;
      }

      setLoading(true);
      setErrorMessage(null);
      setAuditResult(null);
      setPdfResult(null);
      setBoqResult(null);
      setStatusMessage('Extracting OCR text from nameplate & auditing against BIS repository...');

      try {
        const res = await auditMultimodalTender({
          title: tenderTitle,
          department: department,
          text_content: descriptionText,
          tender_id: `MM-${Date.now().toString().slice(-6)}`,
          image: uploadedImage,
        });
        setAuditResult(res);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('manaksetu_active_audit', JSON.stringify(res));
          sessionStorage.setItem('manaksetu_audit_input', descriptionText);
          sessionStorage.setItem('manaksetu_audit_title', tenderTitle);
        }
      } catch (err: any) {
        console.error('Multimodal audit failed:', err);
        setErrorMessage(
          err?.response?.data?.detail || err?.message || 'Failed to communicate with ManakSetu Engine on port 8000.'
        );
      } finally {
        setLoading(false);
      }
    } else if (activeTab === 'upload') {
      if (!uploadedFile) {
        setErrorMessage('Please select a PDF tender RFP or Excel BoQ file first.');
        return;
      }

      setLoading(true);
      setErrorMessage(null);
      setAuditResult(null);
      setPdfResult(null);
      setBoqResult(null);

      try {
        const isExcel = uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls');
        if (isExcel) {
          setStatusMessage('Processing Multi-Item Excel BoQ schedule with row-by-row standards mapping...');
          const boq = await uploadBoqExcel(uploadedFile, `BOQ-${Date.now().toString().slice(-6)}`);
          setBoqResult(boq);
        } else {
          setStatusMessage('Parsing Tender PDF with PyMuPDF and cross-referencing regulatory database...');
          const pdf = await uploadTenderPdf(uploadedFile, `PDF-${Date.now().toString().slice(-6)}`);
          setPdfResult(pdf);
        }
      } catch (err: any) {
        console.error('Audit analysis failed:', err);
        setErrorMessage(
          err?.response?.data?.detail || err?.message || 'Failed to communicate with ManakSetu Engine on port 8000.'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProceedToBuilder = () => {
    router.push('/specification-builder');
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-label-eyebrow text-[11px] tracking-[2px] text-secondary font-bold uppercase">
              WORKSPACE / NEW ANALYSIS
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary font-bold tracking-tight">
            New standards scrutiny &amp; analysis
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Audit tender specifications against 23,000+ Indian Standards, mandatory QCOs, and CVC anti-tailoring directives.
          </p>
        </div>
      </div>

      {/* Quick-Fill Presets for Official Evaluation */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-wider text-outline font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
            Authoritative Evaluation Presets (Click to load into workbench):
          </span>
          <span className="text-[11px] font-mono text-outline">Real statutory test cases</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EVALUATION_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                type="button"
                className={`text-left p-3 rounded border transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-primary-container/15 border-primary-container text-primary shadow-xs'
                    : 'bg-surface border-outline-variant/60 hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                <div className="font-headline-md text-body-sm font-bold text-primary flex items-center justify-between">
                  <span>{preset.label}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-primary-container">check_circle</span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-secondary font-medium leading-tight">
                  {preset.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Workbench Left, Guidance Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Form (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/60 rounded shadow-sm flex flex-col">
          {/* Ingestion Mode Tabs */}
          <div className="flex items-center px-6 pt-4 border-b border-outline-variant/40 gap-8 overflow-x-auto select-none">
            <button
              className={`flex items-center gap-2 pb-3 px-1 font-body-md text-body-md transition-all ${
                activeTab === 'text'
                  ? 'text-primary font-semibold border-b-2 border-secondary'
                  : 'text-on-surface-variant font-medium hover:text-on-surface border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab('text')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>1. Tender Clause &amp; Presets</span>
            </button>
            <button
              className={`flex items-center gap-2 pb-3 px-1 font-body-md text-body-md transition-all ${
                activeTab === 'upload'
                  ? 'text-primary font-semibold border-b-2 border-secondary'
                  : 'text-on-surface-variant font-medium hover:text-on-surface border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab('upload')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>2. Upload Tender Document (PDF / BoQ Excel)</span>
            </button>
            <button
              className={`flex items-center gap-2 pb-3 px-1 font-body-md text-body-md transition-all ${
                activeTab === 'image'
                  ? 'text-primary font-semibold border-b-2 border-secondary'
                  : 'text-on-surface-variant font-medium hover:text-on-surface border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab('image')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              <span>3. Product Photo &amp; Nameplate (Visual OCR)</span>
            </button>
          </div>

          <div className="p-6">
            {/* TAB 1: Tender Text / Free Text / Presets */}
            {activeTab === 'text' && (
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-sm font-semibold text-primary mb-1">
                      Procurement Item Category
                    </label>
                    <input
                      type="text"
                      value={tenderTitle}
                      onChange={(e) => setTenderTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded text-body-sm text-on-surface"
                      placeholder="e.g. HDPE Pipes, Transformers, TMT Steel"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-semibold text-primary mb-1">
                      Department / Procuring Entity
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded text-body-sm text-on-surface"
                      placeholder="e.g. CPWD, DISCOM, Municipal Corp"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="font-headline-md text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                    <span>Technical Specification / Tender Clause</span>
                    <span className="text-error font-bold">*</span>
                  </label>
                  <div className="inline-flex items-center gap-1 text-primary-container font-label-md text-label-sm bg-surface-container px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    <span>NLP entity + CVC linter</span>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="Enter raw technical specifications, clauses citing legacy IS or foreign codes..."
                    className="w-full h-48 p-4 border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container text-body-sm text-on-surface leading-relaxed font-mono bg-surface/70 resize-none transition-all"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 text-outline font-code-sm text-[11px] pointer-events-none bg-surface-container-lowest/90 px-2 py-0.5 rounded">
                    <span>{descriptionText.length} characters</span>
                  </div>
                </div>

                {/* Optional Product Photo / Nameplate Attachment */}
                <div className="p-3 bg-surface rounded-lg border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      add_a_photo
                    </span>
                    <div className="text-[12px]">
                      <span className="font-semibold text-primary">
                        Attach Product Photo / Equipment Nameplate
                      </span>
                      <span className="text-on-surface-variant ml-1">(Optional OCR &amp; Visual Gap Matrix)</span>
                    </div>
                  </div>

                  {uploadedImage ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface-container border border-outline-variant/60 truncate max-w-[200px]">
                        {uploadedImage.name}
                      </span>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="text-error text-[11px] font-semibold hover:underline flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-secondary hover:text-primary cursor-pointer px-3 py-1 rounded bg-surface-container border border-outline-variant/50 transition">
                      <span className="material-symbols-outlined text-[15px]">upload</span>
                      <span>Attach Photo</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDescriptionText('');
                        setAuditResult(null);
                        setErrorMessage(null);
                      }}
                      className="text-on-surface-variant hover:text-on-surface text-label-sm font-semibold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                      <span>Reset Input Form</span>
                    </button>
                    <button
                      type="button"
                      onClick={loadRectifiedClause}
                      className="text-label-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-850 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 transition shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px] text-emerald-700">task_alt</span>
                      <span>Load Rectified Clause (100% Compliant)</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={loading || !descriptionText.trim()}
                    onClick={runAnalysis}
                    className="bg-primary-container hover:bg-primary text-on-primary font-semibold font-body-sm px-6 py-2.5 rounded shadow-sm inline-flex items-center gap-2 disabled:opacity-50 transition"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                        <span>Verifying Compliance...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Check Tender Compliance</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Document Upload (Single Source of Truth) */}
            {activeTab === 'upload' && (
              <div className="flex flex-col space-y-4">
                <label className="border-2 border-dashed border-outline-variant rounded-lg p-8 text-center bg-surface hover:bg-surface-container-low transition-colors cursor-pointer block">
                  <span className="material-symbols-outlined text-[44px] text-primary-container mb-2">
                    cloud_upload
                  </span>
                  <p className="font-headline-md text-body-md font-semibold text-primary">
                    {uploadedFile
                      ? `Selected: ${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(1)} KB)`
                      : 'Select or drag Tender RFP (.pdf) or Bill of Quantities (.xlsx)'}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Supports digital PDFs, scanned tender annexures, and multi-item Excel BoQ files
                  </p>
                  <div className="mt-4">
                    <span className="inline-block px-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-semibold text-primary shadow-sm">
                      Choose File
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {uploadedFile && (
                  <div className="flex items-center justify-between p-3 bg-surface-container rounded border border-outline-variant/50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary-container">
                        {uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')
                          ? 'table_view'
                          : 'picture_as_pdf'}
                      </span>
                      <span className="font-body-sm text-primary font-semibold">{uploadedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={runAnalysis}
                      className="bg-primary-container text-on-primary px-4 py-1.5 rounded font-label-md text-label-sm font-semibold hover:bg-primary transition shadow-xs flex items-center gap-1.5"
                    >
                      {loading ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                          <span>Uploading &amp; Scanning...</span>
                        </>
                      ) : (
                        <>
                          <span>Audit Tender Document</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Product Photo & Equipment Nameplate (Visual OCR & Gap Matrix) */}
            {activeTab === 'image' && (
              <div className="flex flex-col space-y-5">
                {/* Authoritative Nameplate Presets */}
                <div className="bg-surface p-3.5 rounded-lg border border-outline-variant/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-eyebrow text-[11px] uppercase tracking-wider text-outline font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">photo_library</span>
                      Authoritative Equipment Nameplate Presets (Click to inspect):
                    </span>
                    <span className="text-[11px] font-mono text-outline">Real equipment nameplates</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {SAMPLE_IMAGE_PRESETS.map((preset) => {
                      const isSelected = selectedSampleImage === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applySampleImagePreset(preset)}
                          className={`text-left p-2.5 rounded border transition-all flex flex-col justify-between gap-1 ${
                            isSelected
                              ? 'bg-primary-container/15 border-primary-container text-primary shadow-xs'
                              : 'bg-surface-container-lowest border-outline-variant/60 hover:bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          <div className="text-[12px] font-bold text-primary flex items-center justify-between">
                            <span>{preset.label}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[14px] text-primary-container">check_circle</span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-secondary truncate">
                            {preset.subtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Image Upload Dropzone & Thumbnail Preview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className={imagePreviewUrl ? 'md:col-span-7' : 'md:col-span-12'}>
                    <label className="border-2 border-dashed border-outline-variant rounded-lg p-6 text-center bg-surface hover:bg-surface-container-low transition-colors cursor-pointer block">
                      <span className="material-symbols-outlined text-[40px] text-primary-container mb-2">
                        add_photo_alternate
                      </span>
                      <p className="font-headline-md text-body-md font-semibold text-primary">
                        {uploadedImage
                          ? `Selected: ${uploadedImage.name} (${(uploadedImage.size / 1024).toFixed(1)} KB)`
                          : 'Select or drag Product Photo or Equipment Nameplate (.png, .jpg, .webp)'}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Extracts text, BIS ISI Logo, CM/L license number, pressure/voltage ratings, and brand markings
                      </p>
                      <div className="mt-3">
                        <span className="inline-block px-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-semibold text-primary shadow-sm">
                          Browse Image
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {imagePreviewUrl && (
                    <div className="md:col-span-5 p-3 rounded-lg border border-outline-variant/60 bg-surface flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">preview</span>
                          Physical Nameplate Preview
                        </span>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="text-[11px] text-error hover:underline flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          Remove
                        </button>
                      </div>
                      <div className="relative w-full h-44 rounded overflow-hidden bg-slate-950 flex items-center justify-center border border-outline-variant/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreviewUrl}
                          alt="Physical Product Nameplate"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-mono truncate">
                        {uploadedImage?.name || 'sample_image.png'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Accompanying Tender Clause to Cross-Reference */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-headline-md text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                      <span>Buyer&apos;s Draft Tender Clause (For Visual Gap Matrix Comparison)</span>
                      <span className="text-secondary text-[11px] font-normal">(Compares physical markings vs tender draft)</span>
                    </label>
                    <span className="text-[11px] font-mono text-outline">The Visual Gap Matrix</span>
                  </div>
                  <textarea
                    rows={4}
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="Paste draft tender text to compare against the physical nameplate markings..."
                    className="w-full p-3 border border-outline-variant rounded text-body-sm text-on-surface font-mono bg-surface/70 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={clearImage}
                    className="text-on-surface-variant hover:text-on-surface text-label-sm font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset Image Form</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading || !uploadedImage}
                    onClick={runAnalysis}
                    className="bg-primary-container hover:bg-primary text-on-primary font-semibold font-body-sm px-6 py-2.5 rounded shadow-sm inline-flex items-center gap-2 disabled:opacity-50 transition"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                        <span>Scanning Image &amp; Cross-Referencing...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                        <span>Audit Product Image &amp; Clause</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loading Banner */}
          {loading && (
            <div className="mx-6 mb-6 p-4 rounded bg-primary text-on-primary flex items-center justify-between animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
                <div className="flex flex-col">
                  <span className="font-headline-md text-body-sm font-semibold text-on-primary">
                    {statusMessage}
                  </span>
                  <span className="font-body-sm text-[11px] text-on-primary-container">
                    Evaluating Section 16 BIS Act 2016, Rule 144(vii) GFR 2017 &amp; CVC Anti-Tailoring Directives
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mx-6 mb-6 p-4 rounded bg-error-container/30 border border-error/50 text-error flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="text-body-sm font-medium">{errorMessage}</span>
            </div>
          )}

          {/* LIVE AUDIT RESULT SUMMARY CARD */}
          {auditResult && (
            <div className="mx-6 mb-6 p-5 rounded-lg bg-surface border border-outline-variant/60 shadow-md space-y-4 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold font-headline-md text-headline-md ${
                      auditResult.compliance_score >= 85
                        ? 'bg-tertiary-fixed text-tertiary'
                        : auditResult.compliance_score >= 50
                        ? 'bg-secondary-fixed text-secondary'
                        : 'bg-error-container text-error'
                    }`}
                  >
                    {auditResult.compliance_score}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-body-md font-bold text-primary">
                        Compliance Evaluation: {auditResult.overall_status}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          auditResult.overall_status === 'COMPLIANT'
                            ? 'bg-tertiary-fixed text-tertiary'
                            : 'bg-secondary-fixed text-secondary'
                        }`}
                      >
                        {auditResult.overall_status}
                      </span>
                    </div>
                    <div className="text-body-sm text-[12px] text-on-surface-variant mt-0.5">
                      {auditResult.summary_advisory}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToBuilder}
                  className="bg-[#0A2540] hover:bg-[#132E58] text-white px-4 py-2.5 rounded text-xs font-semibold tracking-wider uppercase transition shadow-xs flex items-center gap-1.5 self-start sm:self-center border border-[#0A2540]"
                >
                  <span>Build Compliant Specification</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              {/* VISUAL GAP MATRIX & ISI CERTIFICATION (FOR MULTI-MODAL AUDIT) */}
              {(auditResult.visual_gap_matrix || auditResult.isi_verification) && (
                <VisualGapMatrix
                  isiVerification={auditResult.isi_verification}
                  visualGapMatrix={auditResult.visual_gap_matrix}
                  imageExtractedText={auditResult.image_extracted_text}
                  imagePreviewUrl={imagePreviewUrl}
                />
              )}

              {/* Detected Standards Grid */}
              <div className="space-y-3">
                <span className="font-label-eyebrow text-[11px] uppercase tracking-wider text-outline font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                  Detected Standards &amp; Statutory Status ({auditResult.detected_standards.length}):
                </span>
                <div className="space-y-3">
                  {auditResult.detected_standards.map((std, idx) => {
                    const isSuperseded =
                      std.status === 'OBSOLETE' ||
                      std.status === 'SUPERSEDED' ||
                      std.status === 'WITHDRAWN';

                    const showReplaceWith =
                      isSuperseded &&
                      std.recommended_standard &&
                      std.recommended_standard.toLowerCase().replace(/[\s\(\)]/g, '') !==
                        std.specified.toLowerCase().replace(/[\s\(\)]/g, '');

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/60 shadow-2xs space-y-2.5"
                      >
                        {/* Header Row: Status icon + Standard Code + Status badge + QCO badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`material-symbols-outlined text-[20px] shrink-0 ${
                                std.status === 'ACTIVE'
                                  ? 'text-emerald-700'
                                  : isSuperseded
                                  ? 'text-amber-700'
                                  : 'text-red-700'
                              }`}
                            >
                              {std.status === 'ACTIVE' ? 'check_circle' : 'warning'}
                            </span>
                            <span className="font-mono text-body-md font-bold text-slate-950">
                              {std.specified}
                            </span>
                            {showReplaceWith && (
                              <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 shadow-2xs">
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                <span>Replace with: {std.recommended_standard}</span>
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                std.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : isSuperseded
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-red-100 text-red-900 border border-red-300'
                              }`}
                            >
                              {std.status === 'ACTIVE' ? 'Active Standard' : std.status}
                            </span>
                          </div>

                          {std.is_qco_mandatory && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-900 border border-rose-300 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                              <span>Mandatory QCO: {std.qco_order || 'Statutory ISI Mark'}</span>
                            </span>
                          )}
                        </div>

                        {/* Title Row: Full width */}
                        {std.title && (
                          <div className="text-body-sm text-slate-800 font-medium pl-7 leading-snug">
                            {std.title}
                          </div>
                        )}

                        {/* Regulatory Notes Row: Full width */}
                        {std.notes && (
                          <div className="ml-7 text-xs font-mono text-slate-700 leading-relaxed bg-surface-container-low/50 p-2.5 rounded border border-outline-variant/30">
                            {std.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CVC Violations */}
              {auditResult.violations && auditResult.violations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="font-label-eyebrow text-[11px] uppercase tracking-wider text-red-900 font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-red-700">gavel</span>
                    CVC Anti-Tailoring &amp; Vigilance Flags ({auditResult.violations.length}):
                  </span>
                  <div className="space-y-2">
                    {auditResult.violations.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg bg-red-50/70 border border-red-200 flex items-start gap-3 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[20px] text-red-700 shrink-0 mt-0.5">
                          flag
                        </span>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-red-950 text-body-sm">
                              {v.rule_name}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                v.severity === 'CRITICAL'
                                  ? 'bg-red-700 text-white'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {v.severity}
                            </span>
                          </div>
                          <p className="text-slate-800 text-xs leading-relaxed">
                            {v.message}
                          </p>
                          <div className="text-xs font-medium text-emerald-950 bg-emerald-50 border border-emerald-200 p-2.5 rounded leading-snug">
                            <span className="font-bold text-emerald-900">Statutory Action: </span>
                            {v.recommended_action}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BoQ Upload Result Display */}
          {boqResult && (
            <div className="mx-6 mb-6 p-5 rounded-lg bg-surface border border-outline-variant/60 shadow-md space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
                <div>
                  <div className="font-headline-md text-body-md font-bold text-primary">
                    Multi-Item BoQ Audit Completed
                  </div>
                  <div className="text-[12px] text-on-surface-variant">
                    Scanned {boqResult.total_items_scanned} items | {boqResult.compliant_items} compliant |{' '}
                    {boqResult.flagged_items} flagged ({boqResult.overall_compliance_rate}% compliance rate)
                  </div>
                </div>
                {boqResult.download_url && (
                  <a
                    href={`http://localhost:8000${boqResult.download_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-primary-container text-on-primary px-4 py-2 rounded text-label-sm font-semibold hover:bg-primary transition shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_download</span>
                    <span>Download Audited BoQ (.xlsx)</span>
                  </a>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-outline-variant/60 text-outline uppercase font-mono text-[10px]">
                      <th className="py-2">Item</th>
                      <th className="py-2">Description</th>
                      <th className="py-2">Recommended IS</th>
                      <th className="py-2">QCO Mandate</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqResult.items.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b border-outline-variant/30">
                        <td className="py-2 font-mono">{row.item_no || idx + 1}</td>
                        <td className="py-2 text-primary font-medium max-w-xs truncate">
                          {row.description || row.original_description}
                        </td>
                        <td className="py-2 font-mono text-secondary font-bold">
                          {row.recommended_is_code || '—'}
                        </td>
                        <td className="py-2 text-on-surface-variant">{row.mandatory_qco || 'No'}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === 'PASS'
                                ? 'bg-tertiary-fixed text-tertiary'
                                : 'bg-secondary-fixed text-secondary'
                            }`}
                          >
                            {row.status || 'FLAGGED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PDF Upload Result Display */}
          {pdfResult && (
            <div className="mx-6 mb-6 p-5 rounded-lg bg-surface border border-outline-variant/60 shadow-md space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
                <div>
                  <div className="font-headline-md text-body-md font-bold text-primary">
                    Tender RFP Scrutiny Scorecard
                  </div>
                  <div className="text-[12px] text-on-surface-variant">
                    {pdfResult.document_name} ({pdfResult.total_pages} pages) | Risk Rating:{' '}
                    <span className="font-bold text-secondary">{pdfResult.risk_rating}</span> | Score:{' '}
                    <span className="font-bold text-primary">{pdfResult.overall_compliance_score}%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/rfp-scanner')}
                  className="bg-primary-container text-on-primary px-4 py-2 rounded text-label-sm font-semibold hover:bg-primary transition shadow-sm flex items-center gap-1.5"
                >
                  <span>View Full Scrutinizer</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono text-outline uppercase font-bold">
                  Identified Document Sections ({pdfResult.sections_identified.length}):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pdfResult.sections_identified.map((sec, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-surface-container-lowest border border-outline-variant/40">
                      <div className="font-bold text-primary text-[12px]">{sec.title}</div>
                      <div className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                        {sec.preview}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Institutional Checklists & Legal Context (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-5">
          {/* Card 1: Statutory Checklist */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Statutory Checkpoints
              </h2>
              <span className="material-symbols-outlined text-[18px] text-primary-container">
                fact_check
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Deterministic verification against Government of India procurement mandates:
            </p>

            <ul className="space-y-3 font-body-sm text-body-sm">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <strong className="text-primary block font-headline-md text-[13px]">
                    GFR 2017 Rule 144(vii)
                  </strong>
                  <span className="text-on-surface-variant text-[12px]">
                    Technical specifications must reference Indian Standards wherever formulated.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <strong className="text-primary block font-headline-md text-[13px]">
                    Section 16 BIS Act, 2016
                  </strong>
                  <span className="text-on-surface-variant text-[12px]">
                    679+ QCO categories mandate compulsory ISI / CRS mark before public procurement.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <strong className="text-primary block font-headline-md text-[13px]">
                    CVC Anti-Tailoring Directives
                  </strong>
                  <span className="text-on-surface-variant text-[12px]">
                    Prohibits citing proprietary OEM brand names without domestic equivalence.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <strong className="text-primary block font-headline-md text-[13px]">
                    Physical ISI &amp; Nameplate Verification
                  </strong>
                  <span className="text-on-surface-variant text-[12px]">
                    AI Vision &amp; OCR cross-referencing physical CM/L license numbers against tender text.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: Unified Scrutiny Workflow */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded shadow-sm p-6 space-y-3">
            <h3 className="font-headline-md text-body-md font-bold text-primary">
              Unified Scrutiny Workflow
            </h3>
            <p className="text-[12px] text-on-surface-variant">
              Every tender undergoes a 3-step statutory compliance audit:
            </p>
            <ol className="space-y-3 pt-1 text-[12px] text-on-surface">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-primary block font-medium">Ingest &amp; Extract</strong>
                  <span className="text-on-surface-variant">
                    Input raw tender clauses, PDF tender documents, Excel BoQs, or equipment nameplates.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-primary block font-medium">Cross-Reference</strong>
                  <span className="text-on-surface-variant">
                    Audit against 52+ active Indian Standards, 15+ Quality Control Orders, and CVC directives.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-primary block font-medium">Repair &amp; Certify</strong>
                  <span className="text-on-surface-variant">
                    Handoff to Specification Builder for redline diff and 1-click official PDF certification.
                  </span>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
