import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Radio, 
  ArrowRight, 
  QrCode
} from 'lucide-react';

interface SoundboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
  onApplyCredential: (data: {
    totalInflow: number;
    criScore: number;
    scans: number;
    avgDaily: number;
    credentialId: string;
  }) => void;
}

const TERMINAL_STEPS: string[] = [
  "Connecting to business.phonepe.com:443 via TLS 1.3 MPC witness...",
  "Applying Zero-Knowledge circuit: Redacting 1,120 customer phone numbers & UPI IDs...",
  "Extracted 30-day settlement aggregate: ₹43,500 gross volume across 1,120 settled scans (avg ₹1,450/day)...",
  "Canonicalizing JSON (RFC 8785) & sealing with Worker Ed25519 DID..."
];

export const SoundboxModal: React.FC<SoundboxModalProps> = ({
  isOpen,
  onClose,
  workerName,
  onApplyCredential
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsCompleted(false);
      return;
    }

    // Automated 4-stage terminal sequence with 400ms delay per step
    const t1 = setTimeout(() => setCurrentStep(1), 350);
    const t2 = setTimeout(() => setCurrentStep(2), 800);
    const t3 = setTimeout(() => setCurrentStep(3), 1300);
    const t4 = setTimeout(() => {
      setCurrentStep(4);
      setIsCompleted(true);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyCredential({
      totalInflow: 43500,
      criScore: 84.2,
      scans: 1120,
      avgDaily: 1450,
      credentialId: "urn:uuid:VC-SOUNDBOX-4401"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D061C] border border-purple-500/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -mt-10"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#140929] border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-950/50 shrink-0">
              <Volume2 className="w-6 h-6 text-[#C084FC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Merchant Soundbox zkTLS Ingestion</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-[#D8B4FE] border border-purple-500/25 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  Live Oracle
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                PhonePe & Paytm POS Voice Box • Zero-Knowledge Session Attestation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#140929] border border-[#1C0B3B] text-[#9CA3AF] hover:text-white hover:border-purple-500/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Merchant & Node Verification Banner */}
        <div className="p-3 rounded-2xl bg-[#07030F] border border-[#1C0B3B] flex items-center justify-between text-xs relative z-10">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#C084FC]" />
            <span className="text-[#9CA3AF]">Merchant Entity:</span>
            <strong className="text-white font-mono">{workerName}</strong>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            T+0 Auto-Settled
          </span>
        </div>

        {/* Monospace Terminal Box with Progressive Logs */}
        <div className="bg-[#07030F] border border-[#1C0B3B] rounded-2xl p-4 font-mono text-xs flex flex-col gap-2.5 shadow-inner relative z-10 min-h-[190px]">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C0B3B]/80 text-[10px] text-[#6B7280]">
            <span>MPC-TLS WITNESS CLIENT v2.4</span>
            <span>PORT 443 / ENCLAVE ACTIVE</span>
          </div>

          <div className="flex flex-col gap-2">
            {TERMINAL_STEPS.map((stepText, idx) => {
              const isStepDone = currentStep > idx + 1 || (currentStep === 4 && isCompleted);
              const isStepCurrent = currentStep === idx + 1 && !isCompleted;
              const isStepWaiting = currentStep < idx + 1;

              if (isStepWaiting) return null;

              return (
                <div key={idx} className="flex items-start gap-2 animate-in fade-in duration-200">
                  <div className="mt-0.5 shrink-0">
                    {isStepDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : isStepCurrent ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#C084FC] animate-spin" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700 block"></span>
                    )}
                  </div>
                  <span className={`text-[11px] leading-relaxed ${
                    isStepDone ? 'text-emerald-300' : 'text-[#C084FC] font-semibold'
                  }`}>
                    [{idx + 1}] {stepText}
                  </span>
                </div>
              );
            })}
          </div>

          {!isCompleted && (
            <div className="pt-2 mt-auto flex items-center gap-2 text-[10px] text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
              <span>Witnessing zero-knowledge session key generation...</span>
            </div>
          )}
        </div>

        {/* Completion Success Banner */}
        {isCompleted && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  W3C Verifiable Credential Issued (VC-SOUNDBOX-4401)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                1,120 Scans
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-emerald-500/20">
              <div>
                <span className="text-[#9CA3AF] block text-[10px]">Attested Inflow:</span>
                <span className="font-bold text-emerald-400 text-sm">₹43,500 / month</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block text-[10px]">Calculated CRI Score:</span>
                <span className="font-bold text-purple-300 text-sm">84.2 (Prime Resilient)</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#140929] border border-[#1C0B3B] text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!isCompleted}
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl purple-magenta-gradient hover:opacity-95 text-white text-xs font-bold shadow-lg glow-purple transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Apply to Worker Wallet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
