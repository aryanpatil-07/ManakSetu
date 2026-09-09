import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Award } from 'lucide-react';

interface AuditScorecardProps {
  score: number;
  overallStatus: 'COMPLIANT' | 'ACTION_REQUIRED' | 'NON_COMPLIANT';
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  tenderId?: string;
}

export const AuditScorecard: React.FC<AuditScorecardProps> = ({
  score,
  overallStatus,
  criticalCount,
  highCount,
  mediumCount,
  tenderId = 'TENDER-SCRUTINY',
}) => {
  const getScoreColor = () => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-4 h-4" /> BIS & CVC Compliant
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-4 h-4" /> Rectification Required
          </span>
        );
      case 'NON_COMPLIANT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-4 h-4" /> High Risk / Non-Compliant
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white tracking-tight">Audit Scorecard</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Reference ID: <span className="font-mono text-slate-300">{tenderId}</span>
          </p>
        </div>

        {/* Big Score Gauge */}
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${getScoreColor()}`}>
          <Award className="w-7 h-7" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Compliance Index</div>
            <div className="text-2xl font-black">{score}<span className="text-sm font-normal">/100</span></div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-rose-400">{criticalCount}</div>
          <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">Critical Violations</div>
        </div>
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{highCount}</div>
          <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">High Risk Warnings</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{mediumCount}</div>
          <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">Procedural Flaws</div>
        </div>
      </div>
    </div>
  );
};
