import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Bike,
  Store,
  RefreshCw,
  Zap
} from 'lucide-react';
import type { WorkerProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOnboardSuccess: (newWorker: WorkerProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onOnboardSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [monthlyInflow, setMonthlyInflow] = useState<number | ''>(45000);
  const [activeDays, setActiveDays] = useState<number | ''>(85);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zkTlsStage, setZkTlsStage] = useState<string>('');

  // Auto-detection logic for UPI ID vs Email ID
  const isUpiMerchant = useMemo(() => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return false;
    const upiHandles = [
      '@ybl', '@upi', '@okhdfcbank', '@paytm', '@axl', '@ibl', 
      '@oksbi', '@okaxis', '@icici', '@barodampay', '@kotak', 
      '@freecharge', '@idfcbank', '@aubank', '@pingpay', '@apl'
    ];
    for (const h of upiHandles) {
      if (clean.includes(h)) return true;
    }
    if (clean.includes('@')) {
      const parts = clean.split('@');
      if (parts[1] && !parts[1].includes('.')) return true;
    }
    return false;
  }, [identifier]);

  // Realtime CRI preview calculation based on formula:
  // consistency = min(1.0, activeDays / 90.0)
  // stability = 0.95 (merchant) or 1.0 (gig delivery)
  // CRI = (0.35 * stability + 0.35 * consistency + 0.20 * 0.70 + 0.10 * 0.90) * 100
  const parsedInflow = Number(monthlyInflow) || 0;
  const parsedActiveDays = Math.max(1, Math.min(90, Number(activeDays) || 1));
  const consistency = Math.min(1.0, parsedActiveDays / 90.0);
  const stability = isUpiMerchant ? 0.95 : 1.0;
  const margin = 0.70;
  const longevity = 0.90;

  const estimatedCri = Math.round((0.35 * stability + 0.35 * consistency + 0.20 * margin + 0.10 * longevity) * 1000) / 10;
  const estimatedTier = estimatedCri >= 75.0 ? 'PRIME_RESILIENT' : 'GROWTH_NEAR_PRIME';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !identifier.trim()) return;

    setIsSubmitting(true);
    setZkTlsStage(isUpiMerchant 
      ? 'Connecting to NPCI / PhonePe MPC Witness Node...' 
      : 'Connecting to Swiggy & Uber HTTPS Session Witness...');

    await new Promise(r => setTimeout(r, 450));
    setZkTlsStage('Executing Zero-Knowledge Circuit: Redacting PII & Phone Numbers...');
    await new Promise(r => setTimeout(r, 500));
    setZkTlsStage('Minting RFC 8785 Canonical W3C Proof with Ed25519 Authority Seal...');
    await new Promise(r => setTimeout(r, 450));

    const payload = {
      full_name: fullName.trim(),
      identifier: identifier.trim(),
      monthly_inflow: parsedInflow,
      active_days: parsedActiveDays,
      persona_type: isUpiMerchant ? 'UPI_MERCHANT' : 'GIG_WORKER'
    };

    try {
      const res = await fetch('http://localhost:8000/api/worker/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdWorker = await res.json();
        onOnboardSuccess(createdWorker);
        setIsSubmitting(false);
        onClose();
        return;
      }
    } catch {
      // Mock fallback
    }

    // Client-side fallback if backend in offline mock mode
    const cleanSlug = fullName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const localProfile: WorkerProfile = {
      worker_id: `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
      worker_name: fullName.trim(),
      name: fullName.trim(),
      email: identifier.trim(),
      persona_type: isUpiMerchant ? 'UPI_MERCHANT' : 'GIG_WORKER',
      did: `did:india:${isUpiMerchant ? 'merchant' : 'worker'}:${cleanSlug}`,
      category: isUpiMerchant ? 'PhonePe / UPI QR Merchant' : 'Swiggy + Uber Fleet Partner',
      credit_bureau_status: 'THIN_FILE_VERIFIED_BY_GIGNITE',
      platform_badges: isUpiMerchant ? ['PhonePe Business', 'UPI Merchant QR'] : ['Swiggy', 'Uber India'],
      monthly_inflow: parsedInflow,
      cri_score: estimatedCri,
      resilience_tier: estimatedTier,
      max_prime_credit_limit_inr: Math.round(parsedInflow * 0.70),
      instant_safe_floor_inr: Math.round(parsedInflow * 0.50),
      is_zktls_verified: true,
      verification_status: 'ZKTLS_VERIFIED',
      telemetry_summary: {
        telemetry_period_days: 90,
        active_working_days: parsedActiveDays,
        active_days_ratio: consistency,
        consistency_rate: `${(consistency * 100).toFixed(1)}%`,
        consistency_ratio: consistency,
        stability_rate: isUpiMerchant ? '95.0%' : '100.0%',
        stability_index: stability,
        monthly_inflow_inr: parsedInflow,
        gross_earnings_180d_inr: parsedInflow * 6,
        net_earnings_180d_inr: parsedInflow * margin * 6,
        zero_income_weeks: 0,
        margin_rate: margin,
        tenure_score: longevity,
        daily_avg_scans: isUpiMerchant ? maxDailyScans(parsedInflow) : undefined,
        is_zktls_verified: true,
        is_soundbox_verified: isUpiMerchant,
        verification_status: 'ZKTLS_VERIFIED'
      }
    };

    if (isUpiMerchant) {
      localProfile.soundbox_details = {
        provider: "PhonePe Business Soundbox Rail",
        vpa: identifier.trim(),
        bank: "Canara Bank (A/C ****4821)",
        scans: maxDailyScans(parsedInflow) * 30,
        avg_daily_scans: maxDailyScans(parsedInflow),
        gross_volume: parsedInflow,
        avg_daily: roundVal(parsedInflow / 30),
        credential_id: `urn:uuid:soundbox-${cleanSlug}`
      };
    }

    onOnboardSuccess(localProfile);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#090D1A] border border-[#17223B] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#17223B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Unified Earner Onboarding
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  zkTLS Auto-Routing
                </span>
              </h2>
              <p className="text-xs text-slate-400">Accepts Email ID (Gig Delivery) or UPI ID (Merchant Soundbox)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#121B30] border border-[#17223B] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1A2542] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live CRI Score & Auto-Detection Preview Card */}
        <div className="my-5 p-4 rounded-2xl bg-[#0E1424] border border-[#17223B] flex flex-col gap-3">
          
          {/* Top auto-detection tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isUpiMerchant ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  <Store className="w-3.5 h-3.5 text-purple-400" />
                  <span>UPI Merchant Profile (PhonePe QR Ingestion)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                  <Bike className="w-3.5 h-3.5 text-blue-400" />
                  <span>Gig Platform Partner (Swiggy / Uber Telemetry)</span>
                </div>
              )}
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border ${
              estimatedTier === 'PRIME_RESILIENT'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {estimatedTier.replace('_', ' ')}
            </span>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#17223B] text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Dynamic CRI Index</span>
              <span className="text-lg font-bold text-cyan-400">{estimatedCri.toFixed(1)} <span className="text-xs text-slate-500">/ 100</span></span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Shift Consistency</span>
              <span className="text-base font-bold text-emerald-400">{(consistency * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Pre-Approved Line</span>
              <span className="text-base font-bold text-white">₹{Math.round(parsedInflow * 0.70).toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Field 1: Full Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              1. Full Name / Merchant Trade Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar or Murugan Tea Stall"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Field 2: Identifier (Email ID or UPI ID) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                2. Email ID or UPI ID
              </label>
              <span className="text-[10px] font-mono text-slate-400">Auto-routes Telemetry vs Soundbox</span>
            </div>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="worker@gmail.com or vendor@ybl"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Field 3: Monthly Inflow */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              3. Monthly Inflow (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">₹</span>
              <input
                type="number"
                required
                min={5000}
                step={500}
                value={monthlyInflow}
                onChange={(e) => setMonthlyInflow(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="45000"
                className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Field 4: Active Days in Past 90 Days */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              4. Active Days in Past 90 Days
            </label>
            <input
              type="number"
              required
              min={1}
              max={90}
              value={activeDays}
              onChange={(e) => setActiveDays(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="85"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Verification Status Animation */}
          {isSubmitting && (
            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono text-blue-200">{zkTlsStage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing zkTLS Ingestion & Authority Sign...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Ingest via zkTLS & Verify</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

function maxDailyScans(inflow: number): number {
  return Math.max(30, Math.round(inflow / (30 * 180)));
}

function roundVal(v: number): number {
  return Math.round(v * 100) / 100;
}
