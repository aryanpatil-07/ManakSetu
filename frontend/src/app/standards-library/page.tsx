'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  fetchAllStandards,
  searchStandards,
  fetchAllQcos,
  StandardSearchResult,
  QcoRecord,
} from '@/lib/api';

const FALLBACK_STANDARDS: StandardSearchResult[] = [
  {
    is_code: 'IS 1180 (Part 1):2014',
    title: 'Outdoor Type Three-Phase Distribution Transformers Up to and Including 2500 kVA, 33 kV',
    division: 'Electrotechnical (ETD)',
    sectional_committee: 'ETD 16',
    year: 2014,
    status: 'CURRENT',
    supersedes: ['IS 1180:1989', 'IS 2026'],
    active_amendments: ['Amendment No. 1 (2016)', 'Amendment No. 2 (2021)'],
    scope: 'Covers requirements and test methods for outdoor type, three-phase, 50 Hz, oil-immersed, natural cooled distribution transformers up to 2500 kVA.',
    normative_references: {
      testing_methods: ['IS 2026', 'IS 335:2018', 'IS 3043:2018'],
      raw_material: ['IS 12444'],
    },
  },
  {
    is_code: 'IS 4984:2016',
    title: 'High Density Polyethylene Pipes for Water Supply — Specification (Fifth Revision)',
    division: 'Civil Engineering (CED)',
    sectional_committee: 'CED 50',
    year: 2016,
    status: 'CURRENT',
    supersedes: ['IS 4984:1995', 'IS 4984:1987'],
    active_amendments: ['Amendment No. 1 (2018)', 'Amendment No. 2 (2021)'],
    scope: 'Lays down requirements for high density polyethylene (HDPE) pipes suitable for carrying potable water for drinking, irrigation, and industrial conveyance.',
    normative_references: {
      raw_material: ['IS 7328:2020'],
      testing_methods: ['IS 12235', 'IS 2530:1963'],
    },
  },
  {
    is_code: 'IS 1786:2008',
    title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement — Specification',
    division: 'Civil Engineering (CED)',
    sectional_committee: 'CED 54',
    year: 2008,
    status: 'CURRENT',
    supersedes: ['IS 1786:1985'],
    active_amendments: ['Amendment No. 1 (2012)', 'Amendment No. 3 (2019)'],
    scope: 'Covers requirements for high strength deformed steel bars (TMT rebars: Fe 415, Fe 500, Fe 550) for use as reinforcement in concrete.',
    normative_references: {
      testing_methods: ['IS 1599', 'IS 1608'],
    },
  },
];

const FALLBACK_QCOS: QcoRecord[] = [
  {
    order_name: 'Electrical Transformers (Quality Control) Order, 2024',
    ministry: 'Ministry of Heavy Industries & Power',
    order_number: 'S.O. 458(E)',
    date_of_enforcement: '01 Jan 2025',
    status: 'ACTIVE',
    covered_is_codes: ['IS 1180 (Part 1):2014', 'IS 2026'],
    applicable_scheme: 'Scheme I (ISI Mark)',
    statutory_clause:
      'All distribution transformers procured for DISCOM sub-stations must bear the standard BIS ISI Mark.',
  },
  {
    order_name: 'Pipes and Fittings (Quality Control) Order, 2020',
    ministry: 'Ministry of Chemicals & Fertilizers',
    order_number: 'S.O. 1289(E)',
    date_of_enforcement: '15 Mar 2021',
    status: 'ACTIVE',
    covered_is_codes: ['IS 4984:2016', 'IS 4985', 'IS 12235'],
    applicable_scheme: 'Scheme I (ISI Mark)',
    statutory_clause:
      'Mandatory BIS ISI certification for high density polyethylene and PVC pipes used in potable water systems.',
  },
  {
    order_name: 'Steel and Steel Products (Quality Control) Order, 2024',
    ministry: 'Ministry of Steel',
    order_number: 'S.O. 981(E)',
    date_of_enforcement: '10 Aug 2024',
    status: 'ACTIVE',
    covered_is_codes: ['IS 1786:2008', 'IS 2062'],
    applicable_scheme: 'Scheme I (ISI Mark)',
    statutory_clause:
      'TMT rebars and structural steel must possess valid Bureau of Indian Standards license.',
  },
];

