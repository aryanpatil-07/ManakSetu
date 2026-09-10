'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Download, Award, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { generateAuditCertificatePDF, AuditCertificateData } from '@/lib/pdf_export';

interface ClausePreviewProps {
  clauseText: string;
  category?: string;
  regulations?: string[];
  checklist?: string[];
  certificateData?: AuditCertificateData;
}

export const ClausePreview: React.FC<ClausePreviewProps> = ({
  clauseText,
  category = 'Procurement Item',
  regulations = [],
  checklist = [],
  certificateData,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clauseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([clauseText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliant_clause_${category.toLowerCase().replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdfCertificate = () => {
    const certPayload: AuditCertificateData = certificateData || {
      tenderId: `TND-${category.toUpperCase().replace(/\s+/g, '-')}`,
      tenderTitle: `${category} Procurement Specification`,
      department: 'Central / State Public Procurement Directorate',
      complianceScore: 94,
      overallStatus: 'COMPLIANT',
      recommendedStandard: 'IS 4984:2016',
      standardTitle: `${category} Standard Specifications`,
      qcoMandatory: true,
      synthesizedClause: clauseText,
    };
    generateAuditCertificatePDF(certPayload);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              SYNTHESIZED
            </span>
            <span className="font-mono text-[10px] text-slate-400 uppercase">CVC SAFE SPECIFICATION</span>
          </div>
          <h4 className="text-lg font-black text-white mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Bid-Ready Compliant Procurement Clause
          </h4>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" /> Copied for GeM / CPPP!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-accent-sky" /> Copy for GeM
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPdfCertificate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-950/40 transition duration-200"
          >
            <Award className="w-3.5 h-3.5" /> CAG Audit Certificate (PDF)
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            title="Download Markdown"
          >
            <Download className="w-3.5 h-3.5" /> .md
          </button>
        </div>
      </div>

      {/* Clause Code Box */}
      <div className="relative group">
        <div className="p-5 rounded-2xl bg-canvas-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-accent-blue selection:text-white">
          {clauseText}
        </div>
      </div>

      {/* Precedents & Checklist Section */}
      {(regulations.length > 0 || checklist.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          
          {/* Statutory Precedents */}
          {regulations.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-accent-sky" />
                Legal & Gazetted Precedents
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {regulations.map((reg, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-accent-sky font-bold">•</span>
                    <span>{reg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tender Officer Verification Checklist */}
          {checklist.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Tender Officer Verification Checklist
              </div>
              <ul className="space-y-1.5 text-emerald-200/90 text-[11px]">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
