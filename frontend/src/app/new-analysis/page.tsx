'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAnalysisPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'describe' | 'specs' | 'upload'>('describe');
  const [descriptionText, setDescriptionText] = useState(
    '50 kVA three-phase distribution transformer for outdoor installation, 11 kV/433 V, mineral oil immersed, ONAN cooling. The unit will serve a municipal substation and should include routine and type test requirements, earthing provisions, and applicable BIS certification.'
  );
  const [selectedLang, setSelectedLang] = useState('en');
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(1);
  const [pipelineStatusText, setPipelineStatusText] = useState('Scanning National Standards Registry...');
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Parametric Spec State
  const [domainCategory, setDomainCategory] = useState('Electrotechnical (ETD)');
  const [nominalVoltage, setNominalVoltage] = useState('11,000 V / 433 V');
  const [powerRating, setPowerRating] = useState('50 kVA');
  const [coolingMechanism, setCoolingMechanism] = useState('ONAN (Mineral Oil Immersed)');
  const [efficiencyLevel, setEfficiencyLevel] = useState('BEE 4-Star / Level-2 Maximum Losses');

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const triggerAnalysisRun = () => {
    setPipelineActive(true);
    setPipelineStep(1);
    setPipelineStatusText('Parsing semantic attributes & product taxonomy...');

    setTimeout(() => {
      setPipelineStep(2);
      setPipelineStatusText('Scanning National Standards Registry (ETD-16 Sectional Committee)...');
    }, 800);

    setTimeout(() => {
      setPipelineStep(3);
      setPipelineStatusText('Cross-referencing statutory QCOs & mandatory ISI mark mandates...');
    }, 1600);

    setTimeout(() => {
      setPipelineStep(4);
      setPipelineStatusText('Reconciling normative clauses against IS 1180 (Part 1):2014 and IS 2026...');
    }, 2400);

    setTimeout(() => {
      setPipelineActive(false);
      setAnalysisComplete(true);
    }, 3200);
  };

  const handleClear = () => {
    setDescriptionText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Navigation / Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-label-eyebrow text-[11px] tracking-[2px] text-secondary font-bold uppercase">
              WORKSPACE / NEW ANALYSIS
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span className="font-code-sm text-[11px] text-outline">DOC-ID: BIS-2025-0841</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary font-bold tracking-tight">
            New standards analysis
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Describe the product or upload a technical specification to identify applicable Indian Standards.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center self-start sm:self-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-tertiary-fixed/40 border border-on-tertiary-container/30 text-tertiary font-label-md text-label-sm">
            <span
              className="material-symbols-outlined text-[15px] text-on-tertiary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
            <span className="font-semibold text-tertiary">Drafts are private</span>
          </div>
        </div>
      </div>

      {/* Main Grid (8 Cols Left, 4 Cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT CARD: Main Workbench Form (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/60 rounded shadow-sm flex flex-col">
          {/* Interactive Tabs */}
          <div className="flex items-center px-6 pt-4 border-b border-outline-variant/40 gap-8 overflow-x-auto select-none">
            <button
              className={`flex items-center gap-2 pb-3 px-1 font-body-md text-body-md transition-all ${
                activeTab === 'describe'
                  ? 'text-primary font-semibold border-b-2 border-secondary'
                  : 'text-on-surface-variant font-medium hover:text-on-surface border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab('describe')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Describe product</span>
            </button>
            <button
              className={`flex items-center gap-2 pb-3 px-1 font-body-md text-body-md transition-all ${
                activeTab === 'specs'
                  ? 'text-primary font-semibold border-b-2 border-secondary'
                  : 'text-on-surface-variant font-medium hover:text-on-surface border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab('specs')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">rule</span>
              <span>Technical specification</span>
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
              <span>Upload document</span>
            </button>
          </div>

          <div className="p-6">
            {/* Tab 1: Describe Product */}
            {activeTab === 'describe' && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    className="font-headline-md text-body-md font-semibold text-on-surface flex items-center gap-1.5"
                    htmlFor="product-spec-input"
                  >
                    <span>Product or requirement description</span>
                    <span className="text-error font-bold">*</span>
                  </label>
                  <div className="inline-flex items-center gap-1 text-primary-container font-label-md text-label-sm bg-surface-container px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    <span>Natural language supported</span>
                  </div>
                </div>

                {/* Large Textarea */}
                <div className="relative">
                  <textarea
                    id="product-spec-input"
                    rows={6}
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="e.g. 50 kVA three-phase distribution transformer for outdoor installation, 11 kV/433 V, mineral oil immersed..."
                    className="w-full h-44 p-4 border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container text-body-md text-on-surface leading-relaxed font-body-md bg-surface/60 resize-none transition-all placeholder:text-outline/70"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 text-outline font-code-sm text-[11px] pointer-events-none bg-surface-container-lowest/80 px-2 py-0.5 rounded">
                    <span>{descriptionText.length} characters</span>
                  </div>
                </div>

                {/* Extraction Hints / Suggested Clauses */}
                <div className="bg-surface-container-low rounded p-3 flex flex-wrap items-center gap-2 border border-outline-variant/30">
                  <span className="font-label-eyebrow text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mr-1">
                    Detected attributes:
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/50 text-body-sm text-[12px] text-on-surface font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Transformer (Distribution)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/50 text-body-sm text-[12px] text-on-surface font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    11 kV / 433 V
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/50 text-body-sm text-[12px] text-on-surface font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    ONAN Mineral Oil
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/50 text-body-sm text-[12px] text-on-surface font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Substation Grade
                  </span>
                </div>

                {/* Bottom Control Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 mt-2 border-t border-outline-variant/40">
                  <div className="flex flex-col">
                    <label
                      className="font-label-eyebrow text-label-eyebrow text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5"
                      htmlFor="language-select"
                    >
                      Query language
                    </label>
                    <div className="relative">
                      <select
                        id="language-select"
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="appearance-none border border-outline-variant bg-surface-container-lowest rounded px-3 py-2 text-body-sm text-on-surface font-medium w-40 shadow-sm focus:border-primary focus:outline-none cursor-pointer pr-8"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="mr">मराठी (Marathi)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="te">తెలుగు (Telugu)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                        <option value="gu">ગુજરાતી (Gujarati)</option>
                        <option value="kn">ಕನ್ನಡ (Kannada)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-outline pointer-events-none">
                        arrow_drop_down
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-4 py-2 text-body-sm font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Clear formulation
                    </button>
                    <button
                      type="button"
                      id="btn-analyze"
                      disabled={pipelineActive || !descriptionText.trim()}
                      onClick={triggerAnalysisRun}
                      className="bg-secondary hover:bg-secondary/90 active:bg-secondary text-on-secondary font-semibold font-body-sm px-6 py-2.5 rounded shadow-sm inline-flex items-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-60"
                    >
                      {pipelineActive ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">
                            refresh
                          </span>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">manage_search</span>
                          <span>Analyze specification</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Technical Specification */}
            {activeTab === 'specs' && (
              <div className="flex flex-col space-y-4">
                <div className="p-4 bg-surface-container rounded border border-outline-variant/40">
                  <h4 className="font-headline-md text-body-md text-primary font-semibold mb-1">
                    Parametric Specification Builder
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Input direct engineering parameters to auto-generate statutory BIS compliance queries.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-md text-label-sm text-on-surface font-medium mb-1">
                        Standard Domain Category
                      </label>
                      <input
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm text-on-surface"
                        type="text"
                        value={domainCategory}
                        onChange={(e) => setDomainCategory(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-sm text-on-surface font-medium mb-1">
                        Rated Nominal Voltage
                      </label>
                      <input
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm text-on-surface"
                        type="text"
                        value={nominalVoltage}
                        onChange={(e) => setNominalVoltage(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-sm text-on-surface font-medium mb-1">
                        Power Rating
                      </label>
                      <input
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm text-on-surface"
                        type="text"
                        value={powerRating}
                        onChange={(e) => setPowerRating(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-sm text-on-surface font-medium mb-1">
                        Cooling Mechanism
                      </label>
                      <input
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm text-on-surface"
                        type="text"
                        value={coolingMechanism}
                        onChange={(e) => setCoolingMechanism(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-label-md text-label-sm text-on-surface font-medium mb-1">
                        Efficiency Mandate / Star Rating
                      </label>
                      <input
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm text-on-surface"
                        type="text"
                        value={efficiencyLevel}
                        onChange={(e) => setEfficiencyLevel(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={triggerAnalysisRun}
                    className="bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold font-body-sm px-6 py-2.5 rounded shadow-sm inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_search</span>
                    <span>Analyze Parametric Criteria</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Upload Document */}
            {activeTab === 'upload' && (
              <div className="flex flex-col space-y-4">
                <label className="border-2 border-dashed border-outline-variant rounded p-8 text-center bg-surface hover:bg-surface-container-low transition-colors cursor-pointer block">
                  <span className="material-symbols-outlined text-[44px] text-primary-container mb-2">
                    cloud_upload
                  </span>
                  <p className="font-headline-md text-body-md font-semibold text-primary">
                    {uploadedFile ? `Selected: ${uploadedFile}` : 'Drag and drop tender Schedule of Requirements (SOR)'}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Supports PDF, DOCX, scanned RFP annexures up to 50MB
                  </p>
                  <div className="mt-4">
                    <span className="inline-block px-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-semibold text-primary shadow-sm">
                      Browse files
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {uploadedFile && (
                  <div className="flex items-center justify-between p-3 bg-surface-container rounded border border-outline-variant/50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary-container">description</span>
                      <span className="font-body-sm text-primary font-semibold">{uploadedFile}</span>
                    </div>
                    <button
                      onClick={triggerAnalysisRun}
                      className="bg-secondary text-on-secondary px-4 py-1.5 rounded font-label-md text-label-sm font-semibold hover:bg-secondary/90 transition"
                    >
                      Run Deep OCR &amp; Standards Scan →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Pipeline Simulation Toast (Appears during/after run) */}
          {pipelineActive && (
            <div
              className="mx-6 mb-6 p-4 rounded bg-primary text-on-primary flex items-center justify-between animate-fade-in-up"
              id="pipeline-status"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-surface-variant border-t-transparent animate-spin" />
                <div className="flex flex-col">
                  <span className="font-headline-md text-body-sm font-semibold text-on-primary">
                    {pipelineStatusText}
                  </span>
                  <span className="font-body-sm text-[11px] text-on-primary-container">
                    Cross-referencing Sectional Committee ETD 16 (Transformers) and IS 1180 (Part 1):2014
                  </span>
                </div>
              </div>
              <span className="font-code-sm text-[11px] text-surface-variant">
                Step {pipelineStep} of 4
              </span>
            </div>
          )}

          {/* Completed State Card */}
          {analysisComplete && (
            <div className="mx-6 mb-6 p-4 rounded bg-tertiary-fixed/40 border border-on-tertiary-container/40 flex items-center justify-between animate-fade-in-up">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-tertiary-container text-[24px]">check_circle</span>
                <div>
                  <div className="font-headline-md text-body-sm font-bold text-tertiary">
                    Analysis Completed Successfully
                  </div>
                  <div className="text-[12px] text-on-surface-variant">
                    Found 1 primary standard (IS 1180:2014), 3 normative references, and 1 mandatory Quality Control Order.
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push('/specification-builder')}
                className="bg-primary-container text-on-primary px-4 py-2 rounded text-label-sm font-semibold hover:bg-primary transition shadow-sm flex items-center gap-1.5"
              >
                <span>Draft Specification</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Guidelines & Checklist (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-5">
          {/* Card 1: Checklist Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                What the analysis checks
              </h2>
              <span className="material-symbols-outlined text-[18px] text-primary-container">
                fact_check
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Automated cross-referencing against the active Bureau of Indian Standards directory:
            </p>
            <ul className="space-y-0 divide-y divide-outline-variant/30">
              <li className="py-2.5 flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-[18px] text-on-tertiary-container mt-0.5 shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">
                    Applicable product standards
                  </span>
                  <span className="font-code-sm text-[11px] text-outline">
                    Primary specifications &amp; quality marks
                  </span>
                </div>
              </li>
              <li className="py-2.5 flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-[18px] text-on-tertiary-container mt-0.5 shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">
                    Normative and allied references
                  </span>
                  <span className="font-code-sm text-[11px] text-outline">
                    Gaskets, bush connectors, insulating fluids
                  </span>
                </div>
              </li>
              <li className="py-2.5 flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-[18px] text-on-tertiary-container mt-0.5 shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">
                    Test methods and safety standards
                  </span>
                  <span className="font-code-sm text-[11px] text-outline">
                    Dielectric test, temperature-rise protocols
                  </span>
                </div>
              </li>
              <li className="py-2.5 flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-[18px] text-on-tertiary-container mt-0.5 shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">
                    Current editions and amendments
                  </span>
                  <span className="font-code-sm text-[11px] text-outline">
                    Latest gazetted revisions &amp; errata slips
                  </span>
                </div>
              </li>
              <li className="pt-2.5 flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-[18px] text-on-tertiary-container mt-0.5 shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">
                    BIS, CRS and other certifications
                  </span>
                  <span className="font-code-sm text-[11px] text-outline">
                    Scheme I (ISI mark) and QCO applicability
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: Supported Languages Card */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded p-5 flex flex-col">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[16px] text-outline">translate</span>
              <span className="font-label-eyebrow text-label-eyebrow font-bold text-on-surface-variant uppercase tracking-wider">
                SUPPORTED LANGUAGES
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed font-medium">
              English, हिन्दी, मराठी, தமிழ், తెలుగు, বাংলা, ગુજરાતી, ಕನ್ನಡ, മലയാളം and ਪੰਜਾਬੀ.
            </p>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-2 border-t border-outline-variant/30 pt-2">
              Official tender documents can be processed in all 8th Schedule Indian languages with semantic clause reconciliation.
            </p>
          </div>

          {/* Card 3: Regulatory Disclaimer Note */}
          <div className="border-l-2 border-secondary-container bg-surface-container-lowest/60 rounded-r p-3.5 flex items-start gap-2.5 border-t border-r border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">info</span>
            <p className="font-body-sm text-[12px] italic text-on-surface-variant leading-normal">
              Always verify final requirements against the latest authoritative BIS publication or ministry gazette notification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
