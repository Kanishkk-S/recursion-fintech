import React, { useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Fingerprint,
  Sliders,
  Cpu,
  FileCode2,
  Check
} from 'lucide-react';
import type { WorkerProfile, W3CCredential, UnderwritingResult } from '../types';

interface LenderViewProps {
  profile: WorkerProfile;
  rawCredential: W3CCredential | null;
  requestedLoan: number;
  setRequestedLoan: (amount: number) => void;
  isTamperMode: boolean;
  setIsTamperMode: (tamper: boolean) => void;
  isEvaluating: boolean;
  underwritingResult: UnderwritingResult | null;
  onExecuteUnderwrite: () => Promise<void>;
}

export const LenderView: React.FC<LenderViewProps> = ({
  profile,
  rawCredential,
  requestedLoan,
  setRequestedLoan,
  isTamperMode,
  setIsTamperMode,
  isEvaluating,
  underwritingResult,
  onExecuteUnderwrite
}) => {
  // Real-time calculation preview
  const estimatedPreview = useMemo(() => {
    const isPrime = requestedLoan <= 35000;
    const rate = isPrime ? 11.5 : 13.5;
    const tenure = isPrime ? 12 : 6;
    const r = (rate / 100) / 12;
    const n = tenure;
    const emi = (requestedLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return {
      rate: `${rate}%`,
      tenure: `${tenure} Mo`,
      emi: isNaN(emi) ? 0 : Math.round(emi),
      isPrime
    };
  }, [requestedLoan]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-2">
      
      {/* Terminal Title & Institutional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0D061C] border border-[#1C0B3B]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-[#3B0764] p-[1.5px] shadow-md shadow-purple-950/40">
            <div className="w-full h-full bg-[#0D061C] rounded-[14px] flex items-center justify-center">
              <Landmark className="w-6 h-6 text-[#C084FC]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">NBFC Underwriting Terminal</h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-[#D8B4FE] border border-purple-500/25">
                INSTITUTIONAL AIRLOCK v2
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Automated Zero-Trust Verifiable Credential Underwriter</p>
          </div>
        </div>

        {/* Security Indicator Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#07030F] border border-[#1C0B3B] text-xs font-mono self-start sm:self-auto">
          <Cpu className="w-4 h-4 text-[#C084FC]" />
          <span className="text-[#9CA3AF]">Verifier Protocol:</span>
          <span className="text-[#10B981] font-semibold">RFC 8785 • Ed25519</span>
        </div>
      </div>

      {/* Main 2-Column Audit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Ingestion Panel & Underwriting Controls (5.5-6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* 1. Credential Ingestion Panel */}
          <div className="bg-[#0D061C] rounded-3xl p-5 sm:p-6 border border-[#1C0B3B] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C0B3B]">
              <div className="flex items-center gap-2.5">
                <FileCode2 className="w-4 h-4 text-[#C084FC]" />
                <h3 className="text-sm font-bold text-white">Ingested Credential Payload</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono font-semibold">
                <Check className="w-3 h-3" />
                <span>Ed25519 Public Key Match</span>
              </div>
            </div>

            {/* Ingested Subject Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[#120826] p-3 rounded-2xl border border-[#1C0B3B]">
                <span className="text-[10px] text-[#9CA3AF] block">Subject Worker</span>
                <span className="font-semibold text-white truncate block">{profile.worker_name}</span>
                <span className="text-[10px] font-mono text-[#6B7280] truncate block mt-0.5">{profile.did}</span>
              </div>

              <div className="bg-[#120826] p-3 rounded-2xl border border-[#1C0B3B]">
                <span className="text-[10px] text-[#9CA3AF] block">Attested Cash Flow</span>
                <span className="font-bold text-[#10B981] text-sm block font-mono">
                  ₹{profile.telemetry_summary.monthly_inflow_inr.toLocaleString('en-IN')} / mo
                </span>
                <span className="text-[10px] text-[#A855F7] block font-mono">
                  CRI Score: {profile.cri_score.toFixed(1)} ({profile.resilience_tier})
                </span>
              </div>
            </div>

            {/* Canonical Claim Details */}
            <div className="p-3 rounded-2xl bg-[#07030F] border border-[#1C0B3B] flex flex-col gap-1.5 text-[11px] font-mono text-[#9CA3AF]">
              <div className="flex justify-between">
                <span>Issuer Authority:</span>
                <span className="text-slate-300 truncate max-w-[220px]">
                  {rawCredential?.issuer?.id || "did:gignite:authority-node-01"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Min Inflow Claim (Guaranteed):</span>
                <span className={`font-semibold ${isTamperMode ? 'text-rose-400' : 'text-[#10B981]'}`}>
                  {isTamperMode ? "₹85,000 / mo [TAMPERED]" : "₹25,000 / mo [AUTHENTIC]"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Telemetry Shift Consistency:</span>
                <span className="text-white font-semibold">{profile.telemetry_summary.consistency_rate}</span>
              </div>
            </div>
          </div>

          {/* 2. Risk Parameter & Loan Slider */}
          <div className="bg-[#0D061C] rounded-3xl p-5 sm:p-6 border border-[#1C0B3B] flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C084FC]" />
                <h3 className="text-sm font-bold text-white">Underwriting Loan Target</h3>
              </div>
              <span className="text-lg sm:text-xl font-bold font-mono text-white">
                ₹{requestedLoan.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={10000}
              max={60000}
              step={2500}
              value={requestedLoan}
              onChange={(e) => setRequestedLoan(Number(e.target.value))}
              className="w-full h-2 bg-[#160A2E] rounded-lg appearance-none cursor-pointer accent-[#C084FC]"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
              <span>Min: ₹10,000</span>
              <span className="text-amber-400 font-semibold">Prime Tier Cap: ₹35,000</span>
              <span>Max: ₹60,000</span>
            </div>

            {/* Rate & EMI Preview Cards */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1C0B3B] text-center">
              <div className="bg-[#07030F] p-2.5 rounded-2xl border border-[#1C0B3B]">
                <span className="text-[10px] text-[#6B7280] block">Assessed APR</span>
                <span className="text-xs font-bold font-mono text-[#C084FC]">{estimatedPreview.rate}</span>
              </div>
              <div className="bg-[#07030F] p-2.5 rounded-2xl border border-[#1C0B3B]">
                <span className="text-[10px] text-[#6B7280] block">Tenure</span>
                <span className="text-xs font-bold font-mono text-white">{estimatedPreview.tenure}</span>
              </div>
              <div className="bg-[#07030F] p-2.5 rounded-2xl border border-[#1C0B3B]">
                <span className="text-[10px] text-[#6B7280] block">Est. Monthly EMI</span>
                <span className="text-xs font-bold font-mono text-[#10B981]">₹{estimatedPreview.emi.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 3. 1-Bit Payload Tamper Sandbox Toggle */}
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${
            isTamperMode 
              ? 'bg-[#2A0815]/70 border-rose-500/40 shadow-md glow-rose' 
              : 'bg-[#0D061C] border-[#1C0B3B]'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  isTamperMode ? 'bg-rose-500/20 text-rose-400' : 'bg-[#160A2E] text-[#9CA3AF]'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">1-Bit Payload Tamper Simulation</h4>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                    Injects artificial monthly inflow: ₹25,000 ➔ ₹85,000
                  </p>
                </div>
              </div>

              {/* Switch Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isTamperMode}
                  onChange={(e) => setIsTamperMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#160A2E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <p className="text-[11px] text-[#9CA3AF] mt-3 pt-3 border-t border-[#1C0B3B] leading-relaxed font-mono">
              {isTamperMode ? (
                <span className="text-rose-400 font-semibold">
                  ⚠️ Tampering active! Payload will be submitted with mismatched RFC 8785 Ed25519 signature to trigger automated zero-trust security halt.
                </span>
              ) : (
                <span>Authentic W3C Credential will be cryptographically verified against the GIgnite Authority Node.</span>
              )}
            </p>
          </div>

          {/* 4. Decision Engine CTA Button */}
          <button
            type="button"
            onClick={onExecuteUnderwrite}
            disabled={isEvaluating}
            className={`w-full py-4 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md disabled:opacity-50 cursor-pointer ${
              isTamperMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white glow-rose animate-pulse'
                : 'purple-magenta-gradient hover:opacity-95 text-white glow-purple'
            }`}
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Cryptographic Verification...</span>
              </>
            ) : isTamperMode ? (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Execute Tampered Underwrite (Expect Halt)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Execute Cryptographic Underwrite</span>
              </>
            )}
          </button>

        </div>

        {/* RIGHT COLUMN: Terminal Audit Output & Decision Console (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          <div className="bg-[#0D061C] rounded-3xl p-5 sm:p-6 border border-[#1C0B3B] flex flex-col gap-4 min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C0B3B]">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-[#C084FC]" />
                <h3 className="text-sm font-bold text-white">Underwriting Decision Console</h3>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280]">
                {underwritingResult ? "Audit Completed" : "Awaiting Execution"}
              </span>
            </div>

            {/* Dynamic Results Terminal */}
            {underwritingResult ? (
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col gap-4 transition-all duration-300 animate-in fade-in ${
                underwritingResult.decision === 'REJECTED_SECURITY_HALT'
                  ? 'bg-[#2A0815]/60 border-rose-500/40 shadow-lg glow-rose'
                  : underwritingResult.decision === 'APPROVED'
                  ? 'bg-[#061F15]/60 border-emerald-500/40 shadow-lg glow-emerald'
                  : 'bg-[#160A2E]/60 border-purple-500/40 shadow-lg glow-purple'
              }`}>
                
                {/* Result Header Banner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {underwritingResult.decision === 'REJECTED_SECURITY_HALT' ? (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    ) : underwritingResult.decision === 'APPROVED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-[#C084FC]" />
                    )}
                    <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider font-mono ${
                      underwritingResult.decision === 'REJECTED_SECURITY_HALT'
                        ? 'text-rose-400'
                        : underwritingResult.decision === 'APPROVED'
                        ? 'text-emerald-400'
                        : 'text-[#F3F4F6]'
                    }`}>
                      {underwritingResult.decision === 'REJECTED_SECURITY_HALT'
                        ? 'HTTP 403 SECURITY HALT'
                        : underwritingResult.decision === 'APPROVED'
                        ? 'HTTP 200 APPROVED'
                        : 'HTTP 200 CONDITIONAL APPROVAL'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>

                {/* Scenario 1: Fraud / Tamper Halt */}
                {underwritingResult.decision === 'REJECTED_SECURITY_HALT' && (
                  <div className="flex flex-col gap-3 text-xs text-slate-300 font-mono">
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/25 text-rose-300">
                      <span className="font-bold block mb-1">[!] FRAUD_TAMPER_DETECTED</span>
                      <p className="leading-relaxed">
                        {underwritingResult.error || "Signature mismatch on canonical payload. Credential altered after issuance."}
                      </p>
                    </div>

                    {underwritingResult.audit_metadata && (
                      <div className="flex flex-col gap-2 text-[10px] text-[#9CA3AF] bg-[#07030F] p-3.5 rounded-2xl border border-rose-900/30">
                        <div>
                          <span className="text-[#6B7280] block">Presented Inflow Signature:</span>
                          <span className="text-rose-400 break-all block">{underwritingResult.audit_metadata.presented_signature}</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block">Expected Authoritative Signature:</span>
                          <span className="text-emerald-400 break-all block">{underwritingResult.audit_metadata.expected_signature}</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block">Authority Verification Anchor:</span>
                          <span className="text-white">{underwritingResult.audit_metadata.verificationMethod || "did:gignite:authority-node-01#key-2026"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scenario 2: Full Approved Loan */}
                {underwritingResult.decision === 'APPROVED' && (
                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-[#07030F] p-3 rounded-2xl border border-emerald-900/40">
                        <span className="text-[10px] text-[#9CA3AF] block">Sanctioned Limit</span>
                        <span className="text-lg font-bold font-mono text-emerald-400">
                          ₹{underwritingResult.sanctioned_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-[#07030F] p-3 rounded-2xl border border-emerald-900/40">
                        <span className="text-[10px] text-[#9CA3AF] block">Prime APR</span>
                        <span className="text-lg font-bold font-mono text-[#C084FC]">
                          {underwritingResult.annual_interest_rate_p_a}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                      <div className="flex justify-between mb-1.5">
                        <span>Monthly EMI:</span>
                        <span className="font-bold text-white">₹{underwritingResult.monthly_emi_inr?.toLocaleString('en-IN')} / mo</span>
                      </div>
                      <div className="flex justify-between mb-1.5">
                        <span>Tenure Duration:</span>
                        <span>{underwritingResult.tenure_months} Months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Underwriting Audit:</span>
                        <span className="font-bold text-emerald-400">RFC 8785 VERIFIED • DISBURSAL READY</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scenario 3: Conditional Approval & 21-Day Counterfactual Roadmap */}
                {underwritingResult.decision === 'CONDITIONAL_APPROVAL' && (
                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#120826] border border-purple-500/30 flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-[#9CA3AF] block">Instant Safe Credit Floor</span>
                        <span className="text-base font-bold text-emerald-400">
                          ₹{underwritingResult.instant_available_limit?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#9CA3AF] block">Stretch Capital Gap</span>
                        <span className="text-sm font-bold text-amber-400">
                          ₹{underwritingResult.remediation_plan?.funding_gap?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {underwritingResult.remediation_plan && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-[#F3F4F6] uppercase tracking-wider">
                          21-Day Actionable Remediation Pathway
                        </span>
                        {underwritingResult.remediation_plan.actionable_milestones.map((m, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-[#07030F] border border-[#1C0B3B] text-[11px]">
                            <div className="flex items-center justify-between text-[#C084FC] font-semibold mb-1">
                              <span>{m.day_range}: {m.title}</span>
                              <span className="text-emerald-400 font-mono text-[10px]">{m.target_delta}</span>
                            </div>
                            <p className="text-[#9CA3AF] leading-snug">{m.action}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              /* Awaiting State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#6B7280]">
                <div className="w-14 h-14 rounded-2xl bg-[#07030F] border border-[#1C0B3B] flex items-center justify-center mb-3">
                  <Fingerprint className="w-7 h-7 text-[#4B5563]" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">Awaiting Cryptographic Underwriting</h4>
                <p className="text-xs max-w-sm mt-1 text-[#9CA3AF]">
                  Adjust the loan slider or toggle the 1-bit tamper simulation, then click <strong>"Execute Cryptographic Underwrite"</strong> to run the automated zero-trust decisioning engine.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
