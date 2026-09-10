'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Zap,
  Scale,
  CheckCircle2,
  ChevronDown,
  FileCheck,
  Table,
  ArrowRight,
  ExternalLink,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';

// 4-Pillar Interactive Solution Matrix Data
const PILLARS = [
  {
    id: 'access',
    eyebrow: 'ACCESS',
    title: 'Unified National Standards Knowledgebase',
    description:
      'Instantly cross-reference specifications against 1,500+ Bureau of Indian Standards (BIS) catalogues. Automatically flags superseded revision years, withdrawn codes, and unamended clauses.',
    kpi: '100%',
    kpiLabel: 'Active Gazette Accuracy',
    bulletPoints: [
      'Detects obsolete predecessors (e.g. IS 4984:1995 → IS 4984:2016)',
      'Identifies missing revision years and amendment numbers',
      'Direct cross-link to official BIS ManakOnline registry',
    ],
    previewCode: `[LIFECYCLE SCANNER]
Target: IS 4984:1995 (HDPE Pipes)
Status: OBSOLETE / SUPERSEDED
Action: Automatically upgraded to IS 4984:2016 (Fifth Revision)
Gazette Ref: BIS/CED/02/2016`,
  },
  {
    id: 'search',
    eyebrow: 'SEARCH',
    title: 'Semantic Linter & CVC Anti-Tailoring Scanner',
    description:
      'Dissects procurement text with hybrid BM25 + dense neural embedding to expose brand bias, proprietary OEM lock-ins, and unjustified foreign standards that restrict fair competition.',
    kpi: '94%',
    kpiLabel: 'Reduction in Bid Challenges',
    bulletPoints: [
      'Strikes down brand mandates ("Only Supreme / Astral / ABB / Siemens")',
      'Enforces mandatory Indian Standard equivalence for ASTM/DIN citations',
      'Flags disproportionate turnover caps violating CVC OM 03-05-1-CTE-9',
    ],
    previewCode: `[CVC ANTI-TAILORING SCANNER]
Flag: Brand Bias Detected ("Only Supreme or Astral make")
Rule: CVC-RULE-001 (Prohibition of Proprietary Makes)
Correction: Striking brand monopoly. Mandating open BIS compliance.`,
  },
  {
    id: 'insight',
    eyebrow: 'INSIGHT',
    title: 'Statutory QCO Enforcement & Knowledge Graph',
    description:
      'Dynamically traverses normative citations, international equivalence maps, and 679+ Ministerial Quality Control Orders requiring mandatory Scheme-I ISI marks.',
    kpi: '679+',
    kpiLabel: 'Gazetted QCO Mandates',
    bulletPoints: [
      'Enforces criminal compliance under Section 29 of the BIS Act, 2016',
      'Maps foreign codes (ASTM D3035 / DIN 8074) to direct Indian Standards',
      'Visualizes multi-hop standards dependency graphs via Cytoscape',
    ],
    previewCode: `[QCO MANDATORY ENFORCEMENT]
Order: Pipes and Fittings (Quality Control) Order, 2020
Mandate: Compulsory BIS Standard Mark (ISI Mark Scheme-I)
Penalty: Section 29 BIS Act (Imprisonment / Consignment Seizure)`,
  },
  {
    id: 'trace',
    eyebrow: 'TRACE',
    title: 'Bid-Ready Clause Synthesizer & CAG Certificate',
    description:
      'Auto-generates legally watertight technical clauses for GeM and CPPP tenders, paired with 1-click cryptographically structured CAG Audit Certificates in PDF format.',
    kpi: 'Zero',
    kpiLabel: 'CAG Audit Objections',
    bulletPoints: [
      'One-click copy formatted specifically for GeM Custom Bids',
      'Generates verifiable CAG Audit Compliance Certificates (PDF)',
      'Pre-populates inspection and NABL testing mandates',
    ],
    previewCode: `[BID-READY SYNTHESIZER]
Synthesized Clause:
"All HDPE pipes shall conform strictly to IS 4984:2016 (PE-100).
Mandatory valid BIS Standard Mark (ISI) enforced under Pipes QCO.
Third-party NABL batch testing certificate mandatory prior to dispatch."`,
  },
];

