'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [officerName, setOfficerName] = useState('Priya Rao');
  const [designation, setDesignation] = useState('Procurement Officer / Executive Engineer');
  const [department, setDepartment] = useState('State Electricity Distribution Utility / Ministry of Power');
  const [gemId, setGemId] = useState('GEM-OFF-884210');
  const [cvcCheck, setCvcCheck] = useState(true);
  const [gfr144Check, setGfr144Check] = useState(true);
  const [makeInIndiaCheck, setMakeInIndiaCheck] = useState(true);
  const [autoUpgradeCheck, setAutoUpgradeCheck] = useState(true);
  const [toastText, setToastText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform preferences and compliance rules saved successfully.');
  };

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
              WORKSPACE / CONFIGURATION
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-code-sm text-code-sm text-outline">SYSTEM PREFERENCES</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
            Procurement Workspace Settings
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Manage officer credentials, statutory compliance policies, bilingual preferences, and Gazette synchronization feeds.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-unit-xs bg-primary-container text-on-primary hover:bg-primary px-unit-lg py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm self-start md:self-auto"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Section 1: Officer Profile & Credentials */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/40 mb-4">
            <span className="material-symbols-outlined text-primary-container text-[22px]">badge</span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              Officer Profile &amp; Digital Credentials
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <img
                alt="Priya Rao"
                src="/images/priya-rao.jpg"
                className="w-20 h-20 rounded-full object-cover border-2 border-primary-container shadow-sm"
              />
              <span className="text-[11px] font-label-sm font-semibold text-primary">Officer Photo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
              <div>
                <label className="block font-label-md text-label-sm text-on-surface font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface text-body-sm text-on-surface focus:border-primary-container focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-sm text-on-surface font-semibold mb-1">
                  Official Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface text-body-sm text-on-surface focus:border-primary-container focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-sm text-on-surface font-semibold mb-1">
                  Procuring Entity / Ministry
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface text-body-sm text-on-surface focus:border-primary-container focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-sm text-on-surface font-semibold mb-1">
                  Government e-Marketplace (GeM) Officer ID
                </label>
                <input
                  type="text"
                  value={gemId}
                  onChange={(e) => setGemId(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface text-body-sm font-code-sm text-on-surface focus:border-primary-container focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded border border-outline-variant/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container">verified</span>
              <div>
                <div className="font-headline-md text-body-sm font-bold text-primary">
                  Digital Signature Certificate (DSC Token)
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  Class 3 USB e-Token active. Valid for tender publication and audit certificate sign-off until December 2027.
                </div>
              </div>
            </div>
            <span className="font-code-sm text-[11px] px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-bold">
              CONNECTED
            </span>
          </div>
        </div>

        {/* Section 2: Statutory Compliance Rules */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/40 mb-4">
            <span className="material-symbols-outlined text-primary-container text-[22px]">policy</span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              Statutory Procurement Audit Engine Rules
            </h2>
          </div>

          <div className="space-y-4 font-body-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cvcCheck}
                onChange={(e) => setCvcCheck(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary-container focus:ring-primary-container"
              />
              <div>
                <span className="font-semibold text-primary block">
                  Enforce CVC Anti-Tailoring Directives (OM 03-05-1-CTE-9)
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Strictly flags any single-OEM brand restrictions (e.g. "Only Supreme", "Only ABB") and mandates neutral BIS performance parameters.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={gfr144Check}
                onChange={(e) => setGfr144Check(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary-container focus:ring-primary-container"
              />
              <div>
                <span className="font-semibold text-primary block">
                  Mandate GFR Rule 144(xi) Land Border Security Compliance
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Inserts statutory DPIIT registration clauses for any bidders or consortium partners from countries sharing a land border with India.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={makeInIndiaCheck}
                onChange={(e) => setMakeInIndiaCheck(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary-container focus:ring-primary-container"
              />
              <div>
                <span className="font-semibold text-primary block">
                  Public Procurement (Preference to Make in India) Order 2017
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Enforces minimum 50% Class-I local content margin of purchase preference and flags tenders lacking self-certification stipulations.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpgradeCheck}
                onChange={(e) => setAutoUpgradeCheck(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary-container focus:ring-primary-container"
              />
              <div>
                <span className="font-semibold text-primary block">
                  Automatic Superseded Standard Recommendation
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Automatically flags when older edition years are cited (e.g. IS 1180:1989 or IS 4984:1995) and proposes active gazetted standards.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: National Gazette Synchronization */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/40 mb-4">
            <span className="material-symbols-outlined text-primary-container text-[22px]">sync</span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              Bureau of Indian Standards Gazette Synchronization Node
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm">
            <div>
              <span className="text-[11px] text-outline block font-semibold">Active Gazette Endpoint</span>
              <span className="font-code-sm text-primary font-bold">https://services.bis.gov.in/api/v4/gazette-sync</span>
            </div>
            <div>
              <span className="text-[11px] text-outline block font-semibold">Scheduled Frequency</span>
              <span className="text-on-surface font-medium">Daily at 04:00 IST (Automatic Background Poll)</span>
            </div>
            <div>
              <span className="text-[11px] text-outline block font-semibold">Node Status</span>
              <span className="font-semibold text-tertiary-container flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                Live Node v4.18.2 (100% synchronized)
              </span>
            </div>
            <div>
              <span className="text-[11px] text-outline block font-semibold">Manual Action</span>
              <button
                type="button"
                onClick={() => showToast('Connecting to BIS Gazette node... 14 new errata sheets synchronized.')}
                className="mt-1 px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded text-primary font-semibold text-[12px]"
              >
                Trigger Manual Synchronization Now
              </button>
            </div>
          </div>
        </div>

        {/* Form Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary rounded font-label-md text-body-sm font-semibold shadow-sm transition"
          >
            Save All Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
}
