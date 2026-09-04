import React from 'react';
import { 
  X, 
  TrendingUp, 
  Volume2, 
  FileCode2, 
  Landmark, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import type { WorkerProfile, W3CCredential, LenderProfile, UnderwritingResult } from '../types';
import { DailyWageSparkline } from './DailyWageSparkline';

export type StudioTab = 'telemetry' | 'soundbox' | 'credential' | 'underwrite';

interface StudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  profile: WorkerProfile;
  rawCredential: W3CCredential | null;
  activeLender?: LenderProfile;
  requestedLoan?: number;
  setRequestedLoan?: (amount: number) => void;
  isTamperMode?: boolean;
  setIsTamperMode?: (tamper: boolean) => void;
  isEvaluating?: boolean;
  underwritingResult?: UnderwritingResult | null;
  onExecuteUnderwrite?: () => Promise<void>;
  onVerifyZkTls?: () => Promise<void> | void;
  onOpenSoundboxModal?: () => void;
  onSendToLender?: () => void;
}

export const StudioDrawer: React.FC<StudioDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  profile,
  rawCredential,
  activeLender,
  requestedLoan = 25000,
  setRequestedLoan,
  isTamperMode = false,
  setIsTamperMode,
  isEvaluating = false,
  underwritingResult,
  onExecuteUnderwrite,
  onVerifyZkTls,
  onOpenSoundboxModal,
  onSendToLender
}) => {
  const [copiedJson, setCopiedJson] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    if (rawCredential) {
      navigator.clipboard.writeText(JSON.stringify(rawCredential, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Background click to close */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Drawer Container */}
      <div className="w-full max-w-2xl bg-[#090D1A] border-l border-[#1B253D] shadow-2xl h-full flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 relative z-10">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#1B253D] bg-[#0E1424] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#172038] border border-blue-500/30 flex items-center justify-center shadow-lg text-blue-400">
              {activeTab === 'telemetry' && <TrendingUp className="w-5 h-5 text-[#38BDF8]" />}
              {activeTab === 'soundbox' && <Volume2 className="w-5 h-5 text-[#C084FC]" />}
              {activeTab === 'credential' && <FileCode2 className="w-5 h-5 text-[#34D399]" />}
              {activeTab === 'underwrite' && <Landmark className="w-5 h-5 text-[#A78BFA]" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {activeTab === 'telemetry' && "zkTLS Daily Telemetry Studio"}
                {activeTab === 'soundbox' && "Merchant Soundbox Oracle Studio"}
                {activeTab === 'credential' && "W3C Verifiable Credential Studio"}
                {activeTab === 'underwrite' && "NBFC Underwriting Workbench"}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {activeTab === 'telemetry' && "30-Day continuous daily payout fluctuation & Merkle proof"}
                {activeTab === 'soundbox' && "Hardware voice-box settlement batches & T+0 ledger"}
                {activeTab === 'credential' && "RFC 8785 Canonical JSON & Ed25519 signature anchor"}
                {activeTab === 'underwrite' && "Risk threshold audit, loan target slider & 1-bit tamper demo"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141C30] border border-[#1E2945] text-[#94A3B8] hover:text-white hover:border-blue-500/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0A0E1C] border-b border-[#1B253D] overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'telemetry'
                ? 'bg-[#1E294B] text-white font-bold border border-blue-500/40 shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>30d Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('soundbox')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'soundbox'
                ? 'bg-[#1E294B] text-white font-bold border border-purple-500/40 shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-[#C084FC]" />
            <span>Soundbox Rail</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credential')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'credential'
                ? 'bg-[#1E294B] text-white font-bold border border-emerald-500/40 shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#34D399]" />
            <span>W3C Proof</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('underwrite')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'underwrite'
                ? 'bg-[#1E294B] text-white font-bold border border-indigo-500/40 shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Underwriter</span>
          </button>
        </div>

        {/* Drawer Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* ================================================================ */}
          {/* TAB 1: TELEMETRY STREAM STUDIO                                   */}
          {/* ================================================================ */}
          {activeTab === 'telemetry' && (
            <div className="space-y-5 animate-in fade-in">
              <DailyWageSparkline
                dailyWages={profile.daily_wages_30d || profile.telemetry_summary.daily_wages_30d}
                monthlyInflow={profile.telemetry_summary.monthly_inflow_inr}
                consistencyRate={profile.telemetry_summary.consistency_rate}
                activeDays={profile.telemetry_summary.active_working_days}
                workerName={profile.worker_name}
                isVerified={profile.is_zktls_verified !== false && profile.resilience_tier !== 'UNVERIFIED'}
                onTriggerZkTlsIngest={onVerifyZkTls}
              />

              {/* Inflow Ledger Breakdown */}
              <div className="p-4 rounded-2xl bg-[#0E1424] border border-[#1B253D] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Attested Platform Streams
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    100% Inflow Coverage
                  </span>
                </div>

                <div className="space-y-2">
                  {profile.platform_details && profile.platform_details.map((plat, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#080C18] border border-[#161F36] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{plat.platform} Partner Payout</span>
                        <span className="text-[11px] text-[#94A3B8] font-mono">
                          {plat.trips_completed} completed shifts • ★ {plat.rating.toFixed(2)} rating
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-emerald-400 text-sm">
                          +₹{plat.payout_amount_inr.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#64748B] block font-mono">{plat.payout_frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: SOUNDBOX ORACLE STUDIO                                    */}
          {/* ================================================================ */}
          {activeTab === 'soundbox' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-5 rounded-3xl bg-[#0E1424] border border-[#1B253D] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1B253D]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#172038] border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">PhonePe / Paytm Merchant Soundbox</h4>
                      <span className="text-[11px] text-[#94A3B8]">Hardware Voice Box Settlement Oracle</span>
                    </div>
                  </div>

                  {profile.is_soundbox_verified ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      zkTLS Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenSoundboxModal) onOpenSoundboxModal();
                      }}
                      className="px-3 py-1.5 rounded-xl purple-magenta-gradient text-white text-xs font-bold cursor-pointer"
                    >
                      ⚡ Ingest Soundbox
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-[#080C18] border border-[#161F36]">
                    <span className="text-[10px] text-[#64748B] block">30d Gross Volume</span>
                    <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                      {profile.is_soundbox_verified ? "₹43,500.00" : "Unlinked"}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#080C18] border border-[#161F36]">
                    <span className="text-[10px] text-[#64748B] block">Settled QR Scans</span>
                    <span className="text-base font-bold text-white mt-0.5 block">
                      {profile.is_soundbox_verified ? "1,120 Scans" : "0 Scans"}
                    </span>
                  </div>
                </div>

                {/* 3-Row Micro Settlement Ledger */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Attested Daily Micro-Settlements:
                  </span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-[#080C18] border border-[#161F36] flex items-center justify-between">
                      <span className="text-slate-200">Chai & Snacks Morning Rush (380 scans)</span>
                      <span className="text-emerald-400 font-bold">₹5,700 • T+0</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080C18] border border-[#161F36] flex items-center justify-between">
                      <span className="text-slate-200">Afternoon Tap Volume (240 scans)</span>
                      <span className="text-emerald-400 font-bold">₹3,600 • T+0</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080C18] border border-[#161F36] flex items-center justify-between">
                      <span className="text-slate-200">Evening Rush Hour (500 scans)</span>
                      <span className="text-emerald-400 font-bold">₹7,500 • T+0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: W3C CRYPTOGRAPHIC PROOF INSPECTOR                         */}
          {/* ================================================================ */}
          {activeTab === 'credential' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-[#0E1424] border border-[#1B253D]">
                  <span className="text-[10px] text-[#64748B] block">Subject DID</span>
                  <span className="text-purple-300 truncate block font-bold mt-0.5">{profile.did}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0E1424] border border-[#1B253D]">
                  <span className="text-[10px] text-[#64748B] block">Proof Type</span>
                  <span className="text-emerald-400 truncate block font-bold mt-0.5">
                    {rawCredential?.proof?.type || "Ed25519Signature2020"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#080C18] border border-[#161F36] flex items-center justify-between text-xs">
                <span className="text-[#94A3B8] font-mono">RFC 8785 Canonical JSON Payload</span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#141C30] border border-[#1E2945] text-white text-xs font-semibold hover:border-blue-500/40 transition-all cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="bg-[#050811] border border-[#161F36] rounded-2xl p-4 max-h-80 overflow-y-auto">
                <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                  {rawCredential ? JSON.stringify(rawCredential, null, 2) : "// Loading credential..."}
                </pre>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: NBFC UNDERWRITER WORKBENCH                                */}
          {/* ================================================================ */}
          {activeTab === 'underwrite' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Target Loan Target Slider */}
              <div className="p-5 rounded-3xl bg-[#0E1424] border border-[#1B253D] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Working Capital Target
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ₹{requestedLoan.toLocaleString('en-IN')}
                  </span>
                </div>

                <input
                  type="range"
                  min={10000}
                  max={activeLender?.max_limit_inr || 35000}
                  step={2500}
                  value={requestedLoan}
                  onChange={(e) => setRequestedLoan && setRequestedLoan(Number(e.target.value))}
                  className="w-full h-2 bg-[#161F36] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                  <span>Min: ₹10,000</span>
                  <span>Max: ₹{(activeLender?.max_limit_inr || 35000).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* 1-Bit Payload Tamper Toggle */}
              {setIsTamperMode && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  isTamperMode ? 'bg-rose-950/40 border-rose-500/50' : 'bg-[#0E1424] border-[#1B253D]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Simulate 1-Bit Payload Tamper</h4>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5 font-mono">
                        Alters attested monthly inflow claim before submitting to authority.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isTamperMode}
                        onChange={(e) => setIsTamperMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#161F36] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Execute Underwriting CTA */}
              {onExecuteUnderwrite && (
                <button
                  type="button"
                  onClick={onExecuteUnderwrite}
                  disabled={isEvaluating}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isTamperMode 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                      : 'purple-magenta-gradient text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isEvaluating ? "Auditing Payload..." : "Execute Cryptographic Underwrite"}</span>
                </button>
              )}

              {/* Underwriting Decision Results */}
              {underwritingResult && (
                <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
                  underwritingResult.decision === 'APPROVED' 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>{underwritingResult.decision === 'APPROVED' ? 'HTTP 200 APPROVED' : 'HTTP 403 SECURITY HALT'}</span>
                    <span className="text-[10px]">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-200">
                    {underwritingResult.decision === 'APPROVED'
                      ? `Sanctioned Credit Line: ₹${(underwritingResult.sanctioned_amount || requestedLoan).toLocaleString('en-IN')} @ ${activeLender?.base_apr_p_a || '11.5%'} APR`
                      : "RFC 8785 Canonical Digest Mismatch. Public key signature verification failed. Zero-trust isolation maintained."}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#1B253D] bg-[#0A0E1C] flex items-center justify-between gap-3">
          <span className="text-[10px] text-[#64748B] font-mono">
            RFC 8785 • Ed25519 Verified
          </span>

          <div className="flex items-center gap-2">
            {onSendToLender && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSendToLender();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl purple-magenta-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                <span>Lender Terminal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
