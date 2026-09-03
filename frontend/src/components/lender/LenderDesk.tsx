import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  Fingerprint,
  ClipboardPaste,
  FileCheck,
  FileWarning,
  Activity,
  ArrowRight,
  Monitor,
  Download,
  X,
  Banknote
} from 'lucide-react';

type LoanAmount = 30000 | 75000;
type DecisionStatus = 'IDLE' | 'APPROVED' | 'REJECTED_SECURITY_HALT' | 'CONDITIONAL_APPROVAL';

interface UnderwriteResponse {
  decision: DecisionStatus;
  credit_limit?: number;
  interest_rate_apr?: string;
  tenure_months?: number;
  monthly_emi?: number;
  audit_signature?: string;
  security_flag?: string;
  reason?: string;
  immediate_limit?: number;
  stretch_goal?: number;
  remediation_window_days?: number;
  roadmap?: {
    daily_target_inflow: number;
    additional_shifts_required: number;
    consistency_threshold: number;
  };
}

const VALID_VC_PAYLOAD = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://gignite.io/credentials/v1"
  ],
  "type": ["VerifiableCredential", "GigWorkerProfile"],
  "issuer": "did:gignite:authority-node-01",
  "issuanceDate": new Date().toISOString(),
  "credentialSubject": {
    "id": "did:india:worker:ramesh-kumar-9872",
    "name": "Ramesh Kumar",
    "cri_score": 88.7,
    "resilience_tier": "PRIME_RESILIENT",
    "avg_monthly_inflow": 49066.0,
    "active_days_tracked": 180,
    "consistency_rate": 0.935
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": new Date().toISOString(),
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:gignite:authority-node-01#key-1",
    "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Y23q9..."
  }
};

const VALID_VC_STR = JSON.stringify(VALID_VC_PAYLOAD, null, 2);

