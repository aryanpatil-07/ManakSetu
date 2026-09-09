'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Download, Award } from 'lucide-react';
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
      complianceScore: 92,
      overallStatus: 'COMPLIANT',
      recommendedStandard: 'IS 4984:2016',
      standardTitle: `${category} Standard Specifications`,
      qcoMandatory: true,
      synthesizedClause: clauseText,
    };
    generateAuditCertificatePDF(certPayload);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h4 className="font-semibold text-white">Bid-Ready Compliant Procurement Clause</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied for GeM!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Clause for GeM
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPdfCertificate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-950/40 transition"
          >
            <Award className="w-3.5 h-3.5" /> Download CAG Audit Certificate (PDF)
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" /> .md
          </button>
        </div>
      </div>

      {/* Clause Content Display */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
        {clauseText}
      </div>

      {/* Regulatory References & Checklist */}
      {(regulations.length > 0 || checklist.length > 0) && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {regulations.length > 0 && (
            <div>
              <div className="font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Legal & Regulatory Precedents:
              </div>
              <ul className="space-y-1 text-slate-400 list-disc list-inside">
                {regulations.map((reg, idx) => (
                  <li key={idx}>{reg}</li>
                ))}
              </ul>
            </div>
          )}
          {checklist.length > 0 && (
            <div>
              <div className="font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Tender Officer Verification Checklist:
              </div>
              <ul className="space-y-1 text-emerald-400/90 list-disc list-inside">
                {checklist.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
