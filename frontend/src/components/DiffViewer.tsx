'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, AlertOctagon, GitCompare } from 'lucide-react';

interface DiffViewerProps {
  originalText: string;
  recommendedText: string;
  itemTitle?: string;
  reason?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalText,
  recommendedText,
  itemTitle = 'Specification Diff & Redline Rectification',
  reason = 'CVC & BIS compliance modification',
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-blue/15 text-accent-sky border border-accent-blue/30">
              REDLINE DIFF
            </span>
            <span className="text-[10px] font-mono text-slate-400">BEFORE VS. AFTER AUDIT</span>
          </div>
          <h4 className="text-lg font-black text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-accent-cyan" />
            {itemTitle}
          </h4>
        </div>

        {reason && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 max-w-md">
            <span className="text-slate-500 font-semibold uppercase text-[9px] block">Audit Rationale:</span>
            {reason}
          </div>
        )}
      </div>

      {/* Side-by-Side Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column: Flagged / Defective */}
        <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-rose-900/30">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 font-mono">
                Flagged Clause (Defective)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              NON-COMPLIANT
            </span>
          </div>
          
          <div className="text-xs font-mono text-rose-200/90 whitespace-pre-wrap leading-relaxed bg-rose-950/40 p-4 rounded-xl border border-rose-900/30 flex-1">
            {originalText}
          </div>
          
          <div className="text-[10px] text-rose-400/80 font-mono">
            ⚠️ Contains obsolete edition numbers, proprietary brand bias, or missing ISI marks.
          </div>
        </div>

        {/* Right Column: Compliant / Harmonized */}
        <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
                Compliant Rectification (Safe)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              BIS & CVC READY
            </span>
          </div>

          <div className="text-xs font-mono text-emerald-200/90 whitespace-pre-wrap leading-relaxed bg-emerald-950/40 p-4 rounded-xl border border-emerald-900/30 flex-1">
            {recommendedText}
          </div>

          <div className="text-[10px] text-emerald-400/90 font-mono">
            ✓ Upgraded to latest gazetted revision, statutory ISI mark mandated, brand-neutral.
          </div>
        </div>

      </div>

    </div>
  );
};
