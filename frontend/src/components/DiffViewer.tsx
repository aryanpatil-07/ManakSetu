import React from 'react';
import { ArrowRight, CheckCircle2, AlertOctagon } from 'lucide-react';

interface DiffViewerProps {
  originalText: string;
  recommendedText: string;
  itemTitle?: string;
  reason?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalText,
  recommendedText,
  itemTitle = 'Specification Diff & Rectification',
  reason = 'CVC & BIS compliance modification',
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-4">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-indigo-400" />
          {itemTitle}
        </h4>
        {reason && <p className="text-xs text-slate-400 mt-1">{reason}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Original / Flagged */}
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Flagged Tender Clause (Defective)
            </span>
          </div>
          <div className="text-sm font-mono text-rose-200/90 whitespace-pre-wrap leading-relaxed bg-rose-950/40 p-3 rounded-lg border border-rose-900/30">
            {originalText}
          </div>
        </div>

        {/* Right Column: Compliant / Recommended */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Compliant BIS Rectification (Legally Safe)
            </span>
          </div>
          <div className="text-sm font-mono text-emerald-200/90 whitespace-pre-wrap leading-relaxed bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/30">
            {recommendedText}
          </div>
        </div>
      </div>
    </div>
  );
};
