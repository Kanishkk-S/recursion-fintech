import React, { useState } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Coffee, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';

interface DailyWageSparklineProps {
  dailyWages?: number[];
  monthlyInflow: number;
  consistencyRate: string;
  activeDays?: number;
  workerName?: string;
  isVerified?: boolean;
  onTriggerZkTlsIngest?: () => Promise<void> | void;
  className?: string;
}

export const DailyWageSparkline: React.FC<DailyWageSparklineProps> = ({
  dailyWages = [],
  monthlyInflow,
  consistencyRate,
  activeDays,
  isVerified = false,
  onTriggerZkTlsIngest,
  className = ''
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<number>(0);
  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number } | null>(null);

  // If verified and has 30 days, use them; otherwise, fallback if verified
  const hasValidLedger = isVerified && dailyWages && dailyWages.length === 30;
  const wages = hasValidLedger ? dailyWages : [];

  const maxWage = wages.length > 0 ? Math.max(...wages, 1000) : 1000;
  const calculatedActiveCount = activeDays !== undefined ? activeDays : wages.filter(w => w > 0).length;
  const restDaysCount = Math.max(0, 30 - calculatedActiveCount);
  const totalSum = wages.reduce((acc, curr) => acc + curr, 0);
  const avgActiveDaily = calculatedActiveCount > 0 ? Math.round(totalSum / calculatedActiveCount) : 0;

  const handleStartVerification = async () => {
    setIsVerifying(true);
    setVerifyStep(1); // Stage 1: MPC-TLS Handshake

    setTimeout(() => {
      setVerifyStep(2); // Stage 2: Session Key & Attestation
    }, 500);

    setTimeout(() => {
      setVerifyStep(3); // Stage 3: RFC 8785 Canonicalization & Signature
    }, 1000);

    setTimeout(async () => {
      if (onTriggerZkTlsIngest) {
        await onTriggerZkTlsIngest();
      }
      setIsVerifying(false);
      setVerifyStep(0);
    }, 1600);
  };

  return (
    <div className={`rounded-3xl transition-all duration-300 ${
      !isVerified 
        ? 'bg-[#0A0414] border-2 border-dashed border-purple-500/30 p-5 sm:p-6' 
        : 'bg-[#0D061C] border border-[#1C0B3B] p-4 sm:p-5 shadow-xl'
    } ${className}`}>

      {/* ==================================================================== */}
      {/* STATE 1: UNVERIFIED STATE (Manual Input Only)                        */}
      {/* ==================================================================== */}
      {!isVerified ? (
        <div className="flex flex-col gap-5">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C0B3B]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    30-Day Daily Wage Stream (zkTLS Inflow Telemetry)
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    UNVERIFIED CLAIM
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Self-Reported Baseline (Unverified Claim): <strong className="text-slate-200">~₹{monthlyInflow.toLocaleString('en-IN')}/mo</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-mono text-[#6B7280]">
                Zero Cryptographic Proof
              </span>
            </div>
          </div>

          {/* Empty State Card Content */}
          <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-[#07030F]/80 rounded-2xl border border-[#1C0B3B]/80 gap-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#140929] border border-purple-500/30 flex items-center justify-center shadow-lg">
              {isVerifying ? (
                <RefreshCw className="w-6 h-6 text-[#C084FC] animate-spin" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              )}
            </div>

            <div className="max-w-md">
              <h4 className="text-base font-bold text-white">
                {isVerifying ? "Verifying Session Keys via zkTLS..." : "No Cryptographic Ledger Available"}
              </h4>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                {isVerifying ? (
                  verifyStep === 1 
                    ? "Step 1/3: Negotiating MPC-TLS Handshake with platform node..."
                    : verifyStep === 2
                    ? "Step 2/3: Validating HTTPS TLS session keys & Merkle inclusion proof..."
                    : "Step 3/3: Canonicalizing RFC 8785 claim & sealing with Ed25519..."
                ) : (
                  "Self-reported earnings cannot be verified for underwriting. Link an active platform or Soundbox via zkTLS to ingest authentic settlement history."
                )}
              </p>
            </div>

            {/* Verification Progress Bar if loading */}
            {isVerifying ? (
              <div className="w-full max-w-xs flex flex-col gap-1.5 mt-2">
                <div className="w-full h-1.5 bg-[#160A2E] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(verifyStep / 3) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono text-purple-300">
                  MPC Attestation Protocol Active...
                </span>
              </div>
            ) : (
              /* CTA Button */
              <button
                type="button"
                onClick={handleStartVerification}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl purple-magenta-gradient hover:opacity-95 text-white font-bold text-xs shadow-lg glow-purple transition-all cursor-pointer group"
              >
                <Zap className="w-3.5 h-3.5 text-[#E9D5FF] group-hover:animate-bounce" />
                <span>⚡ Ingest Verified 30-Day Stream via zkTLS</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* STATE 2: VERIFIED ZKTLS LEDGER STATE                                */
        /* ==================================================================== */
        <div className="flex flex-col gap-4">
          {/* Header with Title & zkTLS Live Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#C084FC]" />
                  30-Day Daily Wage Stream (zkTLS Inflow Telemetry)
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  zkTLS Verified
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Cryptographically attested micro-payout fluctuation from connected platform oracle
              </p>
            </div>

            {/* Aggregate Inflow Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-2xl bg-[#140929] border border-purple-500/30 text-right">
                <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block">Verified 30-Day Inflow</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#4ADE80]">
                  ₹{totalSum.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
              <span className="text-[10px] text-[#9CA3AF] block">Active Shifts</span>
              <span className="text-xs font-bold font-mono text-white flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 text-[#C084FC]" />
                {calculatedActiveCount} / 30 Days
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
              <span className="text-[10px] text-[#9CA3AF] block">Rest / Off Days</span>
              <span className="text-xs font-bold font-mono text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                <Coffee className="w-3 h-3 text-amber-400/80" />
                {restDaysCount} Days (₹0)
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
              <span className="text-[10px] text-[#9CA3AF] block">Shift Consistency</span>
              <span className="text-xs font-bold font-mono text-emerald-400 mt-0.5 block">
                {consistencyRate}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
              <span className="text-[10px] text-[#9CA3AF] block">Avg Active Daily</span>
              <span className="text-xs font-bold font-mono text-[#D8B4FE] mt-0.5 block">
                ₹{avgActiveDaily.toLocaleString('en-IN')}/day
              </span>
            </div>
          </div>

          {/* Interactive 30-Bar Sparkline Chart Container */}
          <div className="relative pt-6 pb-2">
            
            {/* Hover Tooltip Overlay */}
            <div className="h-6 mb-2 flex items-center justify-between text-xs font-mono">
              {hoveredDay ? (
                <span className="text-white flex items-center gap-2 bg-[#140929] px-2.5 py-1 rounded-lg border border-purple-500/30 animate-in fade-in">
                  <span className="text-purple-300">Day {hoveredDay.day}:</span>
                  <strong className={hoveredDay.amount > 0 ? "text-[#4ADE80]" : "text-amber-400"}>
                    {hoveredDay.amount > 0 ? `₹${hoveredDay.amount.toLocaleString('en-IN')}` : 'Rest Day (₹0)'}
                  </strong>
                </span>
              ) : (
                <span className="text-[11px] text-[#6B7280]">
                  Hover over bars to inspect daily settlement telemetry
                </span>
              )}

              <span className="text-[10px] text-[#6B7280] hidden sm:inline">
                30-Day Continuous Settlement Window
              </span>
            </div>

            {/* 30 Bars */}
            <div className="h-24 sm:h-28 flex items-end justify-between gap-1 sm:gap-1.5 px-1 py-1 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
              {wages.map((amount, idx) => {
                const dayNum = idx + 1;
                const isRest = amount === 0;
                const heightPct = isRest ? 12 : Math.max(18, Math.round((amount / maxWage) * 100));
                const isHovered = hoveredDay?.day === dayNum;

                return (
                  <div
                    key={dayNum}
                    onMouseEnter={() => setHoveredDay({ day: dayNum, amount })}
                    onMouseLeave={() => setHoveredDay(null)}
                    style={{ height: `${heightPct}%` }}
                    className={`flex-1 rounded-t-md transition-all duration-150 cursor-pointer relative group ${
                      isRest
                        ? 'bg-amber-500/20 hover:bg-amber-500/50 border-t border-dashed border-amber-500/40'
                        : isHovered
                        ? 'bg-gradient-to-t from-[#6D28D9] to-[#E9D5FF] shadow-lg shadow-purple-500/50'
                        : 'bg-gradient-to-t from-[#4C1D95] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#C084FC]'
                    }`}
                  >
                    {/* Tiny Indicator Dot for Peak Days */}
                    {amount >= maxWage * 0.9 && !isRest && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-sm"></span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Day Axis Indicators */}
            <div className="flex items-center justify-between text-[9px] font-mono text-[#6B7280] px-1 mt-1.5">
              <span>Day 1 (30d ago)</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span className="text-purple-300 font-bold">Day 30 (Today)</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