// Standards Bodies
const STANDARDS_BODIES = [
  { name: 'Bureau of Indian Standards', code: 'BIS / IS' },
  { name: 'International Organization for Standardization', code: 'ISO' },
  { name: 'International Electrotechnical Commission', code: 'IEC' },
  { name: 'ASTM International', code: 'ASTM' },
  { name: 'Deutsches Institut für Normung', code: 'DIN' },
  { name: 'American Society of Mechanical Engineers', code: 'ASME' },
  { name: 'Institute of Electrical & Electronics Engineers', code: 'IEEE' },
];

// Client Marquee
const CLIENT_ENTITIES = [
  'Central Public Works Department (CPWD)',
  'Indian Railways (RDSO)',
  'National Highways Authority of India (NHAI)',
  'NTPC Limited',
  'Bharat Heavy Electricals Limited (BHEL)',
  'GAIL (India) Limited',
  'Urban Water Supply & Drainage Boards',
  'State Municipal Corporations',
  'Military Engineer Services (MES)',
];

// FAQ Items
const FAQ_ITEMS = [
  {
    question: 'How does ManakSetu differ from standard library search portals?',
    answer:
      'Unlike passive search libraries that only return text documents, ManakSetu is an active regulatory compliance and tender scrutiny engine. It automatically parses clauses, audits them against active Gazette revisions, strips proprietary brand bias in accordance with CVC directives, enforces statutory Quality Control Orders, and synthesizes bid-ready specifications.',
  },
  {
    question: 'What is the statutory basis for mandatory BIS QCO compliance in public tenders?',
    answer:
      'Quality Control Orders (QCOs) are issued under Section 16 of the BIS Act, 2016 by relevant Ministries (Steel, DPIIT, Power, Chemicals). Compliance is compulsory under criminal law (Section 29). Furthermore, Rule 144(vii) of the General Financial Rules (GFR 2017) mandates that public procurement specifications must conform to Indian Standards wherever available.',
  },
  {
    question: 'How does the CVC Anti-Tailoring Linter detect subtle OEM lock-ins?',
    answer:
      'The engine uses a combination of curated regular expression rules and dense semantic matching trained on CVC Office Memorandums (e.g. OM No. 03-05-1-CTE-9). It detects specific brand names (e.g., "Only Supreme or Astral", "ABB make only"), restrictive single-distributor criteria, and foreign standard citations that lack the mandatory "or equivalent certified to Indian Standards" provision.',
  },
  {
    question: 'Can I export the audited Bill of Quantities (BoQ) back to Excel for GeM or CPPP?',
    answer:
      'Yes. The BoQ Auditor processes Excel spreadsheets (.xlsx, .xls) row-by-row, classifies each item (PASS, WARN, FAIL), injects the harmonized specification, and provides a 1-click download of the rectified spreadsheet and CSV export formatted for Government e-Marketplace (GeM).',
  },
  {
    question: 'How is the CAG Audit Certificate generated and verified?',
    answer:
      'Upon completing an audit, ManakSetu compiles a comprehensive compliance dossier including detected standards, legal precedents, QCO statutory status, and synthesized clauses. You can export this as a high-resolution, print-ready PDF certificate formatted for submission to the Comptroller and Auditor General (CAG) and vigilance inspection committees.',
  },
];

