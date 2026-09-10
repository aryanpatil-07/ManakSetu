'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface StandardItem {
  code: string;
  title: string;
  division: string;
  committee: string;
  year: number;
  status: 'Active' | 'Under Revision' | 'Superseded';
  qcoMandatory: boolean;
  qcoOrder?: string;
  harmonized?: string;
  amendmentsCount: number;
  scope: string;
  normativeReferences: string[];
}

const STANDARDS_DATA: StandardItem[] = [
  {
    code: 'IS 1180 (Part 1):2014',
    title: 'Outdoor Type Three-Phase Distribution Transformers Up to and Including 2500 kVA, 33 kV',
    division: 'Electrotechnical (ETD)',
    committee: 'ETD 16',
    year: 2014,
    status: 'Active',
    qcoMandatory: true,
    qcoOrder: 'Electrical Transformers (Quality Control) Order, 2024',
    harmonized: 'IEC 60076-1 (Modified)',
    amendmentsCount: 4,
    scope: 'Covers requirements and test methods for outdoor type, three-phase, 50 Hz, oil-immersed, natural cooled distribution transformers up to 2500 kVA.',
    normativeReferences: ['IS 2026', 'IS 335:2018', 'IS 3043:2018', 'IS 12444'],
  },
  {
    code: 'IS 4984:2016',
    title: 'High Density Polyethylene Pipes for Water Supply — Specification (Fifth Revision)',
    division: 'Civil Engineering (CED)',
    committee: 'CED 50',
    year: 2016,
    status: 'Active',
    qcoMandatory: true,
    qcoOrder: 'Pipes and Fittings (Quality Control) Order, 2020',
    harmonized: 'ISO 4427-2',
    amendmentsCount: 2,
    scope: 'Lays down requirements for high density polyethylene (HDPE) pipes suitable for carrying potable water for drinking, irrigation, and industrial conveyance.',
    normativeReferences: ['IS 2530', 'IS 7328', 'IS 12235'],
  },
  {
    code: 'IS 2026 (Part 1):2011',
    title: 'Power Transformers — Part 1: General (Second Revision)',
    division: 'Electrotechnical (ETD)',
    committee: 'ETD 16',
    year: 2011,
    status: 'Active',
    qcoMandatory: false,
    harmonized: 'IEC 60076-1:2000',
    amendmentsCount: 1,
    scope: 'Applies to three-phase and single-phase power transformers (including auto-transformers) with the exception of small single-phase units.',
    normativeReferences: ['IS 335', 'IS 2099', 'IS 3639'],
  },
  {
    code: 'IS 10500:2012',
    title: 'Drinking Water — Specification (Second Revision)',
    division: 'Food & Agriculture / Chemical',
    committee: 'FAD 25',
    year: 2012,
    status: 'Active',
    qcoMandatory: true,
    qcoOrder: 'Drinking Water (Quality Control) Order, 2021',
    harmonized: 'WHO Guidelines for Drinking Water Quality',
    amendmentsCount: 3,
    scope: 'Prescribes the requirements and the methods of sampling and test for drinking water meant for human consumption.',
    normativeReferences: ['IS 3025 (Parts 1 to 50)', 'IS 1622'],
  },
  {
    code: 'IS 694:2010',
    title: 'Polyvinyl Chloride Insulated Cables of Rated Voltages Up to and Including 450/750 V',
    division: 'Electrotechnical (ETD)',
    committee: 'ETD 30',
    year: 2010,
    status: 'Active',
    qcoMandatory: true,
    qcoOrder: 'Electrical Wires and Cables (Quality Control) Order, 2023',
    amendmentsCount: 5,
    scope: 'Specifies construction and electrical test requirements for PVC insulated single-core and multi-core cables for electric power and lighting.',
    normativeReferences: ['IS 8130', 'IS 5831', 'IS 10810'],
  },
  {
    code: 'IS 2925:1984',
    title: 'Specification for Industrial Safety Helmets (Second Revision)',
    division: 'Mechanical Engineering (MED)',
    committee: 'MED 32',
    year: 1984,
    status: 'Under Revision',
    qcoMandatory: true,
    qcoOrder: 'Personal Protective Equipment (Quality Control) Order, 2021',
    amendmentsCount: 3,
    scope: 'Specifies physical requirements, performance criteria, and shock absorption test methods for industrial safety helmets.',
    normativeReferences: ['IS 7016', 'IS 9944'],
  },
  {
    code: 'IS 10322 (Part 5/Sec 3):2012',
    title: 'Luminaires — Particular Requirements: Luminaires for Road and Street Lighting',
    division: 'Electrotechnical (ETD)',
    committee: 'ETD 24',
    year: 2012,
    status: 'Active',
    qcoMandatory: true,
    qcoOrder: 'Solar DC & LED Luminaires (Quality Control) Order, 2020',
    harmonized: 'IEC 60598-2-3',
    amendmentsCount: 2,
    scope: 'Specifies requirements for road, street, and outdoor public lighting luminaires with electrical light sources.',
    normativeReferences: ['IS 15885', 'IS 16102', 'IS 16103'],
  },
  {
    code: 'IS 269:2015',
    title: 'Ordinary Portland Cement — Specification (Sixth Revision)',
    division: 'Civil Engineering (CED)',
    committee: 'CED 2',
    year: 2015,
    status: 'Active',
    qcoMandatory: true,
    qcoOrder: 'Cement (Quality Control) Order, 2003',
    amendmentsCount: 2,
    scope: 'Covers manufacture, chemical and physical requirements for 33, 43, and 53 grade ordinary Portland cement.',
    normativeReferences: ['IS 4031 (Parts 1 to 15)', 'IS 4032'],
  },
];

