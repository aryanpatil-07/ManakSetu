'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  FileText,
  CheckCircle,
  ArrowUpRight,
  Zap,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Scale,
  Award,
  Network,
  GitCompare,
  FileCode2,
  ExternalLink,
  HelpCircle,
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
    title: 'Button A: Municipal Water Pipe',
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
    title: 'Button B: Distribution Transformer',
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
    title: 'Button C: TMT Rebars',
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

export default function DashboardPage() {
  const [activePreset, setActivePreset] = useState<string>('pipe');
  const [inputText, setInputText] = useState<string>(PRESETS[0].text);
  const [selectedCategory, setSelectedCategory] = useState<string>(PRESETS[0].category);
  const [loading, setLoading] = useState(false);

  // Results State
  const [auditResult, setAuditResult] = useState<TenderAuditResponse | null>(null);
  const [diffResult, setDiffResult] = useState<HarmonizeDiffResponse | null>(null);
  const [focusedStandard, setFocusedStandard] = useState<string>('IS 4984:2016');

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
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
    } catch (err) {
      console.error('Audit failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 md:p-10 shadow-2xl">
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5" /> GFR 144(vii) & BIS Act 2016 Compliant Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Scale className="w-3.5 h-3.5" /> CVC OM No. 03-05-1-CTE-9
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Automated Standards Harmonization & Tender Anti-Tailoring Engine
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Eliminate restrictive OEM lock-ins, detect obsolete Indian Standards, convert foreign
            specifications (ASTM/DIN/ISO), and enforce mandatory Gazetted QCO ISI marks in seconds.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/rfp-scanner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/40 transition"
            >
              Scrutinize Tender RFP (PDF) <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/boq-auditor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/40 transition"
            >
              Batch Audit Excel BoQ (.xlsx) <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK-FILL PRESET BUTTONS FOR JUDGES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Select Judge Demonstration Scenario (1-Click Presets)
            </h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Zero typing required during live judging
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {preset.title}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono leading-snug">
                    {preset.subtitle}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] uppercase font-semibold text-slate-500">
                  {preset.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TENDER CLAUSE INPUT WORKSPACE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Tender Clause Input & Specification Verifier
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Category:</span>
            <input
              type="text"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
          placeholder="Paste NIT / RFP technical clauses or tender requirements here..."
        />

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Hybrid BM25 + Dense BGE + CVC Rule Matcher + Gazette QCO Database
          </div>

          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-950/40 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Cross-Referencing Standards...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Audit & Harmonize Specification
              </>
            )}
          </button>
        </div>
      </div>

      {/* SCORECARD BANNER */}
      {auditResult && (
        <div className="space-y-6">
          <AuditScorecard
            score={auditResult.compliance_score}
            overallStatus={auditResult.overall_status}
            criticalCount={auditResult.critical_issues_count}
            highCount={auditResult.high_issues_count}
            mediumCount={auditResult.medium_issues_count}
            tenderId={auditResult.tender_id}
          />

          {/* 3-COLUMN SPLIT RESULTS WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMN 1: REGULATORY & QCO DOSSIER */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  <h4 className="font-bold text-white text-sm">Regulatory & QCO Legal Dossier</h4>
                </div>

                <div className="mt-4 space-y-4 text-xs">
                  {/* Active Standard Info */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Recommended Indian Standard
                    </span>
                    <div className="text-base font-bold text-emerald-400 mt-1">
                      {focusedStandard}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Conforms to latest gazetted revision under BIS Act, 2016.
                    </p>
                  </div>

                  {/* QCO Statutory Status */}
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-purple-300">
                        Compulsory QCO Order
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Scheme-I (ISI Mark)
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-1">
                      Compulsory BIS Certification Mandated
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Non-compliance attracts criminal penalties under Section 29 of the BIS Act, 2016.
                    </p>
                  </div>

                  {/* CVC Anti-Tailoring Status */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-300">
                        CVC Anti-Tailoring Linter
                      </span>
                      <span className="text-[10px] font-bold text-amber-400">
                        {auditResult.violations.length} Flags
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-300 text-[11px]">
                      {auditResult.violations.slice(0, 3).map((v, i) => (
                        <li key={i}>
                          <span className="font-semibold text-white">{v.rule_name}:</span> {v.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-slate-500">
                Statutory Authority: Bureau of Indian Standards & Central Vigilance Commission
              </div>
            </div>

            {/* COLUMN 2: INTERACTIVE STANDARDS HIERARCHY GRAPH */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[520px]">
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Normative & Equivalence Graph
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {focusedStandard}
                </span>
              </div>
              <div className="flex-1 w-full h-full relative">
                <StandardsGraph focusStandard={focusedStandard} />
              </div>
            </div>

            {/* COLUMN 3: SIDE-BY-SIDE DIFF & BID-READY CLAUSE STUDIO */}
            <div className="space-y-4">
              {/* Diff Summary Card */}
              {diffResult && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <GitCompare className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                      Rectifications Performed ({diffResult.diff_summary.length})
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {diffResult.diff_summary.map((summary, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300 leading-snug"
                      >
                        {summary}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clause Studio with 1-Click Copy & PDF Certificate */}
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
                    'Verify current BIS manufacturer license status on manakonline.in',
                    'Enforce compulsory ISI / CRS mark on physical consignments',
                    'Demand lot-wise NABL accredited test certificates',
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

          {/* SIDE-BY-SIDE DUAL DIFF VIEWER */}
          {diffResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Before vs. After: Technical Specification Redline Diff
                </h3>
              </div>
              <DiffViewer
                originalText={diffResult.original_text}
                recommendedText={diffResult.harmonized_text}
                itemTitle={`Specification Harmonization: ${selectedCategory}`}
                reason="Redline audit comparing biased, non-compliant input against standardized BIS/CVC compliant specification."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
