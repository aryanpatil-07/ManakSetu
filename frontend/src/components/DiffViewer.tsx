'use client';

import React from 'react';
import { CheckCircle2, AlertOctagon, GitCompare, ShieldCheck, AlertTriangle } from 'lucide-react';

interface DiffViewerProps {
  originalText: string;
  recommendedText: string;
  itemTitle?: string;
  reason?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalText,
  recommendedText,
  itemTitle = 'Statutory Tender Rectification & Redline Audit',
  reason = 'Upgraded to active Indian Standard revision, mandatory QCO citation inserted, and proprietary brand bias removed pursuant to GFR 2017 Rule 144(vii) & CVC Directives.',
}) => {
  return (
    <div className="bg-white rounded-md p-5 md:p-6 border border-slate-300 shadow-xs space-y-5">
      {/* Diff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0A2540] text-white">
              STATUTORY REDLINE
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              DEFECTIVE DRAFT VS. STATUTORY COMPLIANT NIT
            </span>
          </div>
          <h4 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-slate-600" />
            <span>{itemTitle}</span>
          </h4>
        </div>

        {reason && (
          <div className="px-3 py-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-lg">
            <span className="text-slate-900 font-bold uppercase text-[10px] font-mono block tracking-wider">
              Statutory Rectification Scope:
            </span>
            <span className="leading-snug block mt-0.5 font-normal">{reason}</span>
          </div>
        )}
      </div>

      {/* Side-by-Side Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Flagged / Defective Clause */}
        <div className="rounded border border-red-300 bg-red-50/40 p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-red-200">
            <div className="flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-950 font-mono">
                Original Draft Clause (Defective)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 border border-red-300 text-red-900">
              NON-CONFORMANT
            </span>
          </div>

          <div className="text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed bg-white p-3.5 rounded border border-slate-300 flex-1 select-text">
            {originalText}
          </div>

          <div className="text-[11px] text-red-950 font-medium flex items-center gap-1.5 pt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
            <span>Violates CVC brand-neutrality, cites superseded edition, or omits mandatory ISI marks.</span>
          </div>
        </div>

        {/* Right Column: Compliant / Harmonized Clause */}
        <div className="rounded border border-emerald-300 bg-emerald-50/40 p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-mono">
                Harmonized Clause (Statutory Compliant)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900">
              GFR-144 &amp; BIS READY
            </span>
          </div>

          <div className="text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed bg-white p-3.5 rounded border border-slate-300 flex-1 select-text">
            {recommendedText}
          </div>

          <div className="text-[11px] text-emerald-950 font-medium flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Harmonized with active national standards, mandatory QCO ISI mark, and brand-neutral terms.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
