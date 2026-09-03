import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  ShieldAlert, 
  Fingerprint, 
  ClipboardPaste,
  FileCheck,
  FileWarning,
  Activity,
  ArrowRight
} from 'lucide-react';

// Types
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

const VALID_VC_PAYLOAD = `{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://gignite.io/credentials/v1"
  ],
  "type": ["VerifiableCredential", "GigWorkerProfile"],
  "issuer": "did:gignite:node:oracle-01",
  "issuanceDate": "2026-09-03T10:00:00Z",
  "credentialSubject": {
    "id": "did:gignite:worker:ramesh-kumar-9872",
    "name": "Ramesh Kumar",
    "cri_score": 88.7,
    "resilience_tier": "PRIME_RESILIENT",
    "avg_monthly_inflow": 49066.0,
    "active_days_tracked": 180,
    "consistency_rate": 0.935
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-09-03T10:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:gignite:node:oracle-01#key-1",
    "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Y23q9..."
  }
}`;

export function LenderDesk() {
  const [vcPayload, setVcPayload] = useState<string>(VALID_VC_PAYLOAD);
  const [loanAmount, setLoanAmount] = useState<LoanAmount>(30000);
  const [isTampered, setIsTampered] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnderwriteResponse | null>(null);

  const handleTamperToggle = () => {
    setIsTampered(!isTampered);
    if (!isTampered) {
      // Apply tamper
      setVcPayload(VALID_VC_PAYLOAD.replace('49066.0', '99999.0'));
    } else {
      // Revert tamper
      setVcPayload(VALID_VC_PAYLOAD);
    }
  };

  const handleUnderwrite = async () => {
    setLoading(true);
    setResult(null);

    // Simulated network delay
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

    try {
      const response = await fetch('http://localhost:8000/api/lender/underwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: payloadObj,
          loan_amount_requested: loanAmount
        })
      });
      if (!response.ok) throw new Error("Backend offline");
      const data = await response.json();
      setResult(data);
    } catch (e) {
      // Fallback Mock Logic
      const currentInflow = payloadObj?.credentialSubject?.avg_monthly_inflow;
      
      // Determine if it was tampered (specifically the inflow, or the toggle is on)
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
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.decision === 'APPROVED') {
      return (
        <div className="mt-6 border border-emerald-500/50 bg-emerald-500/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 rounded-full p-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#0B0F19]" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400">Approved</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111827] p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Credit Limit</p>
              <p className="text-2xl font-bold text-white">₹{result.credit_limit?.toLocaleString()}</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Monthly EMI</p>
              <p className="text-2xl font-bold text-white">₹{result.monthly_emi?.toLocaleString()}</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Interest Rate (APR)</p>
              <p className="text-lg font-bold text-white">{result.interest_rate_apr}</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 font-medium">Tenure</p>
              <p className="text-lg font-bold text-white">{result.tenure_months} months</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-emerald-500/70" />
            <p className="text-[10px] text-emerald-500/70 font-mono break-all">{result.audit_signature}</p>
          </div>
        </div>
      );
    }

    if (result.decision === 'REJECTED_SECURITY_HALT') {
      return (
        <div className="mt-6 border border-rose-500 bg-rose-500/10 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(225,29,72,0.2)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-rose-500/20 p-4 border-b border-rose-500/30 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            <h3 className="text-lg font-bold text-rose-400 tracking-wider">403 SECURITY HALT: Cryptographic Signature Mismatch</h3>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-slate-300 mb-4">{result.reason}</p>
            <div className="bg-[#0B0F19] border border-rose-500/30 rounded-lg p-4 font-mono text-xs overflow-x-auto relative">
              <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-400 px-2 py-1 rounded-bl-lg text-[10px] font-bold tracking-widest border-b border-l border-rose-500/30">
                {result.security_flag}
              </div>
              <pre className="text-slate-400 mt-2">
                <code>
                  {`"credentialSubject": {
  "id": "did:gignite:worker:ramesh-kumar-9872",
  "name": "Ramesh Kumar",
  "cri_score": 88.7,
  "resilience_tier": "PRIME_RESILIENT",
  `}
                  <span className="text-rose-400 font-bold bg-rose-500/10 px-1 rounded -mx-1">"avg_monthly_inflow": 99999.0,</span>
                  {`
  ...
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      );
    }

    if (result.decision === 'CONDITIONAL_APPROVAL') {
      return (
        <div className="mt-6 border border-amber-500/50 bg-amber-500/5 rounded-2xl p-6 shadow-[0_0_20px_rgba(245,158,11,0.1)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-500/20 rounded-full p-2 border border-amber-500/30">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-500">Conditional Approval</h3>
              <p className="text-xs text-slate-400">Stretch goal requires remediation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instant Micro-Credit */}
            <div className="bg-[#111827] rounded-xl border border-slate-700/50 p-5 flex flex-col justify-center">
              <p className="text-xs text-slate-400 font-medium mb-1">Instant Micro-Credit Available</p>
              <p className="text-3xl font-bold text-white mb-2">₹{result.immediate_limit?.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide flex items-center gap-1">
                Target <ArrowRight className="w-3 h-3" /> ₹{result.stretch_goal?.toLocaleString()}
              </p>
            </div>

            {/* Roadmap */}
            <div className="bg-[#111827] rounded-xl border border-amber-500/30 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -mr-4 -mt-4"></div>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {result.remediation_window_days}-Day Roadmap
              </p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Daily Earning Target</span>
                    <span className="font-medium text-white">₹{result.roadmap?.daily_target_inflow}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full w-1/3"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Additional Shifts Required</span>
                    <span className="font-medium text-white">{result.roadmap?.additional_shifts_required}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full w-1/4"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Required Consistency</span>
                  <span className="font-bold text-amber-400">{(result.roadmap?.consistency_threshold || 0) * 100}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-3xl mx-auto h-full overflow-y-auto no-scrollbar pb-12 pt-4 px-4 sm:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Monitor className="w-6 h-6 text-blue-500" />
          Lender Verification Desk
        </h2>
        <p className="text-slate-400 text-sm">
          Institutional underwriting terminal. Inspect zero-knowledge payloads and run automated risk simulations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Controls Section */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-64 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none"></div>
          
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            {/* Scenario Simulator */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
                  Loan Request Configuration
                </label>
                <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/50">
                  <button
                    onClick={() => setLoanAmount(30000)}
                    className={\`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all \${
                      loanAmount === 30000 ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }\`}
                  >
                    Standard: ₹30,000
                  </button>
                  <button
                    onClick={() => setLoanAmount(75000)}
                    className={\`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all \${
                      loanAmount === 75000 ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }\`}
                  >
                    Stretch: ₹75,000
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
                  Security Simulator
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={isTampered}
                      onChange={handleTamperToggle}
                    />
                    <div className={\`block w-10 h-6 rounded-full transition-colors \${isTampered ? 'bg-rose-500' : 'bg-slate-600'}\`}></div>
                    <div className={\`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${isTampered ? 'translate-x-4' : ''}\`}></div>
                  </div>
                  <span className={\`text-sm font-medium \${isTampered ? 'text-rose-400' : 'text-slate-300'}\`}>
                    Simulate 1-Bit Inflow Tamper
                  </span>
                </label>
              </div>
            </div>

            {/* Payload Inspector */}
            <div className="space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  W3C Credential Payload
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setVcPayload(VALID_VC_PAYLOAD); setIsTampered(false); }}
                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-emerald-400 transition-colors" title="Load Valid VC">
                    <FileCheck className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setVcPayload(VALID_VC_PAYLOAD.replace('49066.0', '99999.0')); setIsTampered(true); }}
                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-rose-400 transition-colors" title="Load Tampered VC">
                    <FileWarning className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.readText().then(text => setVcPayload(text)).catch(() => {})}
                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-blue-400 transition-colors" title="Paste from Clipboard">
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 min-h-[140px] relative rounded-xl border border-slate-700/50 bg-[#0B0F19] overflow-hidden focus-within:border-blue-500/50 transition-colors">
                <textarea 
                  value={vcPayload}
                  onChange={(e) => setVcPayload(e.target.value)}
                  className="w-full h-full bg-transparent text-[10px] font-mono text-slate-300 p-3 outline-none resize-none no-scrollbar"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <button 
              onClick={handleUnderwrite}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Run Automated Underwriting Engine
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Area */}
        {renderResult()}

      </div>
    </div>
  );
}
