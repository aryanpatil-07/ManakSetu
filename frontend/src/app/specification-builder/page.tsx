'use client';

import React, { useState } from 'react';

interface SectionData {
  id: string;
  num: string;
  title: string;
  status: 'verified' | 'linked' | 'pending';
  content: string;
  recommendation?: string;
  suggestedAppend?: string;
}

const SECTIONS: SectionData[] = [
  {
    id: 'sec-1',
    num: '1.0',
    title: 'Product description',
    status: 'verified',
    content:
      '50 kVA, 11 kV / 433 V outdoor distribution transformer, mineral oil immersed, ONAN cooling, suitable for municipal substation service.',
    recommendation:
      'Standard tender stipulations for DISCOMs require specifying ambient temperature tolerance (+50°C) and core loss limits in the preliminary product summary.',
    suggestedAppend:
      'Operating Parameters: Designed to operate continuously under maximum ambient temperature of 50°C and 100% relative humidity in dusty tropical conditions.',
  },
  {
    id: 'sec-2',
    num: '2.0',
    title: 'Technical requirements',
    status: 'verified',
    content:
      'Core material shall be high grade Cold Rolled Grain Oriented (CRGO) silicon steel or amorphous metal. Maximum flux density not to exceed 1.69 Tesla at rated voltage and frequency.',
    recommendation:
      'Mandate compliance with Central Electricity Authority (CEA) Technical Standards for Construction of Electrical Plants and Electric Lines.',
    suggestedAppend:
      'CEA Mandate: Core assembly shall comply with CEA Technical Standards 2010 Regulation 12.',
  },
  {
    id: 'sec-3',
    num: '3.0',
    title: 'Performance requirements',
    status: 'verified',
    content:
      'Total losses at 50% and 100% loading shall not exceed the values specified in IS 1180 (Part 1):2014 for Energy Efficiency Level 2.',
    recommendation:
      'BEE Star Labeling scheme mandates star rating verification against Bureau of Energy Efficiency schedule.',
    suggestedAppend:
      'Energy Efficiency: Unit shall possess valid BEE 4-Star rating label.',
  },
  {
    id: 'sec-4',
    num: '4.0',
    title: 'Applicable standards',
    status: 'pending',
    content:
      '1. IS 1180 (Part 1):2014 - Outdoor Type Three-Phase Distribution Transformers.\n2. IS 2026 (Parts 1-5) - Power Transformers.\n3. IS 335:2018 - Specification for New Insulating Oils.',
    recommendation: 'Ensure all normative standards explicitly state edition years to eliminate ambiguity.',
  },
  {
    id: 'sec-5',
    num: '5.0',
    title: 'Testing requirements',
    status: 'pending',
    content:
      'Routine and Type tests shall be carried out in accordance with IS 1180 (Part 1):2014 at a NABL accredited independent test laboratory.',
    recommendation: 'Specify mandatory short-circuit withstand test certificate from CPRI / ERDA.',
    suggestedAppend:
      'Testing Laboratory: Type test reports shall be valid within 5 years from CPRI or ERDA.',
  },
  {
    id: 'sec-6',
    num: '6.0',
    title: 'Safety requirements',
    status: 'pending',
    content:
      'Pressure relief device with visual indicator and alarm contacts shall be fitted to discharge excessive internal tank pressure.',
  },
  {
    id: 'sec-7',
    num: '7.0',
    title: 'Certification requirements',
    status: 'pending',
    content:
      'Manufacturer must hold valid BIS Certification Marks License (ISI mark) under Scheme-I of BIS (Conformity Assessment) Regulations, 2018.',
  },
  {
    id: 'sec-8',
    num: '8.0',
    title: 'Installation requirements',
    status: 'pending',
    content:
      'Plinth mounting base channel with dual dedicated earthing terminals complying with IS 3043:2018 (Code of practice for earthing).',
  },
  {
    id: 'sec-9',
    num: '9.0',
    title: 'Inspection & acceptance',
    status: 'pending',
    content:
      'Joint inspection at manufacturer works prior to dispatch by designated third party inspection agency (RITES / SGS / CEIL).',
  },
];

