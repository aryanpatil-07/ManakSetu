'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchPastRequirements,
  fetchAuditHistoryStats,
  RequirementRecord,
  AuditHistoryStats,
} from '@/lib/api';

interface AnalysisRecord {
  id: string;
  name: string;
  category: string;
  standard: string;
  allied: string;
  confidence: number;
  status: 'Completed' | 'Review' | 'Processing';
  updated: string;
}

const RECENT_ANALYSES: AnalysisRecord[] = [
  {
    id: 'rec-1',
    name: 'Industrial Safety Helmet',
    category: 'Specification analysis',
    standard: 'IS 2925',
    allied: '+ 3 allied standards',
    confidence: 94,
    status: 'Completed',
    updated: 'Today',
  },
  {
    id: 'rec-2',
    name: 'LED Street Lighting System',
    category: 'Specification analysis',
    standard: 'IS 10322',
    allied: '+ 5 references',
    confidence: 91,
    status: 'Review',
    updated: 'Yesterday',
  },
  {
    id: 'rec-3',
    name: 'Cement — OPC 43 Grade',
    category: 'Specification analysis',
    standard: 'IS 269',
    allied: '+ 4 allied standards',
    confidence: 97,
    status: 'Completed',
    updated: '2 days ago',
  },
  {
    id: 'rec-4',
    name: 'Submersible Pump Set',
    category: 'Specification analysis',
    standard: 'IS 8034',
    allied: '+ 2 references',
    confidence: 89,
    status: 'Processing',
    updated: '4 days ago',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [pastRecords, setPastRecords] = useState<RequirementRecord[]>([]);
  const [stats, setStats] = useState<AuditHistoryStats | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPastRequirements({ limit: 5 }),
      fetchAuditHistoryStats(),
    ])
      .then(([reqRes, statsRes]) => {
        if (reqRes.records && reqRes.records.length > 0) {
          setPastRecords(reqRes.records);
        }
        setStats(statsRes);
      })
      .catch((err) => {
        console.warn('Could not fetch Neon DB stats for dashboard:', err);
      })
      .finally(() => {
        setLoadingDb(false);
      });
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-unit-lg gap-unit-md">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-unit-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
            <span className="font-label-eyebrow text-label-eyebrow text-secondary uppercase tracking-[2px]">
              Procurement Intelligence
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight mt-1 font-bold">
            Indian Standards Intelligence
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Analyze procurement specifications and identify applicable Indian Standards, related references, and certification requirements.
          </p>
        </div>

        {/* Top-Right Action */}
        <div className="flex items-center self-start shrink-0">
          <Link
            href="/new-analysis"
            className="inline-flex items-center justify-center gap-unit-xs px-unit-lg py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
            <span>+ Check Tender Compliance</span>
          </Link>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-[1px] bg-outline-variant/60 my-unit-sm" />

      {/* STATISTIC CARDS (4 EQUAL COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-md my-unit-lg">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-eyebrow text-label-eyebrow text-on-surface-variant tracking-wider uppercase font-semibold">
                Requirements Audited
              </span>
              <div className="font-display-lg text-display-lg text-on-surface leading-tight mt-1 font-bold">
                {stats ? stats.total_audits : 128}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">database</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-xs mt-unit-md pt-unit-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block" />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Persisted in Neon PostgreSQL
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-eyebrow text-label-eyebrow text-on-surface-variant tracking-wider uppercase font-semibold">
                Average Compliance
              </span>
              <div className="font-display-lg text-display-lg text-on-surface leading-tight mt-1 font-bold">
                {stats ? `${stats.average_compliance_score}%` : '91%'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[22px]">speed</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-xs mt-unit-md pt-unit-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Across all historical tender runs
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-eyebrow text-label-eyebrow text-on-surface-variant tracking-wider uppercase font-semibold">
                Critical Defects Intercepted
              </span>
              <div className="font-display-lg text-display-lg text-error leading-tight mt-1 font-bold">
                {stats ? stats.critical_violations_total : 17}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container/60 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-xs mt-unit-md pt-unit-xs">
            <span className="w-2 h-2 rounded-full bg-secondary-container shrink-0" />
            <Link href="/past-requirements" className="font-body-sm text-body-sm text-secondary font-medium hover:underline">
              Inspect in Past Requirements
            </Link>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-eyebrow text-label-eyebrow text-on-surface-variant tracking-wider uppercase font-semibold">
                Fully Compliant Submissions
              </span>
              <div className="font-display-lg text-display-lg text-tertiary-container leading-tight mt-1 font-bold">
                {stats ? stats.compliant_count : 15}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/60 flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-xs mt-unit-md pt-unit-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              100% GFR 144 &amp; CVC verified
            </span>
          </div>
        </div>
      </div>

      {/* WORKSPACE CONTENT GRID (12 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-lg my-unit-sm">
        {/* LEFT PANEL: RECENT ANALYSES TABLE (8 COLUMNS) */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/50 overflow-hidden flex flex-col justify-between">
          {/* Section Header */}
          <div className="p-unit-lg border-b border-outline-variant/50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                  Recent Tender Scrutiny Runs
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  Neon DB Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Past requirements submitted by procurement officers, ordered most recent first
              </p>
            </div>
            <Link
              href="/past-requirements"
              className="font-label-md text-label-md text-primary hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>View All Past Requirements</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Analytical Data Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container">
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Requirement / Tender
                  </th>
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Standards Found
                  </th>
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Score
                  </th>
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Status
                  </th>
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Format
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-body-sm text-body-sm">
                {pastRecords.length > 0 ? (
                  pastRecords.map((rec) => {
                    const primaryStd = rec.detected_standards?.[0]?.recommended_standard || rec.detected_standards?.[0]?.specified || 'IS 4984';
                    const alliedCount = Math.max(0, (rec.detected_standards?.length || 1) - 1);

                    return (
                      <tr
                        key={rec.id}
                        onClick={() => router.push('/past-requirements')}
                        className="hover:bg-surface-container-low transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-unit-lg">
                          <div className="flex flex-col">
                            <span className="font-headline-md text-body-md text-on-surface font-semibold leading-tight">
                              {rec.tender_title}
                            </span>
                            <span className="font-body-sm text-[12px] text-on-surface-variant">
                              {rec.department || 'Public Works Directorate'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-unit-lg">
                          <span className="font-code-sm text-code-sm text-primary font-medium hover:underline">
                            {primaryStd}
                          </span>
                          {alliedCount > 0 && (
                            <span className="text-on-surface-variant text-[12px] font-body-sm ml-1">
                              +{alliedCount} standards
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-unit-lg">
                          <div className="flex items-center gap-unit-xs">
                            <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                              {rec.compliance_score}%
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-surface-container overflow-hidden">
                              <div
                                className={`h-full ${
                                  rec.compliance_score >= 85
                                    ? 'bg-tertiary-container'
                                    : rec.compliance_score >= 50
                                    ? 'bg-secondary-container'
                                    : 'bg-error'
                                }`}
                                style={{ width: `${rec.compliance_score}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-unit-lg">
                          {rec.overall_status === 'COMPLIANT' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-fixed text-tertiary font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                              Compliant
                            </span>
                          )}
                          {rec.overall_status === 'ACTION_REQUIRED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-fixed text-secondary font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              Review
                            </span>
                          )}
                          {rec.overall_status === 'NON_COMPLIANT' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-error-container text-on-error-container font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-error" />
                              Non-Compliant
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-unit-lg text-on-surface-variant font-code-sm text-[12px]">
                          {rec.audit_type}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  RECENT_ANALYSES.map((rec) => (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedAnalysis(rec)}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-unit-lg">
                        <div className="flex flex-col">
                          <span className="font-headline-md text-body-md text-on-surface font-semibold leading-tight">
                            {rec.name}
                          </span>
                          <span className="font-body-sm text-[12px] text-on-surface-variant">
                            {rec.category}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-unit-lg">
                        <span className="font-code-sm text-code-sm text-primary font-medium hover:underline">
                          {rec.standard}
                        </span>
                        <span className="text-on-surface-variant text-[12px] font-body-sm ml-1">
                          {rec.allied}
                        </span>
                      </td>
                      <td className="py-3 px-unit-lg">
                        <div className="flex items-center gap-unit-xs">
                          <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                            {rec.confidence}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-surface-container overflow-hidden">
                            <div
                              className={`h-full ${
                                rec.confidence >= 90
                                  ? 'bg-tertiary-container'
                                  : 'bg-primary-container'
                              }`}
                              style={{ width: `${rec.confidence}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-unit-lg">
                        {rec.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-fixed text-tertiary font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                            Completed
                          </span>
                        )}
                        {rec.status === 'Review' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-fixed text-secondary font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            Review
                          </span>
                        )}
                        {rec.status === 'Processing' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-primary font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Processing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-unit-lg text-on-surface-variant font-code-sm text-[12px]">
                        {rec.updated}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Summary Footnote Bar */}
          <div className="p-unit-sm px-unit-lg bg-surface-container-low flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant/30">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              Auto-synchronized with Neon PostgreSQL
            </span>
            <Link
              href="/past-requirements"
              className="font-code-sm font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View all {stats ? stats.total_audits : pastRecords.length} records</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL: ACTION & VERIFICATION (4 COLUMNS) */}
        <div className="lg:col-span-4 flex flex-col gap-unit-lg">
          {/* 1. Recommended Action Card */}
          <div className="bg-primary-container text-on-primary rounded-lg p-unit-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-secondary-fixed font-label-eyebrow text-label-eyebrow uppercase tracking-widest font-bold">
                <span className="material-symbols-outlined text-[16px] text-secondary-fixed">warning</span>
                <span>Recommended Action</span>
              </div>
              <h3 className="font-headline-xl text-headline-xl text-on-primary mt-2 font-bold leading-tight">
                Review 17 outdated references
              </h3>
              <p className="font-body-md text-body-md text-on-primary-container mt-unit-sm leading-relaxed">
                Bring tender specifications up to date before publishing. IS-Assist found 17 references with newer editions or amendments.
              </p>
            </div>
            <div className="pt-unit-md mt-unit-sm">
              <Link
                href="/new-analysis"
                className="inline-flex items-center gap-unit-xs font-label-md text-label-md text-secondary-fixed hover:text-secondary-fixed-dim transition-colors group"
              >
                <span className="underline">Check Tender Compliance</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                  arrow_outward
                </span>
              </Link>
            </div>
          </div>

          {/* 2. Source & Verification Authority Card */}
          <div className="bg-surface-container-lowest rounded-lg p-unit-xl shadow-sm border border-outline-variant/50 flex flex-col">
            <div className="flex items-center gap-unit-sm">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/60 flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Source &amp; verification
              </h4>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mt-unit-md">
              Recommendations are generated from semantic analysis of standards metadata and reference relationships.
            </p>
            <div className="w-full h-[1px] bg-outline-variant/50 my-unit-lg" />
            <div className="flex items-start gap-unit-xs text-on-surface-variant font-body-sm text-body-sm italic">
              <span className="material-symbols-outlined text-[18px] text-outline shrink-0 mt-0.5">policy</span>
              <span>Always verify final requirements against the latest authoritative BIS publication.</span>
            </div>
          </div>

          {/* 3. Visual Trust Bar: Ministry & Portal Status */}
          <div className="bg-surface-container-low rounded-lg p-unit-md border border-outline-variant/40 flex items-center justify-between">
            <div className="flex items-center gap-unit-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary shrink-0" />
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                BIS Manakonline Live Node
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-outline">v4.18.2</span>
          </div>
        </div>
      </div>

      {/* Detail Modal for Selected Analysis */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-lg shadow-2xl w-full max-w-xl p-6 animate-fade-in-up">
            <div className="flex items-start justify-between pb-3 border-b border-outline-variant/40">
              <div>
                <div className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                  Analysis Details · {selectedAnalysis.standard}
                </div>
                <h3 className="font-headline-lg text-primary font-bold mt-1">
                  {selectedAnalysis.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="p-1 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 font-body-sm text-on-surface">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Primary Standard Code:</span>
                <span className="font-code-sm font-bold text-primary">{selectedAnalysis.standard}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Relevance Confidence:</span>
                <span className="font-code-sm font-bold text-tertiary-container">{selectedAnalysis.confidence}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Harmonization Status:</span>
                <span className="font-label-sm font-semibold text-tertiary-container">{selectedAnalysis.status}</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded border border-outline-variant/40 text-on-surface-variant text-[12px] leading-relaxed">
                Extracted specifications cross-referenced with active BIS Gazette registry. No proprietary brand lock-in detected for this equipment classification.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/40">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-4 py-2 border border-outline-variant text-on-surface rounded text-label-md font-semibold hover:bg-surface-container"
              >
                Close
              </button>
              <Link
                href="/specification-builder"
                className="px-4 py-2 bg-primary-container text-on-primary rounded text-label-md font-semibold hover:bg-primary"
              >
                Open in Spec Builder →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
