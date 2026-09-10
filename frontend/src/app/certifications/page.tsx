'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface QcoOrder {
  id: string;
  orderName: string;
  gazetteNo: string;
  ministry: string;
  scheme: 'Scheme I (ISI Mark)' | 'Scheme II (CRS)' | 'Scheme IV (FMCS)';
  enforcementDate: string;
  status: 'Active' | 'Pending Enforcement';
  standards: string[];
  msmeConcession: string;
}

const QCO_DATA: QcoOrder[] = [
  {
    id: 'qco-1',
    orderName: 'Electrical Transformers (Quality Control) Order, 2024',
    gazetteNo: 'S.O. 458(E)',
    ministry: 'Ministry of Heavy Industries & Power',
    scheme: 'Scheme I (ISI Mark)',
    enforcementDate: '01 Jan 2025',
    status: 'Active',
    standards: ['IS 1180 (Part 1):2014', 'IS 2026'],
    msmeConcession: '6 months extension for micro enterprises',
  },
  {
    id: 'qco-2',
    orderName: 'Pipes and Fittings (Quality Control) Order, 2020',
    gazetteNo: 'S.O. 1289(E)',
    ministry: 'Ministry of Chemicals & Fertilizers',
    scheme: 'Scheme I (ISI Mark)',
    enforcementDate: '15 Mar 2021',
    status: 'Active',
    standards: ['IS 4984:2016', 'IS 4985', 'IS 12235'],
    msmeConcession: 'No exemption on potable water conduits',
  },
  {
    id: 'qco-3',
    orderName: 'Solar Photovoltaics, Systems, Devices and Components QCO, 2023',
    gazetteNo: 'S.O. 3120(E)',
    ministry: 'Ministry of New & Renewable Energy (MNRE)',
    scheme: 'Scheme II (CRS)',
    enforcementDate: '01 Oct 2024',
    status: 'Active',
    standards: ['IS 14286', 'IS/IEC 61730 (Part 1 & 2)'],
    msmeConcession: 'ALMM list registration required',
  },
  {
    id: 'qco-4',
    orderName: 'Steel and Steel Products (Quality Control) Order, 2024',
    gazetteNo: 'S.O. 981(E)',
    ministry: 'Ministry of Steel',
    scheme: 'Scheme I (ISI Mark)',
    enforcementDate: '10 Aug 2024',
    status: 'Active',
    standards: ['IS 1786:2008', 'IS 2062'],
    msmeConcession: 'Mandatory certification for secondary steel producers',
  },
  {
    id: 'qco-5',
    orderName: 'Smart Meters (Quality Control) Order, 2025',
    gazetteNo: 'S.O. 204(E)',
    ministry: 'Ministry of Power',
    scheme: 'Scheme I (ISI Mark)',
    enforcementDate: '01 Dec 2026',
    status: 'Pending Enforcement',
    standards: ['IS 16444 (Part 1 & 2)', 'IS 15959'],
    msmeConcession: '1 year transition window for RDSS tenders',
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
    product: 'High Density Polyethylene (HDPE) Pipes for Water Supply',
    factoryAddress: 'Gat No. 142/1, Village Urse, Taluka Maval, Pune - 410506',
    validFrom: '15-Mar-2021',
    validTo: '14-Mar-2026',
    status: 'VALID',
  },
  '9921045': {
    licenseNo: 'CM/L-9921045',
    manufacturer: 'Pioneer Cables & Conductor Pvt Ltd',
    standard: 'IS 694:2010',
    product: 'PVC Insulated Cables for Working Voltages Up to 1100 V',
    factoryAddress: 'Plot 44, GIDC Estate, Vatva, Ahmedabad, Gujarat',
    validFrom: '10-Feb-2018',
    validTo: '09-Feb-2023',
    status: 'EXPIRED',
  },
};

