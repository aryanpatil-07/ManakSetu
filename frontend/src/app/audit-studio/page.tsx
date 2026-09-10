'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  FileText,
  Zap,
  RefreshCw,
  Sparkles,
  Scale,
  GitCompare,
  ArrowLeft,
  FileCheck,
  Table,
} from 'lucide-react';
import { AuditScorecard } from '@/components/AuditScorecard';
import { StandardsGraph } from '@/components/StandardsGraph';
import { DiffViewer } from '@/components/DiffViewer';
import { ClausePreview } from '@/components/ClausePreview';
import {
  auditTender,
  harmonizeText,
  TenderAuditResponse,
  HarmonizeDiffResponse,
} from '@/lib/api';

// 3 Authoritative Quick-Fill Presets for Judge Evaluation
const PRESETS = [
  {
    id: 'pipe',
    title: 'Preset A: Municipal Water Pipeline',
    tag: 'WATER & SANITATION',
    subtitle: 'Obsolete IS 4984:1995 + ASTM D3035 + Supreme Make + PN10',
    category: 'HDPE Water Supply Pipes',
    text: `TECHNICAL SPECIFICATIONS FOR HDPE PIPELINE AUGMENTATION:
1. Pipes shall strictly conform to IS 4984:1995 (Fourth Revision) or ASTM D3035.
2. Only Supreme or Astral make pipes shall be accepted by the Engineer-in-Charge.
3. Pipe raw material grade shall be PE-80, pressure rating PN 10, SDR 11.
4. BIS ISI Mark under Pipes QCO 2020 is optional for imported consignments.
5. Minimum annual average financial turnover of bidder must be Rs 650 Crores.`,
  },
  {
    id: 'transformer',
    title: 'Preset B: Distribution Transformer',
    tag: 'POWER & ENERGY',
    subtitle: '500 kVA 11kV/433V + IS 1180:1989 + QCO Statutory Mandate',
    category: 'Distribution Transformers',
    text: `TECHNICAL SPECIFICATIONS FOR SUBSTATION DISTRIBUTION TRANSFORMERS:
1. Supply of 500 kVA, 11 kV / 433 V, 3-Phase 50 Hz outdoor oil-immersed distribution transformer.
2. Transformer design, manufacture and testing shall conform strictly to IS 1180:1989.
3. Proprietary OEM components: only ABB or Siemens high-voltage bushings permitted.
4. Testing of transformer insulating oil as per obsolete IS 335:1993.
5. Compliance with Electrical Transformers (Quality Control) Order is left to bidder declaration.`,
  },
  {
    id: 'steel',
    title: 'Preset C: TMT Rebars & Civil Works',
    tag: 'CPWD & INFRASTRUCTURE',
    subtitle: '50 MT Tata Tiscon Fe500D rebars 16mm + ASTM A615 Lock-in',
    category: 'TMT Reinforcement Steel',
    text: `TECHNICAL SPECIFICATIONS FOR CIVIL WORKS REINFORCEMENT STEEL:
1. Supply of 50 Metric Tonnes Thermo-Mechanically Treated (TMT) bars 16mm diameter.
2. Reinforcement steel shall strictly be Tata Tiscon or Jindal Panther make only.
3. Material shall conform to ASTM A615 Grade 60 without domestic Indian Standard equivalence.
4. Bidders must have sole authorized distributor certificate directly from primary producer.
5. Steel Quality Control Order (QCO) Scheme-I BIS certification may be submitted post-award.`,
  },
];

