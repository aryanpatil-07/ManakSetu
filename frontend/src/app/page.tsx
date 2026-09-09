'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, FileText, CheckCircle, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { AuditScorecard } from '@/components/AuditScorecard';
import { StandardsGraph } from '@/components/StandardsGraph';
import { auditTender, TenderAuditResponse } from '@/lib/api';

const SAMPLE_DEMO_TEXT = `TECHNICAL SPECIFICATIONS FOR PIPELINE WORKS:
1. Pipes shall strictly conform to IS 4984:1995 or ASTM D3035.
2. Only Supreme or Astral make pipes shall be accepted.
3. Distribution transformers shall be 500 kVA conforming to IS 1180:1989.
4. Annual financial turnover of bidder must be Rs 650 Crores.`;

export default function DashboardPage() {
  const [inputText, setInputText] = useState(SAMPLE_DEMO_TEXT);
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<TenderAuditResponse | null>(null);

  const handleQuickAudit = async () => {
    setLoading(true);
    try {
      const res = await auditTender({
        tender_id: 'DEMO-NIT-2026',
        title: 'Municipal Pipeline Tender',
        text_content: inputText,
      });
      setAuditResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" /> BIS Act 2016 & CVC Compliance System
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Eliminate Flawed Standards & Tender Tailoring in Seconds.
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            ManakSetu cross-references tender clauses and BoQ items against 1,500+ Bureau of Indian Standards (BIS),
            679+ mandatory Quality Control Orders (QCOs), and Central Vigilance Commission (CVC) anti-tailoring rules.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/rfp-scanner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition"
            >
              Scrutinize Tender PDF <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/boq-auditor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Batch Audit Excel BoQ <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Quick-Audit Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Pane */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Live Tender Clause Scrutiny
              </h3>
              <button
                onClick={() => setInputText(SAMPLE_DEMO_TEXT)}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Reset Sample
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Paste tender clauses or technical specifications to inspect for obsolete IS codes, CVC brand tailoring, and missing QCO marks.
            </p>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">FastAPI hybrid retriever active</span>
            <button
              onClick={handleQuickAudit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Auditing...
                </>
              ) : (
                'Run Compliance Audit'
              )}
            </button>
          </div>
        </div>

        {/* Results Pane */}
        <div>
          {auditResult ? (
            <div className="space-y-6">
              <AuditScorecard
                score={auditResult.compliance_score}
                overallStatus={auditResult.overall_status}
                criticalCount={auditResult.critical_issues_count}
                highCount={auditResult.high_issues_count}
                mediumCount={auditResult.medium_issues_count}
                tenderId={auditResult.tender_id}
              />

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-white mb-3">Detected Violations:</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {auditResult.violations.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-400">{v.rule_name}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300">
                          {v.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-400">{v.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-12 h-12 text-slate-600 mb-3" />
              <h4 className="text-base font-medium text-slate-300">Audit Results Preview</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Click "Run Compliance Audit" on the left to evaluate this tender clause against BIS and CVC standards.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Standards Knowledge Graph Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Live Standards Knowledge Graph</h2>
          <p className="text-xs text-slate-400">
            Interactive NetworkX graph rendering active Indian Standards, obsolete citations, foreign equivalents, and mandatory QCOs.
          </p>
        </div>
        <StandardsGraph />
      </div>
    </div>
  );
}