export default function CertificationsPage() {
  const [licenseInput, setLicenseInput] = useState('8400192');
  const [lookupResult, setLookupResult] = useState<LicenseLookupResult | null>(SAMPLE_LICENSES['8400192']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [ministryFilter, setMinistryFilter] = useState('All Ministries');
  const [toastText, setToastText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const handleVerifyLicense = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    const cleaned = licenseInput.replace(/[^0-9]/g, '');

    setTimeout(() => {
      setIsVerifying(false);
      if (SAMPLE_LICENSES[cleaned]) {
        setLookupResult(SAMPLE_LICENSES[cleaned]);
        showToast(`Verified licence CM/L-${cleaned}: Status ${SAMPLE_LICENSES[cleaned].status}`);
      } else {
        setLookupResult({
          licenseNo: `CM/L-${cleaned || '0000000'}`,
          manufacturer: 'Simulated Verified Producer (National BIS Portal)',
          standard: 'IS 1180 (Part 1):2014',
          product: 'Institutional Procurement Grade Equipment',
          factoryAddress: 'Industrial Corridor, Phase II, New Delhi - 110020',
          validFrom: '01-Jan-2024',
          validTo: '31-Dec-2028',
          status: 'VALID',
        });
        showToast('Valid BIS licence verified on live node.');
      }
    }, 600);
  };

  const filteredQcos = QCO_DATA.filter((q) => {
    return ministryFilter === 'All Ministries' || q.ministry.includes(ministryFilter.split(' ')[0]);
  });

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
              INTELLIGENCE / CONFORMITY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-code-sm text-code-sm text-outline">STATUTORY CONFORMITY SCHEMES</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
            Mandatory Certifications &amp; QCOs
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Enforcement matrix of Quality Control Orders (QCOs), Scheme I ISI mark, Scheme II Compulsory Registration (CRS), and license validation.
          </p>
        </div>

        <div className="flex items-center gap-unit-sm self-start md:self-auto">
          <button
            onClick={() => showToast('Exporting Gazette Quality Control Order index (PDF/CSV)...')}
            className="flex items-center gap-unit-xs bg-surface-container-lowest text-primary hover:bg-surface-container-high px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm border border-outline-variant/60"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export QCO Gazette</span>
          </button>
          <Link
            href="/new-analysis"
            className="flex items-center gap-unit-xs bg-primary-container text-on-primary hover:bg-primary px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">rule</span>
            <span>Check Tender Against QCO</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-md mb-unit-xl">
        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Active QCO Orders
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">gavel</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">156</span>
            <span className="font-code-sm text-code-sm text-tertiary-container font-semibold">Gazetted</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Mandatory for Central &amp; State Tenders</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Scheme I (ISI Mark)
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">verified_user</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">624</span>
            <span className="font-code-sm text-code-sm text-outline font-medium">Products</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Factory audit &amp; periodic testing</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Scheme II (CRS Electronics)
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">memory</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">88</span>
            <span className="font-code-sm text-code-sm text-outline font-medium">Categories</span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">IT, Telecom &amp; Solar equipment</span>
        </div>

        <div className="bg-surface-container-lowest p-unit-lg rounded-lg shadow-sm border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-unit-sm">
            <span className="font-label-eyebrow text-label-eyebrow uppercase text-outline font-semibold">
              Pending Deadlines
            </span>
            <span className="material-symbols-outlined text-[20px] text-secondary">event_upcoming</span>
          </div>
          <div className="flex items-baseline gap-unit-xs">
            <span className="font-headline-xl text-headline-xl font-bold text-secondary">12</span>
            <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-semibold">
              2026 Deadlines
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-outline mt-1">Exemption sunset approaching</span>
        </div>
      </div>

      {/* INTERACTIVE BIS CM/L LICENSE VERIFICATION WORKBENCH */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-6 shadow-sm mb-unit-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-outline-variant/40 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-eyebrow text-[11px] tracking-wider text-primary font-bold uppercase">
                STATUTORY VERIFIER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span className="font-code-sm text-[11px] text-outline">BIS MANAKONLINE API</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold mt-1">
              Verify Manufacturer BIS Licence (CM/L Number)
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Confirm that a participating tenderer holds an active, unrevoked BIS License for the specified Indian Standard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-outline">Try Sample:</span>
            <button
              onClick={() => {
                setLicenseInput('8400192');
                setLookupResult(SAMPLE_LICENSES['8400192']);
              }}
              className="font-code-sm text-[11px] px-2 py-1 rounded bg-surface-container text-primary font-bold hover:bg-surface-container-high"
            >
              CM/L-8400192 (BHEL)
            </button>
            <button
              onClick={() => {
                setLicenseInput('7150244');
                setLookupResult(SAMPLE_LICENSES['7150244']);
              }}
              className="font-code-sm text-[11px] px-2 py-1 rounded bg-surface-container text-primary font-bold hover:bg-surface-container-high"
            >
              CM/L-7150244 (Supreme)
            </button>
            <button
              onClick={() => {
                setLicenseInput('9921045');
                setLookupResult(SAMPLE_LICENSES['9921045']);
              }}
              className="font-code-sm text-[11px] px-2 py-1 rounded bg-error-container/40 text-error font-bold hover:bg-error-container"
            >
              CM/L-9921045 (Expired)
            </button>
          </div>
        </div>

        <form onSubmit={handleVerifyLicense} className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
              badge
            </span>
            <input
              type="text"
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
              placeholder="Enter 7-digit CM/L Number (e.g. 8400192 or CM/L-8400192)..."
              className="w-full h-10 pl-10 pr-3 rounded border border-outline-variant text-body-sm text-on-surface bg-surface font-code-sm focus:border-primary-container focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying || !licenseInput.trim()}
            className="h-10 px-6 bg-primary-container hover:bg-primary text-on-primary rounded font-label-md text-label-md font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Connecting to BIS Registry...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Verify Licence Validity</span>
              </>
            )}
          </button>
        </form>

        {/* Verification Result Card */}
        {lookupResult && (
          <div className="p-4 rounded bg-surface-container-low border border-outline-variant/60 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3 border-b border-outline-variant/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-code-sm font-bold text-body-md text-primary">
                    {lookupResult.licenseNo}
                  </span>
                  {lookupResult.status === 'VALID' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-label-sm text-label-sm font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                      ACTIVE &amp; OPERATIONAL
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-error font-label-sm text-label-sm font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      EXPIRED / SUSPENDED
                    </span>
                  )}
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mt-1">
                  {lookupResult.manufacturer}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[11px] text-outline block">Validity Period</span>
                  <span className="font-code-sm text-body-sm font-semibold text-on-surface">
                    {lookupResult.validFrom} to {lookupResult.validTo}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-body-sm">
              <div>
                <span className="text-[11px] text-outline block">Licensed Standard Code</span>
                <span className="font-code-sm font-bold text-primary">{lookupResult.standard}</span>
              </div>
              <div>
                <span className="text-[11px] text-outline block">Certified Scope</span>
                <span className="font-medium text-on-surface">{lookupResult.product}</span>
              </div>
              <div>
                <span className="text-[11px] text-outline block">Factory Premise Location</span>
                <span className="text-on-surface-variant text-[12px]">{lookupResult.factoryAddress}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FILTERABLE QCO STATUTORY CALENDAR TABLE */}
      <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/50 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-outline-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-headline-md text-headline-md text-primary font-bold">
              Active Quality Control Orders (QCO) Directory
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Central Government gazette notifications mandating standard marks for public procurement under GFR 144(vii).
            </p>
          </div>

          <div className="relative">
            <select
              value={ministryFilter}
              onChange={(e) => setMinistryFilter(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 bg-surface-container border border-outline-variant/60 rounded text-label-md font-semibold text-primary cursor-pointer"
            >
              <option>All Ministries</option>
              <option>Ministry of Heavy Industries &amp; Power</option>
              <option>Ministry of Chemicals &amp; Fertilizers</option>
              <option>Ministry of Steel</option>
              <option>Ministry of New &amp; Renewable Energy (MNRE)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] text-outline pointer-events-none">
              arrow_drop_down
            </span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant">
                <th className="py-unit-md px-unit-lg font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  QCO TITLE &amp; GAZETTE NOTIFICATION
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  MANDATING MINISTRY
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  APPLICABLE STANDARDS
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  CONFORMITY SCHEME
                </th>
                <th className="py-unit-md px-unit-md font-label-eyebrow text-label-eyebrow tracking-wider uppercase">
                  ENFORCEMENT DATE
                </th>
                <th className="py-unit-md px-unit-lg font-label-eyebrow text-label-eyebrow tracking-wider uppercase text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 font-body-sm text-body-sm">
              {filteredQcos.map((qco) => (
                <tr key={qco.id} className="hover:bg-surface transition-colors group">
                  <td className="py-unit-md px-unit-lg max-w-sm">
                    <div className="flex flex-col">
                      <span className="font-headline-md text-body-md font-bold text-primary group-hover:text-primary-container">
                        {qco.orderName}
                      </span>
                      <span className="font-code-sm text-[11px] text-outline mt-0.5">
                        Gazette Ref: {qco.gazetteNo}
                      </span>
                    </div>
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    <span className="text-on-surface font-medium">{qco.ministry}</span>
                  </td>

                  <td className="py-unit-md px-unit-md">
                    <div className="flex flex-wrap gap-1">
                      {qco.standards.map((s) => (
                        <span
                          key={s}
                          className="font-code-sm text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-primary font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-tertiary-container">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      {qco.scheme}
                    </span>
                  </td>

                  <td className="py-unit-md px-unit-md whitespace-nowrap">
                    <span className="font-body-sm font-medium text-on-surface">
                      {qco.enforcementDate}
                    </span>
                    {qco.status === 'Active' ? (
                      <span className="block font-code-sm text-[10px] text-tertiary-container font-bold">
                        Enforced Active
                      </span>
                    ) : (
                      <span className="block font-code-sm text-[10px] text-secondary font-bold">
                        Upcoming (Pending)
                      </span>
                    )}
                  </td>

                  <td className="py-unit-md px-unit-lg text-right whitespace-nowrap">
                    <Link
                      href="/specification-builder"
                      className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container font-semibold hover:text-primary hover:underline"
                    >
                      <span>Draft clause</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
