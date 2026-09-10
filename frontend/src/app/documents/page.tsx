'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface DocumentRecord {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx';
  docId: string;
  size: string;
  category: string;
  uploadedDate: string;
  uploadedTime: string;
  requirements: number;
  standardsFound: number;
  issues: {
    count: number;
    label: string;
    severity: 'outdated' | 'missing' | 'none' | 'processing';
  };
  status: 'Completed' | 'Review' | 'Processing';
  progress?: number;
}

const DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-1',
    name: 'Tender_Transformer_50kVA.pdf',
    type: 'pdf',
    docId: 'TN-DISCOM-940',
    size: '2.4 MB',
    category: 'Transformers & Grid',
    uploadedDate: '10 Sep 2026',
    uploadedTime: '14:22 IST',
    requirements: 18,
    standardsFound: 12,
    issues: { count: 1, label: '1 outdated', severity: 'outdated' },
    status: 'Completed',
  },
  {
    id: 'doc-2',
    name: 'Street_Lighting_Technical_Spec.docx',
    type: 'docx',
    docId: 'MUNI-LED-048',
    size: '1.1 MB',
    category: 'Municipal Electrification',
    uploadedDate: '09 Sep 2026',
    uploadedTime: '09:15 IST',
    requirements: 24,
    standardsFound: 9,
    issues: { count: 3, label: '3 missing', severity: 'missing' },
    status: 'Review',
  },
  {
    id: 'doc-3',
    name: 'PPE_Procurement_2026.pdf',
    type: 'pdf',
    docId: 'PSU-IND-551',
    size: '4.8 MB',
    category: 'Occupational Safety / PPE',
    uploadedDate: '04 Sep 2026',
    uploadedTime: '18:40 IST',
    requirements: 11,
    standardsFound: 7,
    issues: { count: 0, label: '—', severity: 'none' },
    status: 'Completed',
  },
  {
    id: 'doc-4',
    name: 'Pump_Set_Requirements.xlsx',
    type: 'xlsx',
    docId: 'AGRI-PUMP-102',
    size: '850 KB',
    category: 'Hydraulic Equipment',
    uploadedDate: '02 Sep 2026',
    uploadedTime: '11:08 IST',
    requirements: 8,
    standardsFound: 4,
    issues: { count: 0, label: 'Processing', severity: 'processing' },
    status: 'Processing',
    progress: 68,
  },
];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDocs = useMemo(() => {
    return DOCUMENTS.filter((doc) => {
      const matchSearch =
        !searchQuery ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'All statuses' ||
        (statusFilter === 'Completed only' && doc.status === 'Completed') ||
        (statusFilter === 'Under review' && doc.status === 'Review') ||
        (statusFilter === 'Processing active' && doc.status === 'Processing');

      const matchCategory =
        categoryFilter === 'All Categories' || doc.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const handleExportRegistry = () => {
    showToast('Exporting complete statutory audit registry (CSV / XLSX)...');
  };

  const handleAutoAmend = () => {
    showToast('Auto-amended clause: Replaced IS 1180:1989 with IS 1180 (Part 1):2014 in working draft.');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-primary-container text-on-primary px-4 py-3 rounded shadow-lg flex items-center gap-3 border border-primary z-50 animate-fade-in-up">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">task_alt</span>
          <span className="font-body-sm text-body-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-unit-md pb-unit-xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-unit-xs mb-unit-xs">
            <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-[0.15em] text-secondary font-bold">
              WORKSPACE / RECORDS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-code-sm text-code-sm text-outline">STATUTORY AUDIT REPO</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
            Analyzed documents
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Review extracted requirements, detected standards, and specification gaps from prior analyses.
          </p>
        </div>
        <div className="flex items-center gap-unit-sm self-start md:self-auto">
          <button
            onClick={handleExportRegistry}
            className="flex items-center gap-unit-xs bg-surface-container-lowest text-primary hover:bg-surface-container-high px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm border border-outline-variant/60"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Registry</span>
          </button>
          <Link
            href="/new-analysis"
            className="flex items-center gap-unit-xs bg-primary-container text-on-primary hover:bg-primary px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New analysis</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-md mb-unit-xl">
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Processed Batches
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">layers</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">28</span>
            <span className="font-code-sm text-code-sm text-tertiary-container font-semibold">↑ +4 this week</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">100% indexed in BIS engine</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Standards Cross-Referenced
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">menu_book</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">142</span>
            <span className="font-code-sm text-code-sm text-outline font-medium">IS / ISO series</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">94.2% verified conformant</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Discrepancy Alerts
            </span>
            <span className="material-symbols-outlined text-[20px] text-secondary">warning</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-secondary">06</span>
            <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-semibold">
              Action Req.
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">4 obsolete clauses, 2 missing</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Avg. Parsing Latency
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">speed</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">
              1.4<span className="text-body-md font-normal text-on-surface-variant">s</span>
            </span>
            <span className="font-code-sm text-code-sm text-tertiary-container font-semibold">Nominal</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">OCR v3.8 pipeline active</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-unit-md mb-unit-md">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <span className="material-symbols-outlined absolute left-unit-md top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
            search
          </span>
          <input
            id="docSearchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-unit-md bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/60 shadow-sm transition-all"
            placeholder="Search documents by title, tender ID or product..."
            type="text"
          />
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-unit-sm flex-wrap">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none h-10 pl-unit-md pr-9 bg-surface-container-lowest border border-outline-variant/60 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
            >
              <option>All statuses</option>
              <option>Completed only</option>
              <option>Under review</option>
              <option>Processing active</option>
            </select>
            <span className="material-symbols-outlined absolute right-unit-xs top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none h-10 pl-unit-md pr-9 bg-surface-container-lowest border border-outline-variant/60 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
            >
              <option>All Categories</option>
              <option>Transformers &amp; Grid</option>
              <option>Municipal Electrification</option>
              <option>Occupational Safety / PPE</option>
              <option>Hydraulic Equipment</option>
            </select>
            <span className="material-symbols-outlined absolute right-unit-xs top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All statuses');
              setCategoryFilter('All Categories');
            }}
            className="h-10 flex items-center gap-unit-xs px-unit-md bg-surface-container-lowest border border-outline-variant/60 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
            <span>Reset Filters</span>
          </button>

          <button
            onClick={() => showToast('Registry synchronization completed with active BIS gazette.')}
            className="h-10 w-10 flex items-center justify-center bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-outline hover:text-on-surface shadow-sm hover:bg-surface-container-high transition-colors"
            title="Reload Registry"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Main Table Surface */}
      <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/50 overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant">
                <th className="py-unit-md px-unit-lg font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  DOCUMENT
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  UPLOADED
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase text-center">
                  REQUIREMENTS
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase text-center">
                  STANDARDS FOUND
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  ISSUES
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  STATUS
                </th>
                <th className="py-unit-md px-unit-lg font-label-eyebrow text-label-eyebrow tracking-wider uppercase text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-surface transition-colors group">
                  <td className="py-unit-md px-unit-lg">
                    <div className="flex items-center gap-unit-md">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          doc.type === 'pdf'
                            ? 'bg-error-container text-on-error-container'
                            : doc.type === 'docx'
                            ? 'bg-surface-variant text-primary-container'
                            : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {doc.type === 'pdf'
                            ? 'picture_as_pdf'
                            : doc.type === 'docx'
                            ? 'description'
                            : 'table_view'}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          onClick={() => setSelectedDoc(doc)}
                          className="font-headline-md text-body-md text-primary font-semibold truncate group-hover:text-primary-container transition-colors cursor-pointer"
                        >
                          {doc.name}
                        </span>
                        <div className="flex items-center gap-unit-xs mt-0.5">
                          <span className="font-body-sm text-[12px] text-outline">
                            Tender / specification document
                          </span>
                          <span className="text-outline">·</span>
                          <span className="font-code-sm text-[11px] text-outline">{doc.size}</span>
                          <span className="text-outline">·</span>
                          <span className="font-code-sm text-[11px] px-1 py-0.2 bg-surface-container-high text-on-surface-variant rounded">
                            ID: {doc.docId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">
                      {doc.uploadedDate}
                    </span>
                    <span className="block font-code-sm text-[11px] text-outline">
                      {doc.uploadedTime}
                    </span>
                  </td>

                  <td className="py-unit-md px-unit-md text-center">
                    <span className="inline-flex items-center justify-center font-headline-md text-body-md text-on-surface font-bold">
                      {doc.requirements}
                    </span>
                  </td>

                  <td className="py-unit-md px-unit-md text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded font-headline-md text-body-md font-bold text-primary-container bg-surface-container-low">
                      {doc.standardsFound}
                    </span>
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    {doc.issues.severity === 'outdated' && (
                      <span className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        {doc.issues.label}
                      </span>
                    )}
                    {doc.issues.severity === 'missing' && (
                      <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error" />
                        {doc.issues.label}
                      </span>
                    )}
                    {doc.issues.severity === 'none' && (
                      <span className="font-code-sm text-code-sm text-outline px-1">—</span>
                    )}
                    {doc.issues.severity === 'processing' && (
                      <span className="font-body-sm text-[12px] text-outline italic">Processing</span>
                    )}
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    {doc.status === 'Completed' && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-on-tertiary-container" />
                        <span className="font-label-md text-label-sm font-semibold text-tertiary-container">
                          Completed
                        </span>
                      </div>
                    )}
                    {doc.status === 'Review' && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="font-label-md text-label-sm font-semibold text-secondary">
                          Review
                        </span>
                      </div>
                    )}
                    {doc.status === 'Processing' && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                        <span className="font-label-md text-label-sm font-semibold text-primary-container">
                          Processing
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="py-unit-md px-unit-lg text-right whitespace-nowrap">
                    {doc.status === 'Processing' ? (
                      <div className="flex items-center justify-end gap-unit-xs">
                        <div className="w-20 bg-surface-container-high h-1.5 rounded-full overflow-hidden mr-2">
                          <div className="bg-primary-container h-full rounded-full w-[68%]" />
                        </div>
                        <span className="font-body-sm text-[12px] text-outline font-medium">
                          Analyzing (68%)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-unit-sm">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container font-semibold hover:text-primary hover:underline"
                          type="button"
                        >
                          <span>View report</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                        <button
                          onClick={() => showToast(`Opening Clause Inspector for ${doc.docId}...`)}
                          className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                          title="Clause Inspector"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">search_insights</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-unit-md px-unit-lg py-unit-md bg-surface-container text-on-surface-variant border-t border-outline-variant/30">
          <div className="flex items-center gap-unit-sm">
            <span className="font-body-sm text-body-sm text-outline">
              Showing <strong className="text-on-surface font-semibold">{filteredDocs.length}</strong> of{' '}
              <strong className="text-on-surface font-semibold">28</strong> documents
            </span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span className="font-code-sm text-[11px] text-outline">Page {currentPage} of 7</span>
          </div>
          <div className="flex items-center gap-unit-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-unit-md py-1.5 rounded-lg bg-surface-container-lowest text-outline font-label-md text-label-md disabled:opacity-60 disabled:cursor-not-allowed border border-outline-variant/40"
              type="button"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg font-label-md text-label-md flex items-center justify-center font-semibold ${
                currentPage === 1
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
              }`}
              type="button"
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-lg font-label-md text-label-md flex items-center justify-center font-semibold ${
                currentPage === 2
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
              }`}
              type="button"
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 rounded-lg font-label-md text-label-md flex items-center justify-center font-semibold ${
                currentPage === 3
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
              }`}
              type="button"
            >
              3
            </button>
            <span className="px-1 text-outline font-code-sm">...</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(7, p + 1))}
              className="px-unit-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors shadow-sm border border-outline-variant/40"
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Intelligence Quick Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-unit-lg mt-unit-2xl">
        {/* Active Clause Audits */}
        <div className="bg-surface-container-lowest p-unit-xl rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-unit-sm">
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-secondary font-bold">
                DISCREPANCY RADAR
              </span>
              <span className="material-symbols-outlined text-[18px] text-secondary">flag</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary font-semibold">
              Outdated Standard Reference
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Document <span className="font-code-sm text-[12px] font-semibold text-primary">Tender_Transformer_50kVA.pdf</span> cites <span className="font-code-sm text-[12px] px-1 py-0.5 rounded bg-surface-container text-secondary font-bold">IS 1180 (Part 1): 1989</span> which has been superseded by the 2014 statutory revision with Level-2 efficiency mandates.
            </p>
          </div>
          <div className="pt-unit-md mt-unit-md flex items-center justify-between border-t border-outline-variant/40">
            <span className="font-label-sm text-label-sm text-outline">Bureau of Indian Standards Act 2016</span>
            <button
              onClick={handleAutoAmend}
              className="text-primary-container font-label-md text-label-md font-semibold hover:underline flex items-center gap-0.5"
              type="button"
            >
              <span>Auto-amend clause</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Extraction Integrity Insight */}
        <div className="bg-surface-container-lowest p-unit-xl rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-unit-sm">
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-primary-container font-bold">
                PARSING HEALTH
              </span>
              <span className="material-symbols-outlined text-[18px] text-primary-container">analytics</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary font-semibold">
              Specification Extraction Rigor
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Machine-readability across technical tender tables reached <strong>98.6%</strong> accuracy. 61 parameters automatically normalized to National Building Code (NBC) &amp; BIS classifications.
            </p>
          </div>
          <div className="pt-unit-md mt-unit-md flex items-center justify-between border-t border-outline-variant/40">
            <span className="font-label-sm text-label-sm text-tertiary-container font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container" />
              Engine: ManakParse v4.2
            </span>
            <button
              onClick={() => showToast('OCR Telemetry: 100% token extraction accuracy across 14 tables.')}
              className="text-primary-container font-label-md text-label-md font-semibold hover:underline flex items-center gap-0.5"
              type="button"
            >
              <span>Audit telemetry</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Statutory Repository Link */}
        <div className="bg-surface-container-lowest p-unit-xl rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-unit-sm">
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-bold">
                COMPLIANCE ASSURANCE
              </span>
              <span className="material-symbols-outlined text-[18px] text-outline">verified_user</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary font-semibold">
              GeM Portal Interoperability
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Tender documents analyzed here export natively to Government e-Marketplace (GeM) standard schedule templates, cutting procurement dispute cycles by 82%.
            </p>
          </div>
          <div className="pt-unit-md mt-unit-md flex items-center justify-between border-t border-outline-variant/40">
            <span className="font-label-sm text-label-sm text-outline">Ministry of Commerce &amp; Industry</span>
            <Link
              href="/specification-builder"
              className="text-primary-container font-label-md text-label-md font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Template guide</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Document Report Inspection Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-lg shadow-2xl w-full max-w-2xl p-6 animate-fade-in-up">
            <div className="flex items-start justify-between pb-3 border-b border-outline-variant/40">
              <div>
                <div className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                  Audit Report · ID: {selectedDoc.docId}
                </div>
                <h3 className="font-headline-lg text-primary font-bold mt-1">{selectedDoc.name}</h3>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3 font-body-sm text-on-surface">
              <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container-low rounded border border-outline-variant/40">
                <div>
                  <span className="text-[11px] text-outline block">Category</span>
                  <span className="font-semibold text-primary">{selectedDoc.category}</span>
                </div>
                <div>
                  <span className="text-[11px] text-outline block">Status</span>
                  <span className="font-semibold text-tertiary-container">{selectedDoc.status}</span>
                </div>
                <div>
                  <span className="text-[11px] text-outline block">Extracted Requirements</span>
                  <span className="font-code-sm font-bold text-primary">{selectedDoc.requirements} clauses</span>
                </div>
                <div>
                  <span className="text-[11px] text-outline block">Standards Cross-Referenced</span>
                  <span className="font-code-sm font-bold text-tertiary-container">{selectedDoc.standardsFound} standards</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-headline-md text-label-md font-bold text-primary">Compliance Gaps &amp; Flags:</div>
                {selectedDoc.issues.severity === 'outdated' && (
                  <div className="p-3 rounded bg-secondary-fixed/40 border border-secondary/30 text-[12px] text-on-surface leading-relaxed">
                    <strong>Critical Superseded Reference:</strong> Cites obsolete 1989 revision of IS 1180. The 2014 edition mandates Level-2 losses under statutory Quality Control Order.
                  </div>
                )}
                {selectedDoc.issues.severity === 'missing' && (
                  <div className="p-3 rounded bg-error-container/40 border border-error/30 text-[12px] text-on-surface leading-relaxed">
                    <strong>Missing Statutory Requirements:</strong> Luminaire testing clauses lack mandatory photometric testing certificate under IS 10322 and surge protection up to 10 kV.
                  </div>
                )}
                {selectedDoc.issues.severity === 'none' && (
                  <div className="p-3 rounded bg-tertiary-fixed/30 border border-tertiary/20 text-[12px] text-tertiary-container font-medium">
                    100% compliant with active BIS specifications and CVC procurement circulars.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-outline-variant/40">
              <Link
                href="/specification-builder"
                className="text-primary-container hover:underline font-label-md text-body-sm font-semibold flex items-center gap-1"
              >
                <span>Edit in Specification Builder</span>
                <span className="material-symbols-outlined text-[16px]">edit_document</span>
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-1.5 border border-outline-variant text-on-surface rounded text-label-md font-semibold hover:bg-surface-container"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    showToast(`Exported certified audit dossier for ${selectedDoc.docId}`);
                    setSelectedDoc(null);
                  }}
                  className="px-4 py-1.5 bg-primary-container text-on-primary rounded text-label-md font-semibold hover:bg-primary"
                >
                  Download Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
