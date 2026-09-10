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
  Search,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  FileCheck,
  Building2,
  Lock,
  Cpu,
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

// Capabilities Grid
const CAPABILITIES = [
  {
    icon: <Sparkles className="w-6 h-6 text-accent-cyan" />,
    title: 'Automated Lifecycle Tracking',
    description: 'Detects superseded, obsolete, or withdrawn Indian Standards in real time, preventing illegal citations.',
    badge: 'BIS ACT 2016',
  },
  {
    icon: <Scale className="w-6 h-6 text-emerald-400" />,
    title: 'Statutory QCO Enforcement',
    description: 'Strictly mandates Scheme-I BIS Standard Mark (ISI Mark) across 679+ ministerial Quality Control Orders.',
    badge: 'MANDATORY LAW',
  },
  {
    icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
    title: 'CVC Anti-Tailoring Linter',
    description: 'Flags brand exclusivity (Supreme, ABB, Astral) and restrictive turnover criteria that choke competitive bidding.',
    badge: 'CVC OM 03-05-1',
  },
  {
    icon: <GitCompare className="w-6 h-6 text-accent-sky" />,
    title: 'Foreign Code Harmonization',
    description: 'Maps ASTM, DIN, ISO, and BS codes directly to corresponding Indian Standards in accordance with GFR 144(vii).',
    badge: 'GFR 144(VII)',
  },
  {
    icon: <FileSpreadsheet className="w-6 h-6 text-amber-300" />,
    title: 'High-Speed BoQ Batch Audit',
    description: 'Processes multi-hundred-row Excel schedules (.xlsx) row-by-row, returning instant compliance classifications.',
    badge: 'EXCEL / CSV',
  },
  {
    icon: <Award className="w-6 h-6 text-indigo-400" />,
    title: 'CAG Audit Defense Certificate',
    description: 'Generates formal compliance inspection certificates with cryptographic verification markers for audit scrutiny.',
    badge: '1-CLICK PDF',
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

export default function DashboardPage() {
  const [activePreset, setActivePreset] = useState<string>('pipe');
  const [inputText, setInputText] = useState<string>(PRESETS[0].text);
  const [selectedCategory, setSelectedCategory] = useState<string>(PRESETS[0].category);
  const [loading, setLoading] = useState(false);
  const [activePillarTab, setActivePillarTab] = useState<string>('access');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
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
            <a
              href="#studio-workspace"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-accent-blue via-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-xl shadow-accent-blue/30 hover:shadow-cyan-glow transition duration-200"
            >
              <Zap className="w-4 h-4" />
              Launch Live Audit Studio
            </a>
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

        {/* Active Pillar Showcase Showcase */}
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
      {/* 3. INTERACTIVE LIVE AUDIT STUDIO (THE WORKING ENGINE)      */}
      {/* ========================================================= */}
      <section id="studio-workspace" className="space-y-6 pt-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
                LIVE INTERACTIVE WORKBENCH
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Tender Clause Input & Specification Verifier
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Select an authoritative 1-click test scenario below or paste real procurement text to scrutinize.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Engine Online
          </div>
        </div>

        {/* 1-CLICK JUDGE DEMONSTRATION PRESET BUTTONS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Judge Demonstration Presets (1-Click Instant Evaluation)
              </h3>
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

        {/* INPUT WORKSPACE EDITOR */}
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
            rows={6}
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

        {/* AUDIT RESULTS WORKSPACE */}
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
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
                      Regulatory & QCO Legal Dossier
                    </h4>
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
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                        Rectifications Applied ({diffResult.diff_summary.length})
                      </h4>
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

      </section>

      {/* ========================================================= */}
      {/* 4. FEATURE GRID / CAPABILITY MATRIX (6-PACK)              */}
      {/* ========================================================= */}
      <section className="space-y-6 pt-8">
        
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-sky">
            PRECISION CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Built for High-Stakes Public Procurement
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            A comprehensive suite of intelligence tools designed specifically for Chief Engineers, Tender Scrutiny Committees, and Vigilance Officers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-canvas-950 border border-slate-800 flex items-center justify-center shadow-inner group-hover:border-accent-sky/50 transition">
                    {cap.icon}
                  </div>
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {cap.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-accent-sky transition">
                  {cap.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs font-semibold text-accent-cyan group-hover:translate-x-1 transition">
                <span>Explore Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ========================================================= */}
      {/* 5. PROOF & SOCIAL VALIDATION (STANDARDS WALL + MARQUEE)   */}
      {/* ========================================================= */}
      <section className="space-y-8 pt-8">
        
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
      {/* 6. EXPANDABLE FAQ ACCORDION SECTION                       */}
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
      {/* 7. REGULATORY INSIGHTS & THOUGHT LEADERSHIP GRID          */}
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
      {/* 8. PRODUCT ECOSYSTEM CROSS-SELL                           */}
      {/* ========================================================= */}
      <section className="pt-8">
        <div className="rounded-3xl bg-gradient-to-r from-canvas-900 via-accent-blue/15 to-emerald-950/30 border border-slate-800 p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-cyan">
              ENTERPRISE PROCUREMENT SUITE
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Scrutinize Tender PDFs or Batch Process BoQs?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              ManakSetu provides dedicated high-performance tools for every stage of tender preparation, vendor evaluation, and audit defense.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/rfp-scanner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-accent-blue hover:bg-sky-500 text-white shadow-lg shadow-accent-blue/30 transition"
              >
                <FileCheck className="w-4 h-4" />
                Launch RFP PDF Scrutinizer
              </Link>
              <Link
                href="/boq-auditor"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/30 transition"
              >
                <Table className="w-4 h-4" />
                Launch BoQ Batch Auditor (.xlsx)
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