const RELEVANT_STANDARDS = [
  {
    code: 'IS 1180 (Part 1):2014',
    badge: 'Mandatory',
    badgeColor: 'bg-tertiary-fixed/60 text-tertiary',
    title: 'Outdoor Three-Phase Distribution Transformers',
    match: '98% relevant',
    clause:
      'All transformers shall rigorously conform to IS 1180 (Part 1):2014 with maximum total losses at 50% and 100% loading as per standard Level 2 schedule.',
  },
  {
    code: 'IS 2026 (Part 1):2011',
    badge: 'Harmonized',
    badgeColor: 'bg-surface-container text-on-surface-variant',
    title: 'Power Transformers — General',
    match: '94% relevant',
    clause:
      'Ratings, temperature rise limits, and general mechanical structural requirements shall comply fully with IS 2026 (Part 1):2011.',
  },
  {
    code: 'IS 335:2018',
    badge: 'Material',
    badgeColor: 'bg-surface-container text-on-surface-variant',
    title: 'Specification for New Insulating Oils',
    match: '91% relevant',
    clause:
      'Transformer mineral insulating oil shall be brand new, uninhibited and meet all dielectric breakdown and moisture limits defined in IS 335:2018.',
  },
];

export default function SpecificationBuilderPage() {
  const [selectedSecIndex, setSelectedSecIndex] = useState(0);
  const [sectionsData, setSectionsData] = useState<SectionData[]>(SECTIONS);
  const [searchFilter, setSearchFilter] = useState('');
  const [toastText, setToastText] = useState<string | null>(null);

  const currentSec = sectionsData[selectedSecIndex];

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3200);
  };

  const handleContentChange = (val: string) => {
    const updated = [...sectionsData];
    updated[selectedSecIndex].content = val;
    setSectionsData(updated);
  };

  const appendToDraft = (clause: string) => {
    const currentVal = currentSec.content.trim();
    const newVal = currentVal ? `${currentVal}\n\n${clause}` : clause;
    handleContentChange(newVal);
    showToast(`Inserted clause: ${clause.substring(0, 45)}...`);
  };

  const handleInsertRecommended = () => {
    appendToDraft(
      'Mandatory Compliance Clause: Equipment shall bear genuine BIS Standard Mark (ISI mark) under licence scheme as per Indian Standard IS 1180 (Part 1).'
    );
  };

  const handleQuickAppend = () => {
    if (currentSec.suggestedAppend) {
      appendToDraft(currentSec.suggestedAppend);
    } else {
      appendToDraft(
        'Operating Parameters: Designed to operate continuously under maximum ambient temperature of 50°C and 100% relative humidity in dusty tropical conditions.'
      );
    }
  };

  const handleExportDocx = () => {
    showToast('Exporting tender specification document (DOCX format)...');
  };

  const handleGenerateSpec = () => {
    showToast('Compiling all 9 statutory clauses into comprehensive draft tender...');
  };

  // Word & character counter
  const wordCount = currentSec.content.trim() ? currentSec.content.trim().split(/\s+/).length : 0;
  const charCount = currentSec.content.length;

  const filteredStandards = RELEVANT_STANDARDS.filter(
    (s) =>
      !searchFilter ||
      s.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification */}
      {toastText && (
        <div className="fixed bottom-6 right-6 bg-primary-container text-on-primary px-4 py-3 rounded shadow-lg flex items-center gap-3 border border-primary z-50 animate-fade-in-up">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">task_alt</span>
          <span className="font-body-sm text-body-sm font-medium">{toastText}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-outline-variant/60 gap-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-[0.15em] text-secondary font-bold">
              Workspace / Tender Drafting
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container font-code-sm text-code-sm text-on-surface-variant font-medium">
              TR-2024-88A
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
            Specification builder
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1 max-w-3xl">
            Construct a standards-compliant tender specification with traceable recommendations inserted beside each section.
          </p>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportDocx}
            className="h-9 px-4 rounded bg-surface-container-lowest border border-outline-variant text-primary font-headline-md text-body-sm font-semibold hover:bg-surface-container-low transition-all flex items-center gap-2 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary-container">
              file_download
            </span>
            <span>Export DOCX</span>
          </button>
          <button
            onClick={handleGenerateSpec}
            className="h-9 px-4 rounded bg-secondary-container hover:bg-secondary-fixed-dim text-on-secondary-container font-headline-md text-body-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Generate specification</span>
          </button>
        </div>
      </div>

      {/* Workspace Context & Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary-container shrink-0">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <div className="min-w-0">
            <span className="font-label-eyebrow text-[10px] uppercase text-outline block font-semibold">
              Procurement Category
            </span>
            <span className="font-headline-md text-body-sm text-primary font-bold truncate block">
              Medium Power Transformers
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary-container shrink-0">
            <span className="material-symbols-outlined text-[20px]">policy</span>
          </div>
          <div className="min-w-0">
            <span className="font-label-eyebrow text-[10px] uppercase text-outline block font-semibold">
              Tender Guideline
            </span>
            <span className="font-headline-md text-body-sm text-primary font-bold truncate block">
              GFR 2017 / Rule 144(xi)
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary-container shrink-0">
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
          </div>
          <div className="min-w-0">
            <span className="font-label-eyebrow text-[10px] uppercase text-outline block font-semibold">
              Compliance Target
            </span>
            <span className="font-headline-md text-body-sm text-primary font-bold truncate block">
              BEE 4-Star / BIS Mandatory
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded bg-tertiary-fixed/40 flex items-center justify-center text-tertiary font-bold shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
          <div className="min-w-0">
            <span className="font-label-eyebrow text-[10px] uppercase text-outline block font-semibold">
              Readiness Audit
            </span>
            <span className="font-headline-md text-body-sm text-tertiary-container font-bold truncate block">
              3 of 9 Sections Verified
            </span>
          </div>
        </div>
      </div>

      {/* THREE-COLUMN DRAFTING WORKSPACE */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* COLUMN 1: Left Navigation Card (3 cols wide) */}
        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest border border-outline-variant/60 rounded p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-3">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-on-surface-variant font-bold tracking-wider">
              Specification sections
            </span>
            <span className="font-code-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-primary font-medium">
              9 parts
            </span>
          </div>

          <nav className="flex flex-col space-y-1">
            {sectionsData.map((sec, idx) => {
              const active = idx === selectedSecIndex;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSecIndex(idx)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded transition-colors ${
                    active
                      ? 'bg-surface-container-low border-l-4 border-primary-container text-primary-container font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container/50'
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {sec.status === 'verified' ? (
                      <span
                        className="material-symbols-outlined text-[18px] text-tertiary-container"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    ) : (
                      <span className="w-[18px] h-[18px] rounded-full border border-outline-variant flex items-center justify-center font-code-sm text-[10px] text-outline font-bold shrink-0">
                        {sec.num.replace('.0', '')}
                      </span>
                    )}
                    <span className="truncate font-headline-md text-body-sm">{sec.title}</span>
                  </div>
                  <span className={`font-code-sm text-[10px] ${active ? 'text-primary/70' : 'text-outline'}`}>
                    {sec.num}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Authority Reference Metadata Mini-Card */}
          <div className="mt-6 pt-4 border-t border-outline-variant/40 bg-surface rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
              <span className="font-label-eyebrow text-[10px] uppercase text-primary font-bold">
                Standard Regulatory Body
              </span>
            </div>
            <p className="font-body-sm text-label-sm text-on-surface-variant leading-tight">
              Bureau of Indian Standards (BIS) Manak Bhavan, New Delhi. Model Tender Standard Ref:{' '}
              <span className="font-code-sm text-on-surface font-semibold">ETD-16:2023</span>
            </p>
          </div>
        </div>

        {/* COLUMN 2: Center Editor Card (6 cols wide) */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant/60 rounded p-6 shadow-sm flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Editor Header Row */}
            <div className="flex items-start justify-between pb-4 border-b border-outline-variant/50">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {currentSec.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-label-sm text-label-sm text-outline">
                    Section {selectedSecIndex + 1} of 9
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant" />
                  <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
                    Autosaved just now
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => showToast('Displaying statutory clause template snippets...')}
                  className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="Clause templates"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">library_books</span>
                </button>
                <button
                  onClick={() => showToast('Draft revisions: 3 revisions recorded today.')}
                  className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="History & diffs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </button>
                <button
                  onClick={() => showToast('Section options: Reset, copy, export section.')}
                  className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="More options"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>
            </div>

            {/* Toolbar Snippets */}
            <div className="flex items-center justify-between py-2 border-b border-outline-variant/40 text-on-surface-variant font-label-md text-label-sm">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => appendToDraft('**[STATUTORY STIPULATION]**')}
                  className="px-2 py-1 rounded hover:bg-surface-container font-code-sm font-semibold text-primary"
                  type="button"
                >
                  B
                </button>
                <button
                  onClick={() => appendToDraft('*[normative clause]*')}
                  className="px-2 py-1 rounded hover:bg-surface-container font-code-sm italic text-primary"
                  type="button"
                >
                  I
                </button>
                <button
                  onClick={() => appendToDraft('<u>[mandatory parameter]</u>')}
                  className="px-2 py-1 rounded hover:bg-surface-container font-code-sm underline text-primary"
                  type="button"
                >
                  U
                </button>
                <div className="h-3 w-[1px] bg-outline-variant mx-1" />
                <button
                  onClick={() => appendToDraft('• Parameter requirement: ')}
                  className="px-2 py-1 rounded hover:bg-surface-container flex items-center gap-1 text-on-surface-variant"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">format_list_bulleted</span>
                </button>
                <button
                  onClick={() => appendToDraft('| Parameter | Test Standard | Mandated Value |\n|---|---|---|')}
                  className="px-2 py-1 rounded hover:bg-surface-container flex items-center gap-1 text-on-surface-variant"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">table_rows</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-outline">
                <span className="font-code-sm text-[11px]">{wordCount} words · {charCount} chars</span>
              </div>
            </div>

            {/* Drafting Field Label */}
            <div className="flex items-center justify-between mt-4 mb-2">
              <label
                className="font-label-eyebrow text-label-eyebrow uppercase font-bold text-outline tracking-wider"
                htmlFor="draft-textarea"
              >
                Draft content
              </label>
              <span className="font-label-sm text-[11px] text-primary-container font-medium">
                Statutory Markdown Enabled
              </span>
            </div>

            {/* Main Drafting Textarea */}
            <div className="relative">
              <textarea
                id="draft-textarea"
                rows={10}
                value={currentSec.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter full technical specification narrative here..."
                className="w-full h-72 p-4 border border-outline-variant rounded font-code-sm text-code-sm leading-relaxed text-on-surface bg-surface-container-low/30 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all resize-none selection:bg-surface-variant selection:text-primary"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/60 font-code-sm text-[10px] text-outline shadow-sm">
                  UTF-8 / ISO-Compliant
                </span>
              </div>
            </div>

            {/* Contextual Clause Assistant Box */}
            {currentSec.recommendation && (
              <div className="mt-4 p-3 rounded bg-surface-container border border-outline-variant/50 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">
                  tips_and_updates
                </span>
                <div className="flex-1">
                  <span className="font-headline-md text-label-md text-primary font-semibold block leading-snug">
                    Automated Clause Recommendation:
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {currentSec.recommendation}
                  </p>
                  <button
                    onClick={handleQuickAppend}
                    className="mt-2 text-primary hover:text-primary-container font-headline-md text-label-sm font-semibold underline inline-flex items-center gap-1"
                    type="button"
                  >
                    <span>Append ambient range clause (+50°C max)</span>
                    <span className="material-symbols-outlined text-[14px]">add</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Editor Bottom Bar */}
          <div className="pt-4 mt-6 border-t border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 font-label-md text-body-sm text-tertiary-container font-semibold">
              <span className="material-symbols-outlined text-[18px]">cloud_done</span>
              <span>Saved to your private workspace</span>
            </div>
            <button
              onClick={handleInsertRecommended}
              className="w-full sm:w-auto h-8 px-3 rounded bg-surface-container-lowest border border-primary-container text-primary-container hover:bg-surface-container-low font-headline-md text-label-md font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Insert recommended standard</span>
            </button>
          </div>
        </div>

        {/* COLUMN 3: Right Relevant Standards Card (3 cols wide) */}
        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest border border-outline-variant/60 rounded p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-3">
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
              Relevant standards
            </h3>
            <span className="font-code-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-outline font-semibold">
              Live AI Match
            </span>
          </div>

          {/* Recommendation Cards List */}
          <div className="space-y-3">
            {filteredStandards.map((std) => (
              <div
                key={std.code}
                className="p-3 bg-surface-container-low/60 border border-outline-variant/70 rounded hover:border-primary-container transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-code-sm font-bold text-body-sm text-primary group-hover:text-primary-container">
                    {std.code}
                  </span>
                  <span className={`font-label-eyebrow text-[10px] px-1.5 py-0.5 rounded font-bold tracking-tight ${std.badgeColor}`}>
                    {std.badge}
                  </span>
                </div>
                <p className="font-body-sm text-label-md text-on-surface-variant mt-1 leading-snug">
                  {std.title}
                </p>
                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-outline-variant/30">
                  <span className="font-label-md text-label-sm text-tertiary-container font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                    {std.match}
                  </span>
                  <button
                    onClick={() => appendToDraft(std.clause)}
                    className="font-headline-md text-label-sm font-semibold text-primary-container hover:underline cursor-pointer flex items-center gap-0.5"
                    type="button"
                  >
                    <span>· Insert</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Search Bar inside Standards */}
          <div className="relative mt-4">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[16px] text-outline pointer-events-none">
              filter_list
            </span>
            <input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-body-sm bg-surface border border-outline-variant rounded font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
              placeholder="Filter library standards..."
              type="text"
            />
          </div>

          {/* Bottom Draft Checklist */}
          <div className="mt-6 pt-4 border-t border-outline-variant/50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-eyebrow text-label-eyebrow uppercase font-bold text-outline tracking-wider">
                Draft checklist
              </span>
              <span className="font-code-sm text-[11px] text-tertiary-container font-semibold">
                66% complete
              </span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden mb-3">
              <div className="bg-tertiary-container h-full w-2/3 transition-all" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between font-label-md text-body-sm text-tertiary-container">
                <span className="flex items-center gap-1.5">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_box
                  </span>
                  <span>Product description</span>
                </span>
                <span className="font-code-sm text-[10px] text-outline">Verified</span>
              </div>
              <div className="flex items-center justify-between font-label-md text-body-sm text-tertiary-container">
                <span className="flex items-center gap-1.5">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_box
                  </span>
                  <span>Applicable standards</span>
                </span>
                <span className="font-code-sm text-[10px] text-outline">Linked</span>
              </div>
              <div className="flex items-center justify-between font-label-md text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-outline">
                    check_box_outline_blank
                  </span>
                  <span>Testing requirements</span>
                </span>
                <span className="font-code-sm text-[10px] text-secondary font-medium">Pending</span>
              </div>
              <div className="flex items-center justify-between font-label-md text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-outline">
                    check_box_outline_blank
                  </span>
                  <span>Safety &amp; Environmental</span>
                </span>
                <span className="font-code-sm text-[10px] text-outline">Optional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
