'use client';

import React from 'react';
import { VisualGapItem, IsiVerificationResult } from '@/lib/api';

interface VisualGapMatrixProps {
  isiVerification?: IsiVerificationResult | null;
  visualGapMatrix?: VisualGapItem[] | null;
  imageExtractedText?: string | null;
  imagePreviewUrl?: string | null;
}

export default function VisualGapMatrix({
  isiVerification,
  visualGapMatrix,
  imageExtractedText,
  imagePreviewUrl,
}: VisualGapMatrixProps) {
  if (!isiVerification && (!visualGapMatrix || visualGapMatrix.length === 0)) {
    return null;
  }

  return (
    <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest shadow-sm overflow-hidden space-y-4 p-5 animate-fade-in-up">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[20px]">document_scanner</span>
          </span>
          <div>
            <h3 className="font-headline-md text-body-md font-bold text-primary">
              Multi-Modal Visual Gap Matrix &amp; Physical Scrutiny
            </h3>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Cross-referencing physical equipment photo / nameplate against buyer&apos;s draft tender specification.
            </p>
          </div>
        </div>
      </div>

      {/* ISI LICENSE & CM/L VERIFICATION BANNER */}
      {isiVerification && (
        <div
          className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-start gap-4 ${
            isiVerification.status === 'VERIFIED_LICENSE'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : isiVerification.status === 'PRODUCT_MISMATCH' || isiVerification.status === 'UNCERTIFIED_RISK'
              ? 'bg-red-50 border-red-300 text-red-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          {/* Status Icon */}
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              isiVerification.status === 'VERIFIED_LICENSE'
                ? 'bg-emerald-600 text-white'
                : isiVerification.status === 'PRODUCT_MISMATCH' || isiVerification.status === 'UNCERTIFIED_RISK'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-amber-600 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isiVerification.status === 'VERIFIED_LICENSE'
                ? 'verified'
                : isiVerification.status === 'PRODUCT_MISMATCH'
                ? 'report'
                : isiVerification.status === 'UNCERTIFIED_RISK'
                ? 'gavel'
                : 'help_outline'}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-body-sm uppercase tracking-wide">
                {isiVerification.status === 'VERIFIED_LICENSE'
                  ? 'BIS Standard Mark (ISI) Verified on Product'
                  : isiVerification.status === 'PRODUCT_MISMATCH'
                  ? 'Product Mismatch Alert: Image Invalid for Specified Requirement'
                  : isiVerification.status === 'UNCERTIFIED_RISK'
                  ? 'Statutory Alert: Uncertified Goods Detected under Mandatory QCO'
                  : 'Voluntary Standard: No BIS License Found on Label'}
              </span>
              {isiVerification.license_number && (
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900">
                  {isiVerification.license_number}
                </span>
              )}
              {isiVerification.applicable_standard && (
                <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-surface text-on-surface border border-outline-variant/40">
                  Governing Standard: {isiVerification.applicable_standard}
                </span>
              )}
            </div>

            <p className="text-[13px] leading-relaxed">
              {isiVerification.verification_message}
            </p>

            {isiVerification.statutory_alert && (
              <div className="mt-2 p-3 rounded bg-red-100/90 border border-red-400/80 text-red-900 text-[12px] font-medium leading-normal flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-700 shrink-0 mt-0.5">
                  warning
                </span>
                <span>{isiVerification.statutory_alert}</span>
              </div>
            )}
          </div>
        </div>
      )}


      {/* THE VISUAL GAP MATRIX TABLE */}
      {visualGapMatrix && visualGapMatrix.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-eyebrow text-[11px] uppercase tracking-wider text-outline font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">compare_arrows</span>
              The Visual Gap Matrix ({visualGapMatrix.length} Feature Alignments):
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              Observed Image Attributes vs Buyer Specification
            </span>
          </div>

          <div className="overflow-x-auto border border-outline-variant/60 rounded-lg bg-surface">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant/60 text-on-surface font-semibold">
                  <th className="py-2.5 px-3 w-[20%]">Inspected Feature</th>
                  <th className="py-2.5 px-3 w-[24%]">Observed on Physical Image</th>
                  <th className="py-2.5 px-3 w-[16%]">Status in Tender Text</th>
                  <th className="py-2.5 px-3 w-[22%]">Statutory / BIS Mandate</th>
                  <th className="py-2.5 px-3 w-[18%]">Remediation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {visualGapMatrix.map((item, idx) => {
                  const status = item.status_in_text;
                  const isDiscrepancy = status === 'DISCREPANCY';
                  const isMissing = status === 'MISSING_FROM_TEXT' || status === 'NOT_STIPULATED';
                  const isMatched = status === 'MATCHED';

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors hover:bg-surface-container-low/80 ${
                        isDiscrepancy
                          ? 'bg-red-50/40'
                          : isMissing
                          ? 'bg-amber-50/30'
                          : 'bg-emerald-50/20'
                      }`}
                    >
                      {/* Inspected Feature */}
                      <td className="py-3 px-3 font-semibold text-primary">
                        {item.feature_name}
                      </td>

                      {/* Observed on Physical Image */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-800">
                        {item.image_value}
                      </td>

                      {/* Status in Tender Text */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isMatched
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isDiscrepancy
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {isMatched
                              ? 'check_circle'
                              : isDiscrepancy
                              ? 'cancel'
                              : 'help'}
                          </span>
                          <span>{status.replace(/_/g, ' ')}</span>
                        </span>
                      </td>

                      {/* Statutory Mandate */}
                      <td className="py-3 px-3 text-on-surface-variant text-[11px] leading-relaxed">
                        {item.statutory_requirement}
                      </td>

                      {/* Remediation Action */}
                      <td className="py-3 px-3 text-[11px] font-medium text-secondary leading-snug">
                        {item.remediation_action}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