export function LenderDesk() {
  const [vcPayload, setVcPayload] = useState<string>(VALID_VC_STR);
  const [loanAmount, setLoanAmount] = useState<LoanAmount>(30000);
  const [isTampered, setIsTampered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnderwriteResponse | null>(null);
  const [completedShifts, setCompletedShifts] = useState(0);
  const [showDisbursalModal, setShowDisbursalModal] = useState(false);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      const scenario = customEvent.detail;
      
      if (scenario === 'A') {
        setLoanAmount(30000);
        setIsTampered(false);
        setVcPayload(VALID_VC_STR);
        // We simulate the click by directly invoking the logic
        setTimeout(() => document.getElementById('btn-underwrite')?.click(), 100);
      } else if (scenario === 'B') {
        setLoanAmount(30000); // Amount doesn't matter, but reset it
        setIsTampered(true);
        setVcPayload(VALID_VC_STR.replace('49066', '99999'));
        setTimeout(() => document.getElementById('btn-underwrite')?.click(), 100);
      } else if (scenario === 'C') {
        setLoanAmount(75000);
        setIsTampered(false);
        setVcPayload(VALID_VC_STR);
        setTimeout(() => document.getElementById('btn-underwrite')?.click(), 100);
      }
    };
    
    const handleDirectSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setVcPayload(customEvent.detail);
        setIsTampered(false);
      }
    };
    
    window.addEventListener('TRIGGER_SCENARIO', handleTrigger);
    window.addEventListener('DIRECT_SYNC', handleDirectSync);
    return () => {
      window.removeEventListener('TRIGGER_SCENARIO', handleTrigger);
      window.removeEventListener('DIRECT_SYNC', handleDirectSync);
    };
  }, []);

  const handleTamperToggle = () => {
    setIsTampered(!isTampered);
    if (!isTampered) {
      setVcPayload(VALID_VC_STR.replace('49066', '99999'));
    } else {
      setVcPayload(VALID_VC_STR);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setVcPayload(text);
    } catch (e) {
      console.warn("Clipboard access denied");
    }
  };

  const handleUnderwrite = async () => {
    setLoading(true);
    setResult(null);

    await new Promise(resolve => setTimeout(resolve, 800));

    let payloadObj;
    try {
      payloadObj = JSON.parse(vcPayload);
    } catch (e) {
      setResult({
        decision: 'REJECTED_SECURITY_HALT',
        security_flag: 'MALFORMED_JSON',
        reason: 'The provided payload is not valid JSON.'
      });
      setLoading(false);
      return;
    }

    // Mock Backend Logic
    const currentInflow = payloadObj?.credentialSubject?.avg_monthly_inflow;
    const isTamperedPayload = currentInflow === 99999 || isTampered;

    if (isTamperedPayload) {
      setResult({
        decision: 'REJECTED_SECURITY_HALT',
        security_flag: 'FRAUD_TAMPER_DETECTED',
        reason: 'Cryptographic signature validation failure on credentialSubject payload'
      });
    } else if (loanAmount === 30000) {
      setResult({
        decision: 'APPROVED',
        credit_limit: 30000,
        interest_rate_apr: '11.5%',
        tenure_months: 6,
        monthly_emi: 5170,
        audit_signature: 'did:gignite:verifier-node-04:valid'
      });
    } else {
      setResult({
        decision: 'CONDITIONAL_APPROVAL',
        immediate_limit: 24500,
        stretch_goal: 75000,
        remediation_window_days: 21,
        roadmap: {
          daily_target_inflow: 2100,
          additional_shifts_required: 8,
          consistency_threshold: 0.95
        }
      });
    }

    setLoading(false);
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.decision === 'APPROVED') {
      return (
        <div className="mt-6 border border-amber-400/50 bg-[#0B1325] rounded-2xl p-6 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-400 rounded-full p-1.5 shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
            </div>
            <h3 className="text-xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">Approved - Elite Trust</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#010205] p-4 rounded-xl border border-amber-900/30">
              <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Credit Limit</p>
              <p className="text-2xl font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">₹{result.credit_limit?.toLocaleString()}</p>
            </div>
            <div className="bg-[#010205] p-4 rounded-xl border border-amber-900/30">
              <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Monthly EMI</p>
              <p className="text-2xl font-bold text-slate-200">₹{result.monthly_emi?.toLocaleString()}</p>
            </div>
            <div className="bg-[#010205] p-4 rounded-xl border border-amber-900/30">
              <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Interest Rate</p>
              <p className="text-lg font-bold text-slate-200">{result.interest_rate_apr} APR</p>
            </div>
            <div className="bg-[#010205] p-4 rounded-xl border border-amber-900/30">
              <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Tenure</p>
              <p className="text-lg font-bold text-slate-200">{result.tenure_months} months</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-900/30 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-amber-500/70" />
              <p className="text-[10px] text-amber-500/70 font-mono break-all">{result.audit_signature}</p>
            </div>
            <button 
              onClick={() => setShowDisbursalModal(true)}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(217,119,6,0.4)] flex items-center justify-center gap-2"
            >
              <Banknote className="w-4 h-4" /> Disburse ₹{result.credit_limit?.toLocaleString()} to Earner UPI
            </button>
          </div>
        </div>
      );
    }

    if (result.decision === 'REJECTED_SECURITY_HALT') {
      return (
        <div className="mt-6 border border-amber-900/50 bg-[#02050D] rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-amber-900/20 p-4 border-b border-amber-900/30 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-700 animate-pulse" />
            <h3 className="text-sm font-bold text-amber-700 tracking-wider uppercase">403 SECURITY HALT: {result.security_flag}</h3>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-stone-300 mb-4">{result.reason}</p>
            <div className="bg-[#010205] border border-amber-900/30 rounded-lg p-4 font-mono text-[10px] overflow-x-auto">
              <pre className="text-stone-400">
                <code>
                  {`"credentialSubject": {\n  "id": "did:india:worker:ramesh-kumar-9872",\n  "name": "Ramesh Kumar",\n  `}
                  <span className="text-amber-600 font-bold bg-amber-900/20 px-1 rounded">"avg_monthly_inflow": 99999.0,</span>
                  {`\n  ...\n}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      );
    }

    if (result.decision === 'CONDITIONAL_APPROVAL') {
      return (
        <div className="mt-6 border border-orange-500/40 bg-[#0B1325] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/20 rounded-full p-2 border border-orange-500/30">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500">Conditional Approval</h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Stretch goal requires remediation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#010205] rounded-xl border border-amber-900/30 p-5 flex flex-col justify-center">
              <p className="text-[10px] text-stone-500 font-semibold uppercase mb-1">Instant Micro-Credit Limit</p>
              <p className="text-3xl font-bold text-slate-200 mb-2">₹{result.immediate_limit?.toLocaleString()}</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide flex items-center gap-1">
                Target <ArrowRight className="w-3 h-3" /> ₹{result.stretch_goal?.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#010205] rounded-xl border border-orange-500/30 p-5">
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Interactive Remediation Simulator
              </p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Simulate Completed Shifts:</span>
                    <span className="font-bold text-amber-400">{completedShifts} / 8</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="8" 
                    value={completedShifts}
                    onChange={(e) => setCompletedShifts(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="pt-2 border-t border-orange-500/30">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400">Unlocked Credit Line</span>
                    <span className="font-medium text-orange-500">₹{(24500 + ((75000 - 24500) * (completedShifts / 8))).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#02050D] rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(24500 + ((75000 - 24500) * (completedShifts / 8))) / 75000 * 100}%` }}
                    ></div>
                  </div>
                </div>

                {completedShifts === 8 && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-center animate-pulse">
                    <span className="text-xs font-bold text-orange-400">Remediation Target Met: ₹75,000 Unlocked!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto relative transition-all duration-300 h-full flex flex-col">
      
      {/* Market Trends Panel (Absolute) */}
      <div className="absolute -right-[240px] top-10 w-[200px] hidden xl:block bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-4">Market Trends</h4>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Base APR</p>
            <p className="text-sm font-bold text-[#D4AF37]">11.5%</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-4 mb-2">
        <Monitor className="w-6 h-6 text-[#D4AF37]" />
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Lender Verification Desk</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Institutional Underwriting Terminal</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 relative flex-grow">
        {/* Verification Payload Inspector Card */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-lg space-y-6 relative h-full flex flex-col">
          {/* Floating mini-panel */}
          <div className="absolute -top-4 -left-4 bg-[#0F172A] border border-slate-700 rounded-xl p-3 shadow-lg z-20">
            <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Payment History Score</p>
            <p className="text-xs font-bold text-[#D4AF37]">Excellent</p>
          </div>
          
          <div className="space-y-3 pt-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Verification Payload Inspector
            </label>
            <div className="flex flex-wrap gap-2">
              <button onClick={handlePaste} className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5">
                <ClipboardPaste className="w-3.5 h-3.5" /> Paste from Earner
              </button>
              <button onClick={() => { setVcPayload(VALID_VC_STR); setIsTampered(false); }} className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-[#D4AF37] transition-colors flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Load Valid
              </button>
              <button onClick={() => { setVcPayload(VALID_VC_STR.replace('49066', '99999')); setIsTampered(true); }} className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-orange-500 transition-colors flex items-center gap-1.5">
                <FileWarning className="w-3.5 h-3.5" /> Load Tampered
              </button>
            </div>

            <div className="bg-[#0F172A] border border-slate-700 rounded-xl overflow-hidden relative group shadow-inner transition-all duration-300 flex-grow flex flex-col">
              <div className="bg-[#1E293B] border-b border-slate-700 px-3 py-2 flex items-center justify-between shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] font-mono text-[#D4AF37] opacity-80 uppercase tracking-widest">VC_Payload_Inspector</p>
              </div>
              <div className="p-3 flex-grow flex flex-col">
                <textarea
                  value={vcPayload}
                  onChange={(e) => setVcPayload(e.target.value)}
                  className="w-full h-full min-h-[8rem] bg-transparent text-[10px] font-mono text-[#D4AF37] outline-none resize-none no-scrollbar flex-grow"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Underwriting Controls Beige Card */}
        <div className="bg-[#FDF8EB] text-slate-900 rounded-2xl p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] space-y-6 md:-ml-8 md:mt-6 relative z-10 border border-white/40 h-full flex flex-col">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Underwriting Controls
            </label>
            <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setLoanAmount(30000)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${loanAmount === 30000 ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                ₹30,000 (Standard)
              </button>
              <button
                onClick={() => setLoanAmount(75000)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${loanAmount === 75000 ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                ₹75,000 (Stretch)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isTampered} onChange={handleTamperToggle} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isTampered ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isTampered ? 'translate-x-4' : ''} shadow-sm`}></div>
              </div>
              <span className={`text-xs font-bold ${isTampered ? 'text-orange-600' : 'text-slate-700'}`}>
                Simulate 1-Bit Inflow Tamper
              </span>
            </label>
          </div>

          <button
            id="btn-underwrite"
            onClick={handleUnderwrite}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-900 shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.23)] flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-1 mt-auto shrink-0"
          >
            {loading ? <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> : <> <Activity className="w-5 h-5" /> Run Automated Underwriting Engine </>}
          </button>
        </div>
      </div>

      {renderResult()}

      {result && (
        <div className="mt-6 border border-slate-700 bg-[#1E293B] rounded-xl overflow-hidden shadow-lg transition-all">
          <div className="p-4 border-b border-slate-700 bg-[#0F172A]">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#D4AF37]" /> Cryptographic Audit Trail & Proof Verification
            </h4>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Issuer Node</p>
                <p className="text-xs font-mono text-slate-300 bg-[#0F172A] p-2 rounded-md border border-slate-700 break-all">did:gignite:authority-node-01</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Cryptographic Algorithm</p>
                <p className="text-xs font-mono text-slate-300 bg-[#0F172A] p-2 rounded-md border border-slate-700 break-all">Ed25519VerificationKey2020</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Canonical Hash Status</p>
                {!isTampered ? (
                  <div className="flex items-center gap-2 text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-2 rounded-lg border border-[#D4AF37]/20 w-fit">
                    <CheckCircle2 className="w-4 h-4" /> <span className="text-xs font-bold tracking-wide">MATCH / INTEGRITY VERIFIED</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20 w-fit">
                    <ShieldAlert className="w-4 h-4" /> <span className="text-xs font-bold tracking-wide">MISMATCH / DIGEST CORRUPTED</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Selective Disclosure Status</p>
                <div className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-2 rounded-lg border border-[#D4AF37]/20 w-fit">
                  {vcPayload.includes('sd_full_history') ? 'Full 180-day telemetry disclosed' : 'Baseline claims only'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disbursal Modal */}
      {showDisbursalModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative flex flex-col items-center">
            <button 
              onClick={() => setShowDisbursalModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#0F172A] hover:bg-slate-700 border border-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="bg-[#D4AF37]/20 p-4 rounded-full border border-[#D4AF37]/30 mb-4">
              <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6 text-center">Disbursement Successful</h3>
            
            <div className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-4 space-y-3 mb-6 text-left">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Amount Transferred</span>
                <span className="text-sm font-bold text-[#D4AF37]">₹30,000 <span className="text-[10px] text-slate-500 font-normal">(Instant Credit)</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Beneficiary VPA</span>
                <span className="text-xs font-mono text-slate-300">ramesh.kumar@oksbi</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Settlement Rail</span>
                <span className="text-xs font-medium text-slate-300">NPCI UPI 2.0 / AA Escrow</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-700 pb-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Transaction Ref</span>
                <span className="text-xs font-mono text-slate-300">TXN-GIN-20260903-8842</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Receipt Hash</span>
                <span className="text-[10px] font-mono text-slate-500 truncate">0x7f2c84d9a3b11e2f9d784a1...</span>
              </div>
            </div>
            
            <div className="w-full space-y-2">
              <button className="w-full py-3 bg-[#0F172A] hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4 text-[#D4AF37]" /> Download Cryptographic Receipt
              </button>
              <button 
                onClick={() => setShowDisbursalModal(false)}
                className="w-full py-3 bg-transparent hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl font-bold text-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