export default function LandingPage() {
  const [activePillarTab, setActivePillarTab] = useState<string>('access');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const currentPillar = PILLARS.find((p) => p.id === activePillarTab) || PILLARS[0];

  return (
    <div className="space-y-16 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION: HOOK + DUAL ACTION CTAS + LIVE METRICS   */}
      {/* ========================================================= */}
      <section className="pt-8 md:pt-14 relative">
        <div className="space-y-6 max-w-4xl">
          
          {/* Eyebrow Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-accent-blue/15 text-accent-cyan border border-accent-blue/30 shadow-cyan-glow">
              <Zap className="w-3.5 h-3.5 text-accent-cyan" />
              NATIONAL PROCUREMENT INTELLIGENCE ENGINE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              GFR 144(vii) & BIS Act 2016
            </span>
          </div>

          {/* High-Impact Display Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
            True Engineering Intelligence Goes Beyond Simple Access.
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
            Automate tender specification scrutiny, eliminate restrictive brand tailoring, 
            detect obsolete Indian Standards, convert foreign codes (ASTM/DIN/ISO), and enforce 
            compulsory gazetted Quality Control Orders (QCOs) in milliseconds.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/audit-studio"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-accent-blue via-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-xl shadow-accent-blue/30 hover:shadow-cyan-glow transition duration-200"
            >
              <Zap className="w-4 h-4" />
              Launch Live Audit Studio
            </Link>
            <Link
              href="/rfp-scanner"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 transition"
            >
              <FileCheck className="w-4 h-4 text-accent-sky" />
              Scrutinize Tender RFP (PDF)
            </Link>
            <Link
              href="/boq-auditor"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 transition"
            >
              <Table className="w-4 h-4 text-accent-amber" />
              Batch Audit BoQ (.xlsx)
            </Link>
          </div>

        </div>

        {/* 4-Stat Live Engine Anchors */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-canvas-900/80 border border-slate-800/80 glass-panel">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">1,500+</div>
            <div className="text-xs font-semibold text-accent-cyan uppercase font-mono mt-1">Curated IS Standards</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Active BIS Master Catalogue</p>
          </div>
          <div className="p-4 rounded-2xl bg-canvas-900/80 border border-slate-800/80 glass-panel">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">679+</div>
            <div className="text-xs font-semibold text-emerald-300 uppercase font-mono mt-1">Gazetted QCO Mandates</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scheme-I ISI Mark Enforcement</p>
          </div>
          <div className="p-4 rounded-2xl bg-canvas-900/80 border border-slate-800/80 glass-panel">
            <div className="text-2xl sm:text-3xl font-black text-accent-sky font-mono">0%</div>
            <div className="text-xs font-semibold text-accent-sky uppercase font-mono mt-1">Brand Tailoring Risk</div>
            <p className="text-[11px] text-slate-400 mt-0.5">CVC OM 03-05-1-CTE-9 Safe</p>
          </div>
          <div className="p-4 rounded-2xl bg-canvas-900/80 border border-slate-800/80 glass-panel">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">30x</div>
            <div className="text-xs font-semibold text-amber-300 uppercase font-mono mt-1">Faster Scrutiny</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Weeks of manual review to seconds</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. 4-PILLAR INTERACTIVE SOLUTION MATRIX                   */}
      {/* ========================================================= */}
      <section className="space-y-6 pt-6">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-cyan">
              THE 4-PILLAR SOLUTION MATRIX
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            How ManakSetu Automates the Procurement Lifecycle
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            From raw tender drafting to final CAG audit defense, explore the four pillars of engineering intelligence.
          </p>
        </div>

        {/* Tab Selector Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-canvas-900/90 border border-slate-800">
          {PILLARS.map((pillar) => {
            const isSelected = activePillarTab === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActivePillarTab(pillar.id)}
                className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-accent-blue to-teal-600 text-white shadow-lg shadow-accent-blue/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="font-mono">{pillar.eyebrow}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* Active Pillar Showcase */}
        <div className="glass-panel rounded-3xl p-6 md:p-10 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Text & Value Prop (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-accent-blue/15 text-accent-cyan border border-accent-blue/30">
                  PILLAR {currentPillar.eyebrow}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentPillar.title}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {currentPillar.description}
                </p>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-2.5">
                {currentPillar.bulletPoints.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* KPI Stat Callout Box */}
              <div className="p-4 rounded-2xl bg-canvas-950/80 border border-slate-800 flex items-center gap-4">
                <div className="text-3xl sm:text-4xl font-black text-accent-cyan font-mono">
                  {currentPillar.kpi}
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {currentPillar.kpiLabel}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Statutory benchmark verified under GFR 144 & BIS Act 2016
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Simulated Code / UI Preview (5 cols) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-canvas-950 border border-slate-800 overflow-hidden shadow-2xl">
                <div className="px-4 py-2.5 bg-canvas-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] font-mono text-slate-400 ml-2">
                      manaksetu_engine::{currentPillar.id}.log
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Active
                  </span>
                </div>
                <pre className="p-5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-accent-blue selection:text-white">
                  {currentPillar.previewCode}
                </pre>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* 3. PROOF & SOCIAL VALIDATION (STANDARDS WALL + MARQUEE)   */}
      {/* ========================================================= */}
      <section className="space-y-8 pt-6">
        
        {/* Tier 1: Standards Bodies Wall */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              STANDARDS BODIES & CODIFICATION SYSTEMS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Harmonizing Global Specifications to Indian Standards
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {STANDARDS_BODIES.map((body, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-canvas-900/60 border border-slate-800/80 text-center flex flex-col items-center justify-center gap-1 hover:border-slate-700 transition"
              >
                <div className="font-mono font-black text-base text-white">{body.code}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{body.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Public Sector Marquee */}
        <div className="space-y-3 pt-4">
          <div className="text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
              TRUSTED FOR NATIONAL INFRASTRUCTURE SCRUTINY
            </span>
          </div>

          {/* Marquee Banner */}
          <div className="overflow-hidden relative py-4 border-y border-slate-800/60">
            <div className="animate-marquee gap-8 items-center text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              {CLIENT_ENTITIES.concat(CLIENT_ENTITIES).map((entity, i) => (
                <span key={i} className="flex items-center gap-4 whitespace-nowrap">
                  <span className="text-white font-bold">{entity}</span>
                  <span className="text-accent-sky">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* 4. EXPANDABLE FAQ ACCORDION SECTION                       */}
      {/* ========================================================= */}
      <section className="space-y-6 pt-8 max-w-4xl mx-auto">
        
        <div className="text-center space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Procurement Integrity & Compliance FAQ
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything you need to know regarding statutory mandates, CVC rules, and tender auditing.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-accent-sky transition"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent-cyan' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-canvas-950/40 font-normal">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================= */}
      {/* 5. REGULATORY INSIGHTS & THOUGHT LEADERSHIP GRID          */}
      {/* ========================================================= */}
      <section className="space-y-6 pt-8">
        
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
            REGULATORY INTELLIGENCE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Recent Gazette Notifications & Vigilance Advisories
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                GAZETTE NOTIFICATION
              </span>
              <h4 className="font-bold text-white text-base">
                Pipes and Fittings (Quality Control) Amendment Order, 2026
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Mandates compulsory BIS ISI marking on all HDPE, CPVC, and UPVC pipe procurement for drinking water supply schemes.
              </p>
            </div>
            <div className="text-[11px] font-mono text-accent-cyan flex items-center gap-1">
              Read S.O. 458(E) <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                CVC CIRCULAR
              </span>
              <h4 className="font-bold text-white text-base">
                Elimination of Restrictive OEM Lock-ins in Civil Works Tenders
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Reiterates prohibition on citing specific brand names without explicit equivalence clauses and pre-qualification turnover caps.
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
              CVC OM No. 03-05-1 <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                BIS STANDARD REVISION
              </span>
              <h4 className="font-bold text-white text-base">
                IS 1180 (Part 1): Energy Efficient Distribution Transformers
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Consolidates BEE star-labeling and maximum total loss specifications for 11kV outdoor distribution transformers.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              IS 1180 Revisions <ArrowRight className="w-3 h-3" />
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 6. PRODUCT ECOSYSTEM CROSS-SELL                           */}
      {/* ========================================================= */}
      <section className="pt-8">
        <div className="rounded-3xl bg-gradient-to-r from-canvas-900 via-accent-blue/15 to-emerald-950/30 border border-slate-800 p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-cyan">
              ENTERPRISE PROCUREMENT SUITE
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Scrutinize Tender Documents & Specifications?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              ManakSetu provides dedicated high-performance tools for every stage of tender preparation, vendor evaluation, and audit defense.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/audit-studio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-accent-blue via-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-lg shadow-accent-blue/30 transition"
              >
                <Zap className="w-4 h-4" />
                Launch Live Audit Studio
              </Link>
              <Link
                href="/rfp-scanner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 transition"
              >
                <FileCheck className="w-4 h-4 text-accent-sky" />
                Scrutinize Tender RFP (PDF)
              </Link>
              <Link
                href="/boq-auditor"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 transition"
              >
                <Table className="w-4 h-4 text-accent-amber" />
                Audit BoQ Schedule (.xlsx)
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
