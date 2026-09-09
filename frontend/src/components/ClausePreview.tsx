'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Download } from 'lucide-react';

interface ClausePreviewProps {
  clauseText: string;
  category?: string;
  regulations?: string[];
  checklist?: string[];
}

export const ClausePreview: React.FC<ClausePreviewProps> = ({
  clauseText,
  category = 'Procurement Item',
  regulations = [],
  checklist = [],
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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h4 className="font-semibold text-white">Bid-Ready Compliant Procurement Clause</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Clause
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            <Download className="w-3.5 h-3.5" /> Download .md
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
