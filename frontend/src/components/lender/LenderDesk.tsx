import { useState } from 'react';
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
  Monitor
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
        <div className="mt-6 border border-emerald-500/50 bg-emerald-500/10 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 rounded-full p-1.5">
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400">Approved</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Credit Limit</p>
              <p className="text-2xl font-bold text-white">₹{result.credit_limit?.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Monthly EMI</p>
              <p className="text-2xl font-bold text-white">₹{result.monthly_emi?.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Interest Rate</p>
              <p className="text-lg font-bold text-white">{result.interest_rate_apr} APR</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tenure</p>
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
        <div className="mt-6 border border-rose-500 bg-rose-500/10 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-rose-500/20 p-4 border-b border-rose-500/30 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            <h3 className="text-sm font-bold text-rose-400 tracking-wider uppercase">403 SECURITY HALT: {result.security_flag}</h3>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-slate-300 mb-4">{result.reason}</p>
            <div className="bg-slate-950 border border-rose-500/30 rounded-lg p-4 font-mono text-[10px] overflow-x-auto">
              <pre className="text-slate-400">
                <code>
                  {`"credentialSubject": {\n  "id": "did:india:worker:ramesh-kumar-9872",\n  "name": "Ramesh Kumar",\n  `}
                  <span className="text-rose-400 font-bold bg-rose-500/10 px-1 rounded">"avg_monthly_inflow": 99999.0,</span>
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
        <div className="mt-6 border border-amber-500/50 bg-amber-500/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-500/20 rounded-full p-2 border border-amber-500/30">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-500">Conditional Approval</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Stretch goal requires remediation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5 flex flex-col justify-center">
              <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Instant Micro-Credit Limit</p>
              <p className="text-3xl font-bold text-white mb-2">₹{result.immediate_limit?.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide flex items-center gap-1">
                Target <ArrowRight className="w-3 h-3" /> ₹{result.stretch_goal?.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-amber-500/30 p-5">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {result.remediation_window_days}-Day Roadmap
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Daily Target Inflow</span>
                    <span className="font-medium text-white">₹{result.roadmap?.daily_target_inflow}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full w-1/3"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Extra Shifts Needed</span>
                    <span className="font-medium text-white">{result.roadmap?.additional_shifts_required}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full w-1/4"></div></div>
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 w-full max-w-2xl mx-auto backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Monitor className="w-6 h-6 text-blue-500" />
        <div>
          <h2 className="text-lg font-bold text-white">Lender Verification Desk</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Institutional Underwriting Terminal</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Verification Payload Inspector
            </label>
            <div className="flex flex-wrap gap-2">
              <button onClick={handlePaste} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5">
                <ClipboardPaste className="w-3.5 h-3.5" /> Paste from Earner
              </button>
              <button onClick={() => { setVcPayload(VALID_VC_STR); setIsTampered(false); }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-emerald-400 transition-colors flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Load Valid
              </button>
              <button onClick={() => { setVcPayload(VALID_VC_STR.replace('49066', '99999')); setIsTampered(true); }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-rose-400 transition-colors flex items-center gap-1.5">
                <FileWarning className="w-3.5 h-3.5" /> Load Tampered
              </button>
            </div>

            <div className="h-40 rounded-xl border border-slate-700/50 bg-slate-950 overflow-hidden focus-within:border-blue-500/50 transition-colors p-3">
              <textarea
                value={vcPayload}
                onChange={(e) => setVcPayload(e.target.value)}
                className="w-full h-full bg-transparent text-[10px] font-mono text-slate-400 outline-none resize-none no-scrollbar"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Underwriting Controls
            </label>
            <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setLoanAmount(30000)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${loanAmount === 30000 ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ₹30,000 (Standard)
              </button>
              <button
                onClick={() => setLoanAmount(75000)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${loanAmount === 75000 ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ₹75,000 (Stretch)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isTampered} onChange={handleTamperToggle} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isTampered ? 'bg-rose-500' : 'bg-slate-600'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isTampered ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className={`text-xs font-bold ${isTampered ? 'text-rose-400' : 'text-slate-300'}`}>
                Simulate 1-Bit Inflow Tamper
              </span>
            </label>
          </div>

          <button
            onClick={handleUnderwrite}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <> <Activity className="w-5 h-5" /> Run Automated Underwriting Engine </>}
          </button>
        </div>
      </div>

      {renderResult()}
    </div>
  );
}
