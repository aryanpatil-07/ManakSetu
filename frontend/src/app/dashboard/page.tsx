'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        setUploadModalOpen(false);
        router.push('/documents');
      }, 1200);
    }
  };

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

        {/* Top-Right Actions */}
        <div className="flex items-center gap-unit-sm self-start shrink-0">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center justify-center gap-unit-xs px-unit-lg py-2 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm border border-outline-variant/60 hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>+ Upload tender</span>
          </button>
          <Link
            href="/new-analysis"
            className="inline-flex items-center justify-center gap-unit-xs px-unit-lg py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">rule</span>
            <span>+ New standards analysis</span>
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
                Analyses Completed
              </span>
              <div className="font-display-lg text-display-lg text-on-surface leading-tight mt-1 font-bold">
                128
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-xs mt-unit-md pt-unit-xs">
            <span className="inline-flex items-center text-[12px] font-label-md text-tertiary-container font-semibold">
              <span className="material-symbols-outlined text-[15px] mr-0.5">arrow_upward</span>+12
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">this month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-eyebrow text-label-eyebrow text-on-surface-variant tracking-wider uppercase font-semibold">
                Standards Identified
              </span>
              <div className="font-display-lg text-display-lg text-on-surface leading-tight mt-1 font-bold">
                642
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-xs mt-unit-md pt-unit-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Across 128 analyses</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-eyebrow text-label-eyebrow text-on-surface-variant tracking-wider uppercase font-semibold">
                Outdated References
              </span>
              <div className="font-display-lg text-display-lg text-error leading-tight mt-1 font-bold">
                17
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container/60 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-xs mt-unit-md pt-unit-xs">
            <span className="w-2 h-2 rounded-full bg-secondary-container shrink-0" />
            <Link href="/recommendations" className="font-body-sm text-body-sm text-secondary font-medium hover:underline">
              Require review
            </Link>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-eyebrow text-label-eyebrow text-on-surface-variant tracking-wider uppercase font-semibold">
                Certifications
              </span>
              <div className="font-display-lg text-display-lg text-on-surface leading-tight mt-1 font-bold">
                39
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/60 flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-xs mt-unit-md pt-unit-xs">
            <Link href="/certifications" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary">
              Potential requirements
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN WORKBENCH GRID (8 cols / 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-lg mt-unit-md items-start">
        {/* LEFT PANEL: RECENT ANALYSES (8 COLUMNS) */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/50 overflow-hidden flex flex-col">
          {/* Panel Header */}
          <div className="p-unit-lg flex items-center justify-between bg-surface-container-lowest">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                Recent analyses
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Your latest specification intelligence runs
              </p>
            </div>
            <Link
              href="/documents"
              className="font-label-md text-label-md text-primary hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
            </Link>
          </div>

          {/* Analytical Data Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container">
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Analysis
                  </th>
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Standards Found
                  </th>
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Confidence
                  </th>
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Status
                  </th>
                  <th className="py-2.5 px-unit-lg font-label-eyebrow text-label-eyebrow text-on-surface-variant uppercase tracking-wider" scope="col">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-body-sm text-body-sm">
                {RECENT_ANALYSES.map((rec) => (
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Summary Footnote Bar */}
          <div className="p-unit-sm px-unit-lg bg-surface-container-low flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant/30">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              Auto-synchronized with BIS Gazette releases
            </span>
            <span className="font-code-sm">Showing 4 of 128 records</span>
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
                href="/recommendations"
                className="inline-flex items-center gap-unit-xs font-label-md text-label-md text-secondary-fixed hover:text-secondary-fixed-dim transition-colors group"
              >
                <span className="underline">Open review queue</span>
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

      {/* Upload Tender Modal Simulation */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-lg shadow-2xl w-full max-w-lg p-6 animate-fade-in-up">
            <div className="flex items-start justify-between pb-3 border-b border-outline-variant/40">
              <h3 className="font-headline-md text-primary font-bold">Upload Tender Specification</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="py-6">
              <label className="border-2 border-dashed border-outline-variant hover:border-primary-container rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-surface hover:bg-surface-container-low transition">
                <span className="material-symbols-outlined text-[44px] text-primary-container mb-2">upload_file</span>
                <span className="font-headline-md text-body-md font-semibold text-primary">
                  {uploading ? 'Processing & Cross-Referencing...' : 'Choose tender PDF, DOCX or SOR file'}
                </span>
                <span className="text-[12px] text-on-surface-variant mt-1">Maximum file size: 50MB</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx"
                  className="hidden"
                  onChange={handleUploadSimulate}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 border border-outline-variant rounded text-label-md font-semibold text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