export default function StandardsLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('All Divisions');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [qcoOnly, setQcoOnly] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<StandardItem | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const filteredStandards = useMemo(() => {
    return STANDARDS_DATA.filter((std) => {
      const matchSearch =
        !searchQuery ||
        std.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.committee.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDivision =
        divisionFilter === 'All Divisions' || std.division.includes(divisionFilter.split(' ')[0]);

      const matchStatus =
        statusFilter === 'All Statuses' || std.status === statusFilter;

      const matchQco = !qcoOnly || std.qcoMandatory;

      return matchSearch && matchDivision && matchStatus && matchQco;
    });
  }, [searchQuery, divisionFilter, statusFilter, qcoOnly]);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-unit-md pb-unit-xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-unit-xs mb-unit-xs">
            <span className="font-label-eyebrow text-label-eyebrow uppercase tracking-[0.15em] text-secondary font-bold">
              INTELLIGENCE / CATALOGUE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-code-sm text-code-sm text-outline">BIS NATIONAL REPOSITORY</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
            Indian Standards Library
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Authoritative repository of active Bureau of Indian Standards (BIS) specifications, Sectional Committees, and statutory revisions.
          </p>
        </div>

        <div className="flex items-center gap-unit-sm self-start md:self-auto">
          <button
            onClick={() => showToast('Downloading complete National Standards Index (BIS Catalog)...')}
            className="flex items-center gap-unit-xs bg-surface-container-lowest text-primary hover:bg-surface-container-high px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm border border-outline-variant/60"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Download Index</span>
          </button>
          <Link
            href="/specification-builder"
            className="flex items-center gap-unit-xs bg-primary-container text-on-primary hover:bg-primary px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Draft Specification</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-md mb-unit-xl">
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              National Standards
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">menu_book</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">1,520+</span>
            <span className="font-code-sm text-code-sm text-tertiary-container font-semibold">Indexed</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Across 14 Technical Divisions</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Sectional Committees
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">domain</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">48</span>
            <span className="font-code-sm text-code-sm text-outline font-medium">Active panels</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">ETD, CED, MED, FAD &amp; CHD</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              ISO/IEC Harmonized
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">handshake</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">842</span>
            <span className="font-code-sm text-code-sm text-tertiary-container font-semibold">55.4%</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Identical or modified dual-number</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Mandatory Under QCO
            </span>
            <span className="material-symbols-outlined text-[20px] text-secondary">verified_user</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-secondary">318</span>
            <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-semibold">
              Statutory
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Scheme I (ISI Mark) Compulsory</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-unit-md mb-unit-md">
        <div className="relative flex-1 max-w-lg">
          <span className="material-symbols-outlined absolute left-unit-md top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-unit-md bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/60 shadow-sm transition-all"
            placeholder="Search by IS code (e.g. IS 1180, IS 4984), title, or keywords..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-unit-sm flex-wrap">
          <div className="relative">
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="appearance-none h-10 pl-unit-md pr-9 bg-surface-container-lowest border border-outline-variant/60 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
            >
              <option>All Divisions</option>
              <option>Electrotechnical (ETD)</option>
              <option>Civil Engineering (CED)</option>
              <option>Mechanical Engineering (MED)</option>
              <option>Food &amp; Agriculture / Chemical</option>
            </select>
            <span className="material-symbols-outlined absolute right-unit-xs top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none h-10 pl-unit-md pr-9 bg-surface-container-lowest border border-outline-variant/60 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>Under Revision</option>
              <option>Superseded</option>
            </select>
            <span className="material-symbols-outlined absolute right-unit-xs top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          <button
            onClick={() => setQcoOnly(!qcoOnly)}
            className={`h-10 flex items-center gap-unit-xs px-unit-md rounded-lg font-label-md text-label-md transition-colors shadow-sm border ${
              qcoOnly
                ? 'bg-secondary-container text-on-secondary-container border-secondary'
                : 'bg-surface-container-lowest text-on-surface border-outline-variant/60 hover:bg-surface-container-high'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>QCO Mandatory Only</span>
          </button>
        </div>
      </div>

      {/* Main Standards Table */}
      <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/50 overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant">
                <th className="py-unit-md px-unit-lg font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  STANDARD CODE &amp; TITLE
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  COMMITTEE
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  HARMONIZATION
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  STATUTORY STATUS
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase text-center">
                  AMENDMENTS
                </th>
                <th className="py-unit-md px-unit-lg font-label-eyebrow text-label-eyebrow tracking-wider uppercase text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60">
              {filteredStandards.map((std) => (
                <tr key={std.code} className="hover:bg-surface transition-colors group">
                  <td className="py-unit-md px-unit-lg max-w-md">
                    <div className="flex flex-col">
                      <span
                        onClick={() => setSelectedStandard(std)}
                        className="font-code-sm text-body-md font-bold text-primary group-hover:text-primary-container cursor-pointer hover:underline"
                      >
                        {std.code}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">
                        {std.title}
                      </span>
                    </div>
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    <span className="font-code-sm text-[12px] font-bold text-primary">
                      {std.committee}
                    </span>
                    <span className="block font-body-sm text-[11px] text-outline">
                      {std.division}
                    </span>
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    <span className="font-body-sm text-body-sm text-on-surface">
                      {std.harmonized || 'Indigenous Standard'}
                    </span>
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    {std.qcoMandatory ? (
                      <span className="inline-flex items-center gap-1 bg-tertiary-fixed/60 text-tertiary font-label-sm text-label-sm px-2 py-0.5 rounded font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                        QCO Mandatory
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold">
                        Voluntary
                      </span>
                    )}
                  </td>

                  <td className="py-unit-md px-unit-md text-center whitespace-nowrap">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded font-code-sm text-[11px] font-bold text-primary bg-surface-container">
                      {std.amendmentsCount} Errata / Amd.
                    </span>
                  </td>

                  <td className="py-unit-md px-unit-lg text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedStandard(std)}
                      className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container font-semibold hover:text-primary hover:underline"
                      type="button"
                    >
                      <span>View clauses</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-unit-sm px-unit-lg bg-surface-container-low flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant/30">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Directly cross-referenced with BIS Manakonline Sectional Committee Gazette
          </span>
          <span className="font-code-sm">Showing {filteredStandards.length} of {STANDARDS_DATA.length} records</span>
        </div>
      </div>

      {/* Standards Clause Inspection Drawer / Modal */}
      {selectedStandard && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-lg shadow-2xl w-full max-w-2xl p-6 animate-fade-in-up">
            <div className="flex items-start justify-between pb-3 border-b border-outline-variant/40">
              <div>
                <div className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                  {selectedStandard.division} · Committee {selectedStandard.committee}
                </div>
                <h3 className="font-headline-lg text-primary font-bold mt-1">
                  {selectedStandard.code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStandard(null)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4 font-body-sm text-on-surface">
              <div>
                <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">
                  Standard Title &amp; Specification Scope
                </div>
                <p className="text-body-md font-semibold text-primary">{selectedStandard.title}</p>
                <p className="text-[13px] text-on-surface-variant mt-1.5 leading-relaxed bg-surface-container-low p-3 rounded border border-outline-variant/40">
                  {selectedStandard.scope}
                </p>
              </div>

              {selectedStandard.qcoMandatory && (
                <div className="p-3 rounded bg-tertiary-fixed/30 border border-tertiary/20">
                  <div className="flex items-center gap-1.5 text-tertiary font-bold text-[12px]">
                    <span className="material-symbols-outlined text-[16px]">policy</span>
                    <span>Statutory Quality Control Order Enforcement</span>
                  </div>
                  <div className="text-[12px] text-on-surface-variant mt-1">
                    Enforced under: <strong>{selectedStandard.qcoOrder}</strong>. Compulsory BIS ISI mark required for all public tenders under GFR 144(vii).
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">
                  Normative &amp; Allied References
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedStandard.normativeReferences.map((ref) => (
                    <span
                      key={ref}
                      className="px-2 py-1 rounded bg-surface-container border border-outline-variant/50 font-code-sm text-[12px] font-medium text-primary"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-outline-variant/40">
              <Link
                href="/specification-builder"
                className="text-primary-container hover:underline font-label-md text-body-sm font-semibold flex items-center gap-1"
              >
                <span>Add clause to Specification Builder</span>
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
              </Link>
              <button
                onClick={() => setSelectedStandard(null)}
                className="px-4 py-1.5 bg-primary-container text-on-primary rounded text-label-md font-semibold hover:bg-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