export default function AuditStudioPage() {
  const [activePreset, setActivePreset] = useState<string>('pipe');
  const [inputText, setInputText] = useState<string>(PRESETS[0].text);
  const [selectedCategory, setSelectedCategory] = useState<string>(PRESETS[0].category);
  const [loading, setLoading] = useState(false);

  // Results State
  const [auditResult, setAuditResult] = useState<TenderAuditResponse | null>(null);
  const [diffResult, setDiffResult] = useState<HarmonizeDiffResponse | null>(null);
  const [focusedStandard, setFocusedStandard] = useState<string>('IS 4984:2016');

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    setActivePreset(preset.id);
    setInputText(preset.text);
    setSelectedCategory(preset.category);
  };

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      // 1. Audit tender text (standards lifecycle, CVC rules, score)
      const audit = await auditTender({
        tender_id: `NIT-${Date.now().toString().slice(-6)}`,
        title: selectedCategory,
        text_content: inputText,
      });
      setAuditResult(audit);

      // Determine target standard for focused subgraph and diff
      let targetStd = 'IS 4984:2016';
      if (audit.detected_standards && audit.detected_standards.length > 0) {
        targetStd =
          audit.detected_standards[0].recommended_standard ||
          audit.detected_standards[0].specified;
      }
      setFocusedStandard(targetStd);

      // 2. Harmonize text (clean brand names, convert foreign codes, generate diff)
      const diff = await harmonizeText(inputText, targetStd, selectedCategory);
      setDiffResult(diff);

      // Smooth scroll down to results workspace
      setTimeout(() => {
        document.getElementById('audit-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Audit failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      
      {/* ========================================================= */}
      {/* 1. PAGE HEADER & BREADCRUMB                               */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Overview
            </Link>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              LIVE INTERACTIVE WORKBENCH
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tender Clause Scrutiny & Harmonization Studio
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-3xl">
            Cross-reference tender clauses against active Bureau of Indian Standards (BIS) catalogues, 
            mandate statutory Quality Control Orders (QCOs), and eliminate restrictive CVC brand bias in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-canvas-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Statutory Engine Online
          </div>
          <Link
            href="/rfp-scanner"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <FileCheck className="w-3.5 h-3.5 text-accent-sky" />
            RFP PDF
          </Link>
          <Link
            href="/boq-auditor"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <Table className="w-3.5 h-3.5 text-accent-amber" />
            BoQ Excel
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 1-CLICK JUDGE DEMONSTRATION PRESETS                    */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Judge Demonstration Presets (1-Click Instant Evaluation)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Zero typing required for live jury evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-canvas-900 to-accent-blue/15 border-accent-sky shadow-cyan-glow ring-1 ring-accent-sky/40'
                    : 'bg-canvas-900/70 border-slate-800 hover:border-slate-700 hover:bg-canvas-900 text-slate-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {preset.tag}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-accent-cyan font-mono">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
                        SELECTED
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {preset.title}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono leading-snug">
                    {preset.subtitle}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Category: {preset.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. INPUT SPECIFICATION EDITOR WORKSPACE                   */}
      {/* ========================================================= */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-cyan" />
            <span className="font-bold text-white text-sm">Specification Input Clause</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Category:</span>
            <input
              type="text"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-canvas-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:border-accent-sky outline-none transition"
            />
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={7}
          className="w-full bg-canvas-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-200 focus:outline-none focus:border-accent-sky transition leading-relaxed"
          placeholder="Paste NIT / RFP technical clauses or tender requirements here..."
        />

        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Hybrid BM25 + Dense BGE + CVC Rule Matcher + Gazette QCO Database
          </div>

          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-accent-blue via-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 disabled:opacity-50 text-white shadow-xl shadow-accent-blue/30 hover:shadow-cyan-glow transition duration-200"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" /> Cross-Referencing Standards...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-white" /> Audit & Harmonize Specification
              </>
            )}
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. COMPREHENSIVE AUDIT RESULTS WORKSPACE                  */}
      {/* ========================================================= */}
      {auditResult && (
        <div id="audit-results-section" className="space-y-8 pt-4">
          
          {/* 1. Scorecard Banner */}
          <AuditScorecard
            score={auditResult.compliance_score}
            overallStatus={auditResult.overall_status}
            criticalCount={auditResult.critical_issues_count}
            highCount={auditResult.high_issues_count}
            mediumCount={auditResult.medium_issues_count}
            tenderId={auditResult.tender_id}
          />

          {/* 2. 3-Column Technical Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Col 1: Regulatory & QCO Dossier */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
                    Regulatory & QCO Legal Dossier
                  </h3>
                </div>

                <div className="mt-4 space-y-3.5 text-xs">
                  {/* Recommended Standard */}
                  <div className="p-4 rounded-2xl bg-canvas-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      Recommended Indian Standard
                    </span>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {focusedStandard}
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Conforms to latest gazetted revision under BIS Act, 2016.
                    </p>
                  </div>

                  {/* QCO Mandatory Status */}
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-purple-300 font-mono">
                        Compulsory QCO Order
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                        Scheme-I (ISI Mark)
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      Compulsory BIS Certification Mandated
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Non-compliance attracts criminal penalties under Section 29 of the BIS Act, 2016.
                    </p>
                  </div>

                  {/* CVC Anti-Tailoring Status */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-300 font-mono">
                        CVC Anti-Tailoring Linter
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 font-mono">
                        {auditResult.violations.length} Flags
                      </span>
                    </div>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px]">
                      {auditResult.violations.slice(0, 3).map((v, i) => (
                        <li key={i}>
                          <span className="font-semibold text-white">{v.rule_name}:</span> {v.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                Statutory Authority: Bureau of Indian Standards & Central Vigilance Commission
              </div>
            </div>

            {/* Col 2: Interactive Standards Cytoscape Graph */}
            <div className="lg:col-span-1">
              <StandardsGraph focusStandard={focusedStandard} />
            </div>

            {/* Col 3: Rectification & Clause Studio */}
            <div className="space-y-4">
              
              {/* Rectification Summary */}
              {diffResult && (
                <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-accent-cyan" />
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                      Rectifications Applied ({diffResult.diff_summary.length})
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {diffResult.diff_summary.map((summary, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-2.5 rounded-xl bg-canvas-950 border border-slate-800 text-slate-300 leading-snug"
                      >
                        {summary}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Synthesized Clause Component */}
              {auditResult.generated_compliant_clause && (
                <ClausePreview
                  clauseText={auditResult.generated_compliant_clause}
                  category={selectedCategory}
                  regulations={[
                    `${focusedStandard} (Latest Gazetted Revision)`,
                    'BIS Act 2016 (Section 16 & Section 29)',
                    'General Financial Rules (GFR 2017) Rule 144(vii)',
                    'CVC Office Memorandum No. 03-05-1-CTE-9',
                  ]}
                  checklist={[
                    'Verify valid BIS license on manakonline.in',
                    'Enforce compulsory ISI / CRS mark on consignments',
                    'Demand batch-wise NABL accredited test certificates',
                  ]}
                  certificateData={{
                    tenderId: auditResult.tender_id,
                    tenderTitle: `${selectedCategory} Procurement Specifications`,
                    department: 'National Public Procurement Entity',
                    complianceScore: auditResult.compliance_score,
                    overallStatus: auditResult.overall_status,
                    recommendedStandard: focusedStandard,
                    standardTitle: `${selectedCategory} Standard Specifications`,
                    qcoMandatory: true,
                    qcoOrder: 'Statutory Quality Control Order (QCO)',
                    detectedStandards: auditResult.detected_standards,
                    violations: auditResult.violations,
                    synthesizedClause: auditResult.generated_compliant_clause,
                  }}
                />
              )}

            </div>

          </div>

          {/* 3. Redline Diff Viewer */}
          {diffResult && (
            <div className="pt-2">
              <DiffViewer
                originalText={diffResult.original_text}
                recommendedText={diffResult.harmonized_text}
                itemTitle={`Specification Harmonization: ${selectedCategory}`}
                reason="Side-by-side redline audit contrasting defective, non-compliant input against standardized BIS/CVC compliant technical specification."
              />
            </div>
          )}

        </div>
      )}

    </div>
  );
}
