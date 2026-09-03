import { useState } from 'react';
import { ShieldCheck, Copy, QrCode, Lock, X } from 'lucide-react';
import { useWorkerProfile } from '../../hooks/useWorkerProfile';
import QRCode from 'react-qr-code';

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

export function EarnerPortal() {
  const { profile } = useWorkerProfile();
  const [selectiveDisclosure, setSelectiveDisclosure] = useState(false);
  const [issuedVc, setIssuedVc] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const fallbackPlatforms = [
    { name: "Swiggy", rating: 4.89, tenure_months: 14 },
    { name: "Uber", rating: 4.92, tenure_months: 22 }
  ];

  const handleIssue = async () => {
    // Simulated network delay for POST request
    await new Promise(r => setTimeout(r, 600));
    setIssuedVc(JSON.stringify(VALID_VC_PAYLOAD, null, 2));
  };

  const handleCopy = () => {
    if (issuedVc) {
      navigator.clipboard.writeText(issuedVc);
    }
  };

  const criScore = profile?.cri_score || 88.7;
  const strokeDasharray = 283;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * criScore) / 100;

  let gaugeColor = 'stroke-amber-900';
  let textColor = 'text-amber-700';
  let labelText = "Caution: High Volatility Detected";

  if (criScore >= 80) {
    gaugeColor = 'stroke-yellow-500';
    textColor = 'text-yellow-500';
    labelText = "Elite Trust Tier: Highly Resilient";
  } else if (criScore >= 50) {
    gaugeColor = 'stroke-[#D4AF37]';
    textColor = 'text-[#D4AF37]';
    labelText = "Growth Tier: Building Trust";
  }

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-8 shadow-lg flex flex-col h-full relative max-w-sm mx-auto w-full transition-all duration-300">
      
      {/* Score Insights Panel (Absolute) */}
      <div className="absolute -left-[240px] top-10 w-[200px] hidden xl:block bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-4">Score Insights</h4>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Rank</p>
            <p className="text-sm font-bold text-[#D4AF37]">Top 12% in India</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Score Variance</p>
            <p className="text-sm font-bold text-slate-200">Low</p>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">{profile?.name || "Ramesh Kumar"}</h2>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">did:india:worker:ramesh-kumar-9872</p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {(profile?.platforms || fallbackPlatforms).map((p, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-[#0F172A] rounded-full border border-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50">
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">
                {p.name} ★{p.rating} ({p.tenure_months} mos)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center justify-center pt-2 pb-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className={`w-full h-full transform -rotate-90`} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1E293B" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="45" fill="transparent" strokeWidth="8" strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${gaugeColor}`}
              style={{ strokeDasharray, strokeDashoffset }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${textColor}`}>{criScore}</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1">CRI SCORE</span>
          </div>
        </div>
        <div className="mt-3 px-3 py-1 bg-[#0F172A] border border-slate-700 rounded-full shadow-sm">
          <span className={`text-[10px] font-bold ${textColor} tracking-widest uppercase`}>
            {labelText}
          </span>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div 
        className="relative group cursor-pointer"
        onClick={() => setShowTelemetryDrawer(true)}
      >
        <div className="relative grid grid-cols-3 gap-2 bg-[#0F172A] rounded-xl p-1 border border-slate-700 hover:border-[#D4AF37]/50 transition-all">
          <div className="bg-[#1E293B] rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Inflow</p>
            <p className="text-sm font-bold text-slate-200">₹{((profile?.avg_monthly_inflow || 49066)/1000).toFixed(1)}k</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Consist.</p>
            <p className="text-sm font-bold text-slate-200">{((profile?.consistency_rate || 0.935) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Stable</p>
            <p className="text-sm font-bold text-slate-200">100%</p>
            <p className="text-[8px] text-slate-500 mt-0.5">180d</p>
          </div>
        </div>
      </div>

      {/* Credential Issuance */}
      <div className="pt-2 space-y-4 mt-auto">
        <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-xl border border-slate-700 shadow-inner">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Selective Disclosure</span>
            <span className="text-[10px] text-stone-500">
              {selectiveDisclosure ? "Full 180-day history" : "Baseline score only"}
            </span>
          </div>
          <button
            onClick={() => setSelectiveDisclosure(!selectiveDisclosure)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectiveDisclosure ? 'bg-amber-600' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${selectiveDisclosure ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>

        {!issuedVc ? (
          <button
            onClick={handleIssue}
            className="w-full py-4 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Issue Cryptographic Credential
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-[#0F172A] border border-slate-700 rounded-xl overflow-hidden relative shadow-md transition-all duration-300">
              <div className="bg-[#1E293B] border-b border-slate-700 px-3 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] font-mono text-[#D4AF37] ml-2 tracking-widest uppercase opacity-80">VC_Generated</p>
              </div>
              <div className="p-3">
                <textarea
                  readOnly
                  value={issuedVc}
                  className="w-full h-24 bg-transparent text-[10px] font-mono text-[#D4AF37] resize-none outline-none no-scrollbar mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs font-semibold transition-all duration-300 flex justify-center items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Payload
                  </button>
                  <button
                    onClick={() => setShowQr(true)}
                    className="flex-1 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs font-semibold transition-all duration-300 flex justify-center items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" /> View Credential QR
                  </button>
                </div>
              </div>
            </div>

            {showQr && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-sm p-4">
                <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center">
                  <button
                    onClick={() => setShowQr(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#0F172A] hover:bg-slate-700 rounded-full transition-colors border border-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold text-white mb-2">Credential QR</h3>
                  <p className="text-xs text-slate-400 text-center mb-6">Scan this QR code from the Lender Desk to securely transfer your verifiable credential.</p>
                  <div className="p-4 bg-white rounded-2xl flex justify-center items-center w-full max-w-[200px] aspect-square shadow-sm">
                    <QRCode value={issuedVc} size={160} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                  </div>
                  
                  <button 
                    onClick={() => setShowQr(false)}
                    className="w-full mt-6 py-3 bg-[#0F172A] hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-all border border-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Telemetry Modal */}
      {showTelemetryDrawer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B1325] border border-amber-900/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative flex flex-col">
            <button 
              onClick={() => setShowTelemetryDrawer(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-400 bg-[#02050D]/50 hover:bg-[#02050D] border border-amber-900/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">180-Day Cash Flow Telemetry Deep-Dive</h3>
            <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest mb-6">Verified Income History</p>
            
            <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar pb-4">
              {/* Platform Split */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Platform Contribution</h4>
                <div className="space-y-2">
                  <div className="bg-[#02050D] rounded-xl p-3 border border-amber-900/30 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Swiggy <span className="text-stone-500 font-normal ml-1">(14 months active)</span></p>
                      <p className="text-[10px] text-stone-400 mt-0.5">58% share of inflow</p>
                    </div>
                    <p className="text-sm font-bold text-amber-400">₹28,400<span className="text-[10px] text-stone-500 font-normal">/mo</span></p>
                  </div>
                  <div className="bg-[#02050D] rounded-xl p-3 border border-amber-900/30 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Uber <span className="text-stone-500 font-normal ml-1">(22 months active)</span></p>
                      <p className="text-[10px] text-stone-400 mt-0.5">42% share of inflow</p>
                    </div>
                    <p className="text-sm font-bold text-amber-400">₹20,700<span className="text-[10px] text-stone-500 font-normal">/mo</span></p>
                  </div>
                </div>
              </div>

              {/* 6-Month Table */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">6-Month Inflow Stability</h4>
                <div className="bg-[#02050D] rounded-xl border border-amber-900/30 overflow-hidden text-xs">
                  {[
                    { m: "Month 1", v: "₹48,200", s: "42 shifts" },
                    { m: "Month 2", v: "₹49,800", s: "44 shifts" },
                    { m: "Month 3", v: "₹51,100", s: "46 shifts" },
                    { m: "Month 4", v: "₹47,900", s: "41 shifts" },
                    { m: "Month 5", v: "₹49,400", s: "43 shifts" },
                    { m: "Month 6", v: "₹49,066", s: "43 shifts" }
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between p-2.5 ${i !== 5 ? 'border-b border-amber-900/20' : ''}`}>
                      <span className="text-stone-400">{row.m}</span>
                      <div className="text-right">
                        <span className="font-bold text-slate-200 block">{row.v}</span>
                        <span className="text-[10px] text-stone-500">{row.s}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volatility */}
              <div className="bg-[#02050D] border border-amber-900/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Volatility Score</p>
                  <p className="text-[10px] text-stone-300 mt-0.5">"Prime Resilient Stability"</p>
                </div>
                <div className="text-sm font-bold text-amber-400">&lt; 4.8%</div>
              </div>
            </div>

            <button 
              onClick={() => setShowTelemetryDrawer(false)}
              className="mt-4 w-full py-3 bg-[#02050D] border border-amber-900/30 hover:bg-[#02050D]/50 hover:border-amber-700/50 text-slate-200 rounded-xl font-bold text-sm transition-all"
            >
              Close Telemetry Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
