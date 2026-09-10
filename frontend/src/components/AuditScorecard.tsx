'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Award, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

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
  const getScoreTheme = () => {
    if (score >= 85) {
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        ring: 'ring-emerald-500/30',
        statusText: 'BIS & CVC Compliant',
        label: 'Statutory Safe',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      };
    }
    if (score >= 50) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        ring: 'ring-amber-500/30',
        statusText: 'Rectification Required',
        label: 'Moderate Risk',
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      };
    }
    return {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      ring: 'ring-rose-500/30',
      statusText: 'Statutory Non-Compliant',
      label: 'High CAG Audit Risk',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
    };
  };

  const theme = getScoreTheme();

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80 relative z-10">
        
        {/* Title & Metadata */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              AUDIT DOSSIER
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg}`}>
              {theme.icon}
              {theme.statusText}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Procurement Integrity Scorecard
          </h3>
          
          <p className="text-xs text-slate-400 flex items-center gap-2">
            Reference Identifier: <span className="font-mono font-semibold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{tenderId}</span>
          </p>
        </div>

        {/* Big Score Radial Anchor */}
        <div className={`flex items-center gap-5 px-6 py-4 rounded-2xl border ${theme.border} ${theme.bg} backdrop-blur-xl shadow-lg self-start lg:self-auto`}>
          <div className="relative flex items-center justify-center">
            <Award className={`w-10 h-10 ${theme.text}`} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
              Compliance Index
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl md:text-5xl font-black tracking-tight ${theme.text}`}>
                {score}
              </span>
              <span className="text-slate-500 font-semibold text-sm">/ 100</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">{theme.label}</span>
          </div>
        </div>

      </div>

      {/* KPI 3-Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 relative z-10">
        
        {/* Critical Violations */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between group hover:border-rose-700/60 transition">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-rose-300/80 tracking-wider">
              Critical Defects
            </span>
            <div className="text-3xl font-black text-rose-400 mt-0.5">
              {criticalCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Obsolete IS codes & missing QCO
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-900/30 flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* High Risk Warnings */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-between group hover:border-amber-700/60 transition">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-amber-300/80 tracking-wider">
              Anti-Tailoring Flags
            </span>
            <div className="text-3xl font-black text-amber-400 mt-0.5">
              {highCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Brand bias & turnover barriers
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-900/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Foreign Standards / Procedural */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Procedural Flaws
            </span>
            <div className="text-3xl font-black text-accent-sky mt-0.5">
              {mediumCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Unmapped ASTM/DIN/ISO codes
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-accent-sky">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

    </div>
  );
};