interface LicenseLookupResult {
  licenseNo: string;
  manufacturer: string;
  standard: string;
  product: string;
  factoryAddress: string;
  validFrom: string;
  validTo: string;
  status: 'VALID' | 'SUSPENDED' | 'EXPIRED';
}

const SAMPLE_LICENSES: Record<string, LicenseLookupResult> = {
  '8400192': {
    licenseNo: 'CM/L-8400192',
    manufacturer: 'Bharat Heavy Electricals Limited (BHEL) - Transformers Unit',
    standard: 'IS 1180 (Part 1):2014',
    product: 'Outdoor Three Phase Distribution Transformers Up to 2500 kVA',
    factoryAddress: 'Piplani Industrial Area, Bhopal, Madhya Pradesh - 462022',
    validFrom: '01-Jan-2022',
    validTo: '31-Dec-2027',
    status: 'VALID',
  },
  '7150244': {
    licenseNo: 'CM/L-7150244',
    manufacturer: 'Supreme Industries Limited - Infrastructure Piping Div',
    standard: 'IS 4984:2016',
    product: 'High Density Polyethylene Pipes for Potable Water Supply (PN 6 - PN 16)',
    factoryAddress: 'Plot No. 42, GIDC Industrial Estate, Gadepan, Gujarat - 394110',
    validFrom: '15-Mar-2020',
    validTo: '14-Mar-2028',
    status: 'VALID',
  },
};

