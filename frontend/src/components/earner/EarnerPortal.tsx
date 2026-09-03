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
  
  if (!profile) return null;
  
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

  const criScore = profile.cri_score;
  const strokeDasharray = 283;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * criScore) / 100;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col relative max-w-sm mx-auto w-full backdrop-blur-xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
        <p className="text-xs text-slate-400 font-mono">did:india:worker:ramesh-kumar-9872</p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {profile.platforms.map((p, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
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
          <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1E293B" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="45" fill="transparent" stroke="#10B981" strokeWidth="8" strokeLinecap="round"
              className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ strokeDasharray, strokeDashoffset }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{criScore}</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider">CRI SCORE</span>
          </div>
        </div>
        <div className="mt-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
            {profile.resilience_tier.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Inflow</p>
          <p className="text-sm font-bold text-white">₹{(profile.avg_monthly_inflow/1000).toFixed(1)}k</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Consist.</p>
          <p className="text-sm font-bold text-white">{(profile.consistency_rate * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
          <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Stable</p>
          <p className="text-sm font-bold text-white">100%</p>
          <p className="text-[8px] text-slate-500">180d</p>
        </div>
      </div>

      {/* Credential Issuance */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Selective Disclosure</span>
            <span className="text-[10px] text-slate-400">
              {selectiveDisclosure ? "Full 180-day history" : "Baseline score only"}
            </span>
          </div>
          <button 
            onClick={() => setSelectiveDisclosure(!selectiveDisclosure)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectiveDisclosure ? 'bg-emerald-500' : 'bg-slate-600'}`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${selectiveDisclosure ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>

        {!issuedVc ? (
          <button 
            onClick={handleIssue}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Issue Cryptographic Credential
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 relative group">
              <p className="text-[10px] font-mono text-emerald-400 mb-2">Issue Success: VC Generated</p>
              <textarea 
                readOnly
                value={issuedVc}
                className="w-full h-24 bg-transparent text-[10px] font-mono text-slate-400 resize-none outline-none no-scrollbar mb-3"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex justify-center items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Payload
                </button>
                <button 
                  onClick={() => setShowQr(true)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex justify-center items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" /> View Credential QR
                </button>
              </div>
            </div>
            
            {showQr && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center">
                  <button 
                    onClick={() => setShowQr(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold text-white mb-2">Credential QR</h3>
                  <p className="text-xs text-slate-400 text-center mb-6">Scan this QR code from the Lender Desk to securely transfer your verifiable credential.</p>
                  <div className="p-4 bg-white rounded-2xl flex justify-center items-center w-full max-w-[200px] aspect-square">
                     <QRCode value={issuedVc} size={160} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
