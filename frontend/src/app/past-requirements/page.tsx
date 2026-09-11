'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchPastRequirements,
  deleteRequirement,
  seedSampleRequirements,
  RequirementRecord,
  RelatedClauseItem,
} from '@/lib/api';

export default function PastRequirementsPage() {
  const router = useRouter();

  // Data state
  const [requirements, setRequirements] = useState<RequirementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'ACTION_REQUIRED' | 'NON_COMPLIANT'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Expanded card inputs
  const [expandedInputs, setExpandedInputs] = useState<Record<string, boolean>>({});
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});

  // Active modal inspection
  const [selectedRecord, setSelectedRecord] = useState<RequirementRecord | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const histRes = await fetchPastRequirements({ limit: 100 });
      setRequirements(histRes.records || []);
    } catch (err) {
      console.error('Failed to load past requirements:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedSampleRequirements();
      await loadData(true);
    } catch (err) {
      console.error('Failed to seed sample requirements:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this historical requirement record?')) {
      return;
    }

    try {
      await deleteRequirement(id);
      setRequirements((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      console.error('Failed to delete requirement:', err);
      alert('Could not delete requirement record.');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleInputExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedInputs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleClausesExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedClauses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((rec) => {
      // Status filter
      if (statusFilter !== 'ALL' && rec.overall_status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && rec.audit_type !== typeFilter) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const inTitle = rec.tender_title?.toLowerCase().includes(query);
        const inDept = rec.department?.toLowerCase().includes(query);
        const inText = rec.input_text?.toLowerCase().includes(query);
        const inClause = rec.generated_compliant_clause?.toLowerCase().includes(query);
        const inStandards = rec.detected_standards?.some((st: any) =>
          (st.specified || st.recommended_standard || st.title || '').toLowerCase().includes(query)
        );

        return inTitle || inDept || inText || inClause || inStandards;
      }

      return true;
    });
  }, [requirements, statusFilter, typeFilter, searchTerm]);

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent submission';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-unit-lg gap-unit-md">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-body-xs font-mono text-outline font-semibold">
              ORDERED: MOST RECENT FIRST ↓
            </span>
          </div>

          <h1 className="font-display-lg text-display-lg text-primary tracking-tight mt-1 font-bold">
            Past Procurement Requirements
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Historical registry of procurement officer submissions, computed compliance scores, detected BIS/QCO standards, and synthesized compliant statutory clauses.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 self-start shrink-0 flex-wrap">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors text-body-sm font-medium shadow-xs disabled:opacity-50"
            title="Refresh records"
          >
            <span className={`material-symbols-outlined text-[18px] ${refreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {requirements.length === 0 && !loading && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-secondary-container/50 bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim transition-colors text-body-sm font-medium shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">data_object</span>
              <span>{seeding ? 'Seeding Samples...' : 'Seed Sample Requirements'}</span>
            </button>
          )}

          <Link
            href="/new-analysis"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-medium text-body-sm shadow-sm hover:bg-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ New Tender Scrutiny</span>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-outline-variant/60 my-2" />

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 my-3 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by tender title, department, requirement keyword, or standard (e.g. IS 4984)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-body-sm bg-surface-container-low border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-body-xs"
            >
              clear
            </button>
          )}
        </div>

        {/* Right: Status Filters & Type Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="inline-flex rounded-lg border border-outline-variant/60 bg-surface-container-low p-0.5 text-body-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All ({requirements.length})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLIANT')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'COMPLIANT'
                  ? 'bg-surface-container-lowest text-emerald-800 shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Compliant (≥85%)
            </button>
            <button
              onClick={() => setStatusFilter('ACTION_REQUIRED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'ACTION_REQUIRED'
                  ? 'bg-surface-container-lowest text-amber-800 shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Action Required
            </button>
            <button
              onClick={() => setStatusFilter('NON_COMPLIANT')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'NON_COMPLIANT'
                  ? 'bg-surface-container-lowest text-rose-800 shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Non-Compliant
            </button>
          </div>

          {/* Audit Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-body-xs bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Formats</option>
            <option value="TEXT">Text Specifications</option>
            <option value="MULTIMODAL">Multimodal / OCR</option>
            <option value="PDF">PDF Scrutiny</option>
            <option value="BOQ">Excel BoQ</option>
          </select>
        </div>
      </div>

      {/* REQUIREMENTS LIST FEED (ORDERED MOST RECENT TO LEAST) */}
      <div className="mt-4 flex flex-col gap-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-xs">
            <span className="material-symbols-outlined text-primary text-[36px] animate-spin">
              progress_activity
            </span>
            <p className="mt-3 text-body-md text-on-surface-variant font-medium">
              Loading past procurement requirements...
            </p>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="py-16 px-6 text-center bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-xs flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
              <span className="material-symbols-outlined text-[32px]">manage_search</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
              No Past Requirements Found
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'No past requirements match your current search or filter criteria. Try clearing filters.'
                : 'No procurement requirements have been recorded yet. Audit your first specification to persist it automatically.'}
            </p>

            <div className="mt-5 flex items-center gap-3">
              {requirements.length === 0 ? (
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="px-4 py-2 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-medium text-body-sm shadow-xs hover:bg-secondary-fixed-dim transition-colors"
                >
                  {seeding ? 'Seeding Samples...' : 'Load Realistic Golden Samples'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setTypeFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-lg border border-outline-variant text-body-sm font-medium hover:bg-surface-container transition-colors"
                >
                  Clear Filters
                </button>
              )}

              <Link
                href="/new-analysis"
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-medium text-body-sm shadow-xs hover:bg-primary transition-colors"
              >
                + Audit Tender Requirement
              </Link>
            </div>
          </div>
        ) : (
          filteredRequirements.map((rec, index) => {
            const isInputExpanded = !!expandedInputs[rec.id];
            const areClausesExpanded = !!expandedClauses[rec.id];
            const hasClauses = rec.related_clauses && rec.related_clauses.length > 0;

            // Determine status style
            let statusBadge = {
              bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
              label: 'COMPLIANT',
              dot: 'bg-emerald-600',
            };
            if (rec.overall_status === 'NON_COMPLIANT' || rec.compliance_score < 50) {
              statusBadge = {
                bg: 'bg-rose-50 text-rose-900 border-rose-300',
                label: 'NON-COMPLIANT',
                dot: 'bg-rose-600',
              };
            } else if (rec.overall_status === 'ACTION_REQUIRED' || rec.compliance_score < 85) {
              statusBadge = {
                bg: 'bg-amber-50 text-amber-900 border-amber-300',
                label: 'ACTION REQUIRED',
                dot: 'bg-amber-600',
              };
            }

            return (
              <div
                key={rec.id}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                {/* Top Row: Meta Tags & Score */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-outline-variant/40 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Index rank */}
                    <span className="font-mono text-[11px] font-bold text-outline px-1.5 py-0.5 rounded bg-surface-container">
                      #{index + 1}
                    </span>

                    {/* Department Tag */}
                    <span className="font-label-eyebrow text-[11px] uppercase tracking-wider font-semibold text-primary px-2.5 py-1 rounded bg-primary-fixed/40 border border-primary-fixed">
                      {rec.department || 'Public Works Directorate'}
                    </span>

                    {/* Format Tag */}
                    <span className="text-[11px] font-medium text-on-surface-variant px-2 py-0.5 rounded bg-surface-container flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        {rec.audit_type === 'MULTIMODAL'
                          ? 'photo_camera'
                          : rec.audit_type === 'PDF'
                          ? 'picture_as_pdf'
                          : rec.audit_type === 'BOQ'
                          ? 'table_view'
                          : 'description'}
                      </span>
                      {rec.audit_type === 'MULTIMODAL'
                        ? 'Multimodal Image / Nameplate'
                        : rec.audit_type === 'PDF'
                        ? 'PDF RFP Scrutiny'
                        : rec.audit_type === 'BOQ'
                        ? 'Excel BoQ Batch'
                        : 'Specification Text'}
                    </span>

                    {/* Timestamp */}
                    <span className="text-[12px] text-outline font-mono">
                      {formatDate(rec.created_at)}
                    </span>
                  </div>

                  {/* Compliance Score Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-body-xs font-mono font-bold border ${statusBadge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                      <span>{rec.compliance_score}% SCORE</span>
                      <span className="text-[10px] uppercase font-sans font-semibold tracking-wider">
                        • {statusBadge.label}
                      </span>
                    </div>

                    {/* Delete action button */}
                    <button
                      onClick={(e) => handleDelete(rec.id, e)}
                      className="p-1 text-outline hover:text-error hover:bg-error-container/30 rounded transition-colors"
                      title="Delete record"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Tender Title */}
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    {rec.tender_title || 'Procurement Tender Requirement'}
                  </h3>
                  {rec.summary_advisory && (
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      {rec.summary_advisory}
                    </p>
                  )}
                </div>

                {/* 1. OFFICER INPUT REQUEST BOX */}
                <div className="bg-surface-container-low/70 border border-outline-variant/40 rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-label-eyebrow text-[10px] uppercase font-bold tracking-widest text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-primary">rate_review</span>
                      PROCUREMENT OFFICER INPUT REQUEST
                    </span>
                    {rec.input_text && rec.input_text.length > 200 && (
                      <button
                        onClick={(e) => toggleInputExpand(rec.id, e)}
                        className="text-[12px] text-primary hover:underline font-medium flex items-center gap-0.5"
                      >
                        {isInputExpanded ? 'Collapse' : 'Show full input'}
                        <span className="material-symbols-outlined text-[16px]">
                          {isInputExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    )}
                  </div>

                  <p className={`font-mono text-body-xs text-on-surface whitespace-pre-wrap leading-relaxed ${
                    !isInputExpanded && rec.input_text && rec.input_text.length > 200
                      ? 'line-clamp-3'
                      : ''
                  }`}>
                    {rec.input_text || 'No raw input text captured.'}
                  </p>
                </div>

                {/* 2. DETECTED STANDARDS & VIOLATIONS SUMMARY TAGS */}
                <div className="flex flex-wrap items-center gap-2">
                  {rec.detected_standards && rec.detected_standards.map((st: any, idx: number) => {
                    const code = st.recommended_standard || st.specified;
                    const isQco = st.is_qco_mandatory;
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-body-xs font-mono font-medium border ${
                          isQco
                            ? 'bg-primary-fixed/40 text-on-primary-fixed border-primary-fixed font-semibold'
                            : 'bg-surface-container text-on-surface border-outline-variant/50'
                        }`}
                        title={st.title || 'Indian Standard'}
                      >
                        <span className="material-symbols-outlined text-[14px] text-secondary">
                          {isQco ? 'verified' : 'bookmark'}
                        </span>
                        <span>{code}</span>
                        {isQco && (
                          <span className="text-[9px] bg-secondary-container text-on-secondary-container font-sans font-bold px-1 rounded uppercase">
                            QCO Mandate
                          </span>
                        )}
                      </span>
                    );
                  })}

                  {rec.violations && rec.violations.map((v: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-body-xs font-mono font-medium bg-rose-50 text-rose-900 border border-rose-300"
                    >
                      <span className="material-symbols-outlined text-[14px] text-rose-600">warning</span>
                      <span>{v.matched_text || v.rule_id || 'CVC Violation'}</span>
                    </span>
                  ))}
                </div>

                {/* 3. RELATED CLAUSES PREVIEW (SYNTHESIZED NIT & STATUTORY CLAUSES) */}
                {hasClauses && (
                  <div className="border border-outline-variant/40 rounded-lg p-3 bg-surface-container-lowest">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-secondary text-[18px]">gavel</span>
                        <span className="font-label-eyebrow text-[11px] uppercase font-bold tracking-wider text-primary">
                          Related Clauses ({rec.related_clauses.length} Synthesized / Statutory Directives)
                        </span>
                      </div>

                      <button
                        onClick={(e) => toggleClausesExpand(rec.id, e)}
                        className="text-body-xs font-medium text-primary hover:underline flex items-center gap-0.5"
                      >
                        {areClausesExpanded ? 'Hide clauses' : 'View all clauses'}
                        <span className="material-symbols-outlined text-[16px]">
                          {areClausesExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>

                    {/* Always show preview of primary NIT synthesized clause */}
                    {rec.generated_compliant_clause && (
                      <div className="mt-2.5 p-3 rounded bg-surface-container-low border border-outline-variant/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-primary flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Synthesized Audit-Proof NIT Clause
                          </span>
                          <button
                            onClick={() => copyToClipboard(rec.generated_compliant_clause!, `nit-${rec.id}`)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedId === `nit-${rec.id}` ? 'check' : 'content_copy'}
                            </span>
                            {copiedId === `nit-${rec.id}` ? 'Copied' : 'Copy Clause'}
                          </button>
                        </div>
                        <p className={`font-mono text-body-xs text-on-surface leading-relaxed ${
                          !areClausesExpanded ? 'line-clamp-2' : ''
                        }`}>
                          {rec.generated_compliant_clause}
                        </p>
                      </div>
                    )}

                    {/* If expanded, show full list of related statutory and GFR clauses */}
                    {areClausesExpanded && (
                      <div className="mt-3 flex flex-col gap-2.5 pt-2 border-t border-outline-variant/30">
                        {rec.related_clauses.map((cl, clIdx) => (
                          <div key={clIdx} className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/50">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                                  cl.clause_type === 'STATUTORY_QCO'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : cl.clause_type === 'GFR_144_HARMONIZATION'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}>
                                  {cl.badge || cl.clause_type}
                                </span>
                                <span className="font-semibold text-body-xs text-primary font-mono">
                                  {cl.title}
                                </span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(cl.content, `cl-${rec.id}-${clIdx}`)}
                                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {copiedId === `cl-${rec.id}-${clIdx}` ? 'check' : 'content_copy'}
                                </span>
                                {copiedId === `cl-${rec.id}-${clIdx}` ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <p className="font-mono text-[12px] text-on-surface whitespace-pre-wrap leading-relaxed bg-surface-container-low p-2.5 rounded border border-outline-variant/30">
                              {cl.content}
                            </p>
                            {cl.source && (
                              <p className="text-[10px] text-outline mt-1 font-mono">
                                Source: {cl.source}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                  <span className="font-mono text-[11px] text-outline">
                    Record ID: {rec.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant text-primary hover:bg-surface-container text-body-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Full Audit Scorecard
                    </button>

                    <button
                      onClick={() => {
                        const targetStd = rec.detected_standards?.[0]?.recommended_standard || rec.detected_standards?.[0]?.specified || 'IS 4984';
                        router.push(`/specification-builder?standard=${encodeURIComponent(targetStd)}&title=${encodeURIComponent(rec.tender_title || '')}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-body-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_document</span>
                      Open in Spec Builder
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAILED AUDIT SCORECARD MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-outline-variant">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                    {selectedRecord.tender_title}
                  </h2>
                  <p className="text-body-xs text-on-surface-variant font-mono">
                    ID: {selectedRecord.id} • {selectedRecord.department} • {formatDate(selectedRecord.created_at)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {/* Compliance Scorecard */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-wider text-outline font-bold">
                    Scrutiny Compliance Evaluation
                  </span>
                  <div className="font-display-md text-display-md font-bold text-primary mt-1">
                    {selectedRecord.compliance_score}%
                    <span className="text-body-sm font-mono text-outline font-normal ml-2">
                      ({selectedRecord.overall_status})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-center">
                  <div className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40">
                    <span className="text-body-xs text-outline font-medium block">Critical Defects</span>
                    <span className="font-mono font-bold text-error text-headline-sm">
                      {selectedRecord.critical_issues_count}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40">
                    <span className="text-body-xs text-outline font-medium block">High Violations</span>
                    <span className="font-mono font-bold text-secondary text-headline-sm">
                      {selectedRecord.high_issues_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Input Text */}
              <div>
                <h4 className="font-label-md text-label-md font-bold text-primary mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">notes</span>
                  Complete Procurement Officer Input Request
                </h4>
                <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/50 font-mono text-body-xs text-on-surface whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {selectedRecord.input_text}
                </div>
              </div>

              {/* Violations List */}
              {selectedRecord.violations && selectedRecord.violations.length > 0 && (
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-error mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    Identified CVC Anti-Tailoring &amp; Regulatory Violations ({selectedRecord.violations.length})
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedRecord.violations.map((v: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-rose-900 text-body-xs">
                            {v.rule_id || 'VIOLATION'}: {v.rule_name || v.matched_text}
                          </span>
                          <span className="text-[10px] font-bold uppercase bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                            {v.severity || 'CRITICAL'}
                          </span>
                        </div>
                        <p className="text-body-xs text-rose-800 mt-1">
                          {v.message}
                        </p>
                        {v.recommended_action && (
                          <p className="text-body-xs font-semibold text-rose-900 mt-1">
                            Remedy: {v.recommended_action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Clauses List */}
              {selectedRecord.related_clauses && selectedRecord.related_clauses.length > 0 && (
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-primary mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    Related Clauses &amp; Synthesized Tender Directives ({selectedRecord.related_clauses.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {selectedRecord.related_clauses.map((cl: RelatedClauseItem, i: number) => (
                      <div key={i} className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/60">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-body-xs text-primary">
                              {cl.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-primary-fixed/50 text-primary">
                              {cl.badge || cl.clause_type}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(cl.content, `modal-cl-${i}`)}
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedId === `modal-cl-${i}` ? 'check' : 'content_copy'}
                            </span>
                            {copiedId === `modal-cl-${i}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="font-mono text-[12px] text-on-surface whitespace-pre-wrap leading-relaxed p-3 bg-surface-container-lowest rounded border border-outline-variant/40">
                          {cl.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant/60 flex items-center justify-end gap-2 bg-surface-container-low">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors text-body-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const targetStd = selectedRecord.detected_standards?.[0]?.recommended_standard || selectedRecord.detected_standards?.[0]?.specified || 'IS 4984';
                  setSelectedRecord(null);
                  router.push(`/specification-builder?standard=${encodeURIComponent(targetStd)}&title=${encodeURIComponent(selectedRecord.tender_title || '')}`);
                }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors text-body-sm font-medium"
              >
                Draft Specification with this Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