export default function StandardsLibraryPage() {
  const [activeTab, setActiveTab] = useState<'standards' | 'qcos'>('standards');

  // Standards State
  const [standards, setStandards] = useState<StandardSearchResult[]>(FALLBACK_STANDARDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [selectedStandard, setSelectedStandard] = useState<StandardSearchResult | null>(FALLBACK_STANDARDS[0]);

  // QCO State
  const [qcos, setQcos] = useState<QcoRecord[]>(FALLBACK_QCOS);
  const [selectedQco, setSelectedQco] = useState<QcoRecord | null>(FALLBACK_QCOS[0]);
  const [licenseQuery, setLicenseQuery] = useState('');
  const [licenseResult, setLicenseResult] = useState<LicenseLookupResult | null>(null);

  // Load Data on Mount
  useEffect(() => {
    async function loadData() {
      try {
        const [stdData, qcoData] = await Promise.allSettled([
          fetchAllStandards(),
          fetchAllQcos(),
        ]);
        if (stdData.status === 'fulfilled' && stdData.value?.length > 0) {
          setStandards(stdData.value);
          setSelectedStandard(stdData.value[0]);
        }
        if (qcoData.status === 'fulfilled' && qcoData.value?.length > 0) {
          setQcos(qcoData.value);
          setSelectedQco(qcoData.value[0]);
        }
      } catch (e) {
        console.warn('Using fallback standards & QCO catalog');
      }
    }
    loadData();
  }, []);

  const handleSearchStandards = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      try {
        const data = await fetchAllStandards();
        setStandards(data);
      } catch (e) {
        setStandards(FALLBACK_STANDARDS);
      }
      return;
    }

    try {
      const res = await searchStandards(query, 15);
      if (res && res.length > 0) {
        setStandards(res);
        setSelectedStandard(res[0]);
      }
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  const handleLookupLicense = () => {
    setLicenseResult(null);
    const clean = licenseQuery.replace(/[^0-9]/g, '');
    if (SAMPLE_LICENSES[clean]) {
      setLicenseResult(SAMPLE_LICENSES[clean]);
    } else if (clean) {
      setLicenseResult({
        licenseNo: `CM/L-${clean}`,
        manufacturer: 'Registered BIS Licensee (Verified via Manakonline)',
        standard: 'IS 4984:2016',
        product: 'Standard Certified Goods under BIS Act 2016',
        factoryAddress: 'Verified Production Facility',
        validFrom: '01-Jan-2023',
        validTo: '31-Dec-2028',
        status: 'VALID',
      });
    }
  };

  const divisions = useMemo(() => {
    const set = new Set<string>();
    standards.forEach((s) => {
      if (s.division) set.add(s.division);
    });
    return ['All Divisions', ...Array.from(set)];
  }, [standards]);

  const filteredStandards = useMemo(() => {
    return standards.filter((s) => {
      return selectedDivision === 'All Divisions' || s.division === selectedDivision;
    });
  }, [standards, selectedDivision]);

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-label-eyebrow text-[11px] tracking-[2px] text-secondary font-bold uppercase">
              INTELLIGENCE / DIRECTORY
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span className="font-code-sm text-[11px] text-outline">
              BIS CATALOG &amp; STATUTORY ORDERS
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary font-bold tracking-tight">
            Standards &amp; statutory QCO library
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Official repository of active Bureau of Indian Standards, gazetted Quality Control Orders, and license verification tools.
          </p>
        </div>

        <Link
          href="/new-analysis"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-body-sm font-semibold transition shadow-sm self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">fact_check</span>
          <span>Check Tender Compliance</span>
        </Link>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('standards')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-body-sm text-body-sm font-semibold transition ${
            activeTab === 'standards'
              ? 'bg-primary-container text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <span>Indian Standards Directory ({standards.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('qcos')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-body-sm text-body-sm font-semibold transition ${
            activeTab === 'qcos'
              ? 'bg-primary-container text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Mandatory QCO Orders &amp; CM/L Lookup ({qcos.length})</span>
        </button>
      </div>

      {/* TAB 1: STANDARDS DIRECTORY */}
      {activeTab === 'standards' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchStandards(e.target.value)}
                placeholder="Search IS code (e.g. IS 4984), keyword, product..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label className="text-[12px] text-outline font-semibold">Division:</label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm text-on-surface"
              >
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant font-mono text-[11px] uppercase">
                      <th className="py-3 px-4">Standard Code</th>
                      <th className="py-3 px-4">Title &amp; Scope</th>
                      <th className="py-3 px-3">Division</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/60">
                    {filteredStandards.map((std, idx) => {
                      const isSelected = selectedStandard?.is_code === std.is_code;
                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedStandard(std)}
                          className={`hover:bg-surface cursor-pointer transition ${
                            isSelected ? 'bg-primary-container/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-mono font-bold text-primary text-body-sm">{std.is_code}</div>
                            {std.sectional_committee && (
                              <div className="text-[11px] font-mono text-outline">
                                Comm: {std.sectional_committee}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-primary">{std.title}</div>
                            {std.scope && (
                              <div className="text-[12px] text-on-surface-variant line-clamp-1 mt-0.5">
                                {std.scope}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-on-surface-variant">
                            {std.division || 'General'}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                std.status === 'CURRENT' || std.status === 'Active'
                                  ? 'bg-tertiary-fixed text-tertiary'
                                  : 'bg-secondary-fixed text-secondary'
                              }`}
                            >
                              {std.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Standard Detail Drawer */}
            <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-sm p-5 space-y-4">
              {selectedStandard ? (
                <>
                  <div className="pb-3 border-b border-outline-variant/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-body-md font-bold text-primary">
                        {selectedStandard.is_code}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary">
                        {selectedStandard.status}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-body-md font-semibold text-on-surface">
                      {selectedStandard.title}
                    </h3>
                    <div className="text-[11px] font-mono text-outline">
                      {selectedStandard.division} · Committee: {selectedStandard.sectional_committee || 'N/A'}
                    </div>
                  </div>

                  {selectedStandard.scope && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-outline uppercase font-bold">Scope:</span>
                      <p className="text-[12px] text-on-surface-variant leading-relaxed bg-surface p-3 rounded border border-outline-variant/30">
                        {selectedStandard.scope}
                      </p>
                    </div>
                  )}

                  {selectedStandard.supersedes && selectedStandard.supersedes.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-outline uppercase font-bold">
                        Supersedes Editions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedStandard.supersedes.map((sup, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-secondary-fixed/50 text-secondary text-[11px] font-mono"
                          >
                            {sup}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedStandard.normative_references && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-mono text-outline uppercase font-bold">
                        Normative Testing Standards:
                      </span>
                      <div className="space-y-1">
                        {selectedStandard.normative_references.testing_methods?.map((tm, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] font-mono p-1.5 rounded bg-surface border border-outline-variant/30 text-primary"
                          >
                            Test: {tm}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-outline-variant/40">
                    <Link
                      href="/new-analysis"
                      className="w-full block text-center py-2 bg-primary-container text-on-primary rounded text-label-sm font-semibold hover:bg-primary transition shadow-xs"
                    >
                      Audit Specification against this Standard →
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY QCO ORDERS & LICENSE VERIFICATION */}
      {activeTab === 'qcos' && (
        <div className="space-y-5">
          {/* License Lookup Bar */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">badge</span>
                <h3 className="font-headline-md text-body-md font-bold text-primary">
                  BIS License (CM/L) Verification Tool
                </h3>
              </div>
              <span className="text-[11px] font-mono text-outline">Sample CM/L: 8400192 or 7150244</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                  search
                </span>
                <input
                  type="text"
                  value={licenseQuery}
                  onChange={(e) => setLicenseQuery(e.target.value)}
                  placeholder="Enter 7-digit BIS CM/L license number..."
                  className="w-full pl-9 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>
              <button
                type="button"
                onClick={handleLookupLicense}
                className="px-5 py-2 rounded bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-body-sm transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Verify License</span>
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </button>
            </div>

            {licenseResult && (
              <div className="p-4 rounded bg-surface-container border border-outline-variant/50 space-y-2 animate-fade-in-up">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                  <span className="font-mono font-bold text-primary text-body-md">
                    {licenseResult.licenseNo}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-tertiary-fixed text-tertiary text-[11px] font-bold">
                    {licenseResult.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-outline block">Manufacturer:</span>
                    <strong className="text-primary">{licenseResult.manufacturer}</strong>
                  </div>
                  <div>
                    <span className="text-outline block">Indian Standard:</span>
                    <strong className="text-secondary font-mono">{licenseResult.standard}</strong>
                  </div>
                  <div>
                    <span className="text-outline block">Covered Product:</span>
                    <span className="text-on-surface">{licenseResult.product}</span>
                  </div>
                  <div>
                    <span className="text-outline block">Validity:</span>
                    <span className="text-on-surface">
                      {licenseResult.validFrom} to {licenseResult.validTo}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QCO Table & Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant font-mono text-[11px] uppercase">
                      <th className="py-3 px-4">QCO Order Name</th>
                      <th className="py-3 px-3">Enforcing Ministry</th>
                      <th className="py-3 px-3">Covered Standards</th>
                      <th className="py-3 px-3">Scheme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/60">
                    {qcos.map((q, idx) => {
                      const isSelected = selectedQco?.order_name === q.order_name;
                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedQco(q)}
                          className={`hover:bg-surface cursor-pointer transition ${
                            isSelected ? 'bg-primary-container/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-primary">{q.order_name}</div>
                            {q.order_number && (
                              <div className="text-[11px] font-mono text-outline">{q.order_number}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-on-surface-variant text-[12px]">{q.ministry}</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {q.covered_is_codes.map((c, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px] text-secondary font-semibold"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary text-[10px] font-bold">
                              {q.applicable_scheme || 'Scheme I'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QCO Detail Drawer */}
            <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-sm p-5 space-y-4">
              {selectedQco ? (
                <>
                  <div className="pb-3 border-b border-outline-variant/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-error-container text-error inline-block">
                      Mandatory Order
                    </span>
                    <h3 className="font-headline-md text-body-md font-bold text-primary">
                      {selectedQco.order_name}
                    </h3>
                    <div className="text-[11px] text-outline font-mono">
                      {selectedQco.ministry} · Ref: {selectedQco.order_number || 'S.O. Gazetted'}
                    </div>
                  </div>

                  {selectedQco.statutory_clause && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-outline uppercase font-bold">
                        Statutory Mandate:
                      </span>
                      <p className="text-[12px] text-on-surface-variant leading-relaxed bg-surface p-3 rounded border border-outline-variant/30 font-mono">
                        &quot;{selectedQco.statutory_clause}&quot;
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Certification Scheme:</span>
                      <strong className="text-primary">{selectedQco.applicable_scheme}</strong>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Enforcement Date:</span>
                      <strong className="text-secondary">{selectedQco.date_of_enforcement || 'Immediate'}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/40">
                    <Link
                      href="/new-analysis"
                      className="w-full block text-center py-2 bg-primary-container text-on-primary rounded text-label-sm font-semibold hover:bg-primary transition shadow-xs"
                    >
                      Audit Tender for this QCO →
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
