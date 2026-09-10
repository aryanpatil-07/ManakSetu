'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface RecommendationItem {
  id: string;
  category: 'superseded' | 'cvc' | 'qco';
  title: string;
  tenderDoc: string;
  clauseRef: string;
  severity: 'CRITICAL STATUTORY GAP' | 'HIGH AUDIT RISK' | 'TECHNICAL RISK' | 'STATUTORY QCO REQUIREMENT';
  severityColor: string;
  authority: string;
  originalClause: string;
  recommendedClause: string;
  rationale: string;
  applied: boolean;
}

const RECOMMENDATIONS_DATA: RecommendationItem[] = [
  {
    id: 'rec-1',
    category: 'superseded',
    title: 'Superseded Revision Cited: IS 1180 (Part 1):1989',
    tenderDoc: 'Tender_Transformer_50kVA.pdf',
    clauseRef: 'Clause 2.1 — Transformer Specifications',
    severity: 'CRITICAL STATUTORY GAP',
    severityColor: 'bg-error-container text-error',
    authority: 'Bureau of Indian Standards Act 2016 & Electrical Transformers QCO 2024',
    originalClause:
      'Supply of 500 kVA, 11 kV / 433 V distribution transformer as per IS 1180:1989.',
    recommendedClause:
      'Supply of 500 kVA, 11 kV / 433 V outdoor oil-immersed distribution transformer conforming to IS 1180 (Part 1):2014 with maximum total losses at 50% and 100% load complying with Level 2 efficiency.',
    rationale:
      'The 1989 edition has been superseded by the 2014 gazetted standard. Bidding tenders referencing superseded codes face statutory rejection by State Electricity Regulatory Commissions (SERCs).',
    applied: false,
  },
  {
    id: 'rec-2',
    category: 'cvc',
    title: 'CVC Anti-Tailoring Violation: Proprietary Make Restriction',
    tenderDoc: 'Urban_Water_Pipeline_RFP.pdf',
    clauseRef: 'Clause 4.3 — Approved Manufacturer Makes',
    severity: 'HIGH AUDIT RISK',
    severityColor: 'bg-secondary-fixed text-secondary font-bold',
    authority: 'CVC OM No. 03-05-1-CTE-9 & GFR Rule 144(i)',
    originalClause:
      'Only Supreme or Astral make HDPE pipes shall be supplied and installed by the contractor.',
    recommendedClause:
      'Pipes shall bear valid BIS Standard Mark (ISI mark) and conform to IS 4984:2016 from any licensed manufacturer.',
    rationale:
      'Mandating proprietary commercial brands restricts open competition, violating Central Vigilance Commission guidelines and Rule 144 of the General Financial Rules (GFR).',
    applied: false,
  },
  {
    id: 'rec-3',
    category: 'superseded',
    title: 'Obsolete Raw Material Standard: IS 335:1993 for Insulating Oil',
    tenderDoc: 'Substation_Package_2026.docx',
    clauseRef: 'Clause 5.8 — Transformer Oil Testing',
    severity: 'TECHNICAL RISK',
    severityColor: 'bg-secondary-fixed text-secondary font-bold',
    authority: 'BIS Technical Committee ETD 3 Notification S.O. 992(E)',
    originalClause:
      'Transformer insulating fluid shall satisfy dielectric parameters in IS 335:1993.',
    recommendedClause:
      'New insulating mineral oil shall satisfy IS 335:2018 type A or B with minimum breakdown voltage > 60 kV and moisture content < 15 ppm.',
    rationale:
      'The 1993 specification was harmonized into the comprehensive 2018 edition incorporating modern anti-oxidation inhibitor testing.',
    applied: false,
  },
  {
    id: 'rec-4',
    category: 'qco',
    title: 'Missing Photometric & Surge Protection Mandate under QCO',
    tenderDoc: 'Street_Lighting_Technical_Spec.docx',
    clauseRef: 'Clause 3.2 — Luminaire Driver Protocol',
    severity: 'STATUTORY QCO REQUIREMENT',
    severityColor: 'bg-tertiary-fixed text-tertiary font-bold',
    authority: 'LED Luminaires (Quality Control) Order 2020 & IS 10322 (Part 5/Sec 3)',
    originalClause:
      'LED street lights 90W with standard manufacturer warranty.',
    recommendedClause:
      'LED street luminaires 90W shall bear BIS ISI mark under IS 10322 (Part 5/Sec 3):2012 with internal surge protection of minimum 10 kV conforming to IS 16102 and electronic controlgear conforming to IS 15885.',
    rationale:
      'Public lighting tenders without compulsory 10 kV surge withstand stipulations risk high failure rates during monsoon voltage transients.',
    applied: false,
  },
];

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'superseded' | 'cvc' | 'qco'>('all');
  const [items, setItems] = useState<RecommendationItem[]>(RECOMMENDATIONS_DATA);
  const [toastText, setToastText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const handleApply = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, applied: true } : item))
    );
    showToast('Applied recommended statutory clause into tender specification draft.');
  };

  const handleApplyAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, applied: true })));
    showToast('Applied all 4 high-priority statutory amendments to working drafts.');
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification */}
      {toastText && (
        <div className="fixed bottom-6 right-6 bg-primary-container text-on-primary px-4 py-3 rounded shadow-lg flex items-center gap-3 border border-primary z-50 animate-fade-in-up">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">task_alt</span>
          <span className="font-body-sm text-body-sm font-medium">{toastText}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-unit-md pb-unit-xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-unit-xs mb-unit-xs">
            <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-[0.15em] text-secondary font-bold">
              INTELLIGENCE / RECOMMENDATIONS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-code-sm text-code-sm text-outline">CLAUSE RECONCILIATION RADAR</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
            Latest Recommendations &amp; Discrepancies
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            AI-identified specification deficiencies, obsolete standard revisions, CVC brand bias flags, and recommended amendments.
          </p>
        </div>

        <div className="flex items-center gap-unit-sm self-start md:self-auto">
          <button
            onClick={() => showToast('Generating formal Tender Corrigendum Addendum PDF...')}
            className="flex items-center gap-unit-xs bg-surface-container-lowest text-primary hover:bg-surface-container-high px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm border border-outline-variant/60"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Corrigendum</span>
          </button>
          <button
            onClick={handleApplyAll}
            className="flex items-center gap-unit-xs bg-primary-container text-on-primary hover:bg-primary px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Apply All High-Priority</span>
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-md mb-unit-xl">
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Total Flagged Issues
            </span>
            <span className="material-symbols-outlined text-[20px] text-secondary">warning</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-secondary">17</span>
            <span className="font-code-sm text-code-sm text-outline font-medium">In Queue</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Across 28 procurement packages</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Superseded Standards
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">
              history_toggle_off
            </span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">08</span>
            <span className="font-code-sm text-code-sm text-error font-semibold">Action Required</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Older editions cited</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              CVC Brand Bias Flags
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">lock_open</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">04</span>
            <span className="font-code-sm text-code-sm text-secondary font-semibold">Restrictive Makes</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">OEM proprietary lock-ins</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              QCO Statutory Mandates
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">fact_check</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">05</span>
            <span className="font-code-sm text-code-sm text-tertiary-container font-semibold">Mandatory</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Compulsory ISI marks required</span>
        </div>
      </div>

      {/* Filterable Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-outline-variant/50 pb-3 mb-6">
        {[
          { key: 'all', label: 'All Recommendations (17)' },
          { key: 'superseded', label: 'Superseded Standards (8)' },
          { key: 'cvc', label: 'CVC Brand Bias (4)' },
          { key: 'qco', label: 'QCO Mandates (5)' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-1.5 rounded text-label-md font-semibold transition-colors ${
              activeTab === t.key
                ? 'bg-primary-container text-on-primary shadow-xs'
                : 'bg-surface-container-lowest border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List of Detailed Recommendation Cards with Side-by-Side Clause Diffs */}
      <div className="space-y-5">
        {filteredItems.map((rec) => (
          <div
            key={rec.id}
            className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-6 shadow-sm flex flex-col"
          >
            {/* Top Meta Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-label-eyebrow text-[10px] px-2 py-0.5 rounded ${rec.severityColor}`}>
                  {rec.severity}
                </span>
                <span className="font-code-sm text-[11px] text-outline">
                  {rec.tenderDoc} · {rec.clauseRef}
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Statutory Basis: <strong>{rec.authority}</strong>
              </span>
            </div>

            {/* Title & Rationale */}
            <div className="py-3">
              <h3 className="font-headline-lg text-headline-lg text-primary font-bold">
                {rec.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {rec.rationale}
              </p>
            </div>

            {/* Side-by-Side Clause Diff Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              {/* Original Draft (Flawed) */}
              <div className="p-3.5 rounded bg-error-container/20 border border-error/30 flex flex-col">
                <div className="flex items-center gap-1.5 text-error font-bold font-label-eyebrow text-[11px] uppercase tracking-wider mb-1.5">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  <span>Flagged Tender Draft Clause (Current)</span>
                </div>
                <p className="font-code-sm text-[12px] text-on-surface leading-relaxed flex-1">
                  {rec.originalClause}
                </p>
              </div>

              {/* Recommended Statutory Clause */}
              <div className="p-3.5 rounded bg-tertiary-fixed/30 border border-tertiary/30 flex flex-col">
                <div className="flex items-center gap-1.5 text-tertiary-container font-bold font-label-eyebrow text-[11px] uppercase tracking-wider mb-1.5">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Harmonized Statutory Clause (Recommended)</span>
                </div>
                <p className="font-code-sm text-[12px] text-on-surface leading-relaxed flex-1">
                  {rec.recommendedClause}
                </p>
              </div>
            </div>

            {/* Card Action Controls */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-outline-variant/40">
              <Link
                href="/specification-builder"
                className="text-primary font-label-md text-label-md font-semibold hover:underline flex items-center gap-1"
              >
                <span>Review in Specification Builder</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>

              <div className="flex items-center gap-2">
                {rec.applied ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-tertiary-fixed text-tertiary font-label-md text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Applied to Tender Draft
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply(rec.id)}
                    className="h-8 px-4 bg-primary-container hover:bg-primary text-on-primary rounded font-label-md text-label-sm font-semibold transition flex items-center gap-1.5 shadow-sm"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Apply to Tender Specification</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
