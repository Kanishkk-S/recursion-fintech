import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Bike,
  Store,
  RefreshCw
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
  const [workerId, setWorkerId] = useState('');
  const [personaType, setPersonaType] = useState<'GIG_WORKER' | 'UPI_MERCHANT'>('GIG_WORKER');
  const [sourceName, setSourceName] = useState('Swiggy');
  const [monthlyInflow, setMonthlyInflow] = useState<number>(45000);
  const [activeDays, setActiveDays] = useState<number>(85);
  const [totalDays, setTotalDays] = useState<number>(90);
  const [marginRate, setMarginRate] = useState<number>(70);
  const [tenureScore, setTenureScore] = useState<number>(85);
  const [dailyScans, setDailyScans] = useState<number>(145);
  const [rating, setRating] = useState<number>(4.88);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zkTlsStage, setZkTlsStage] = useState<string>('');

  if (!isOpen) return null;

  // Realtime CRI preview calculation
  const consistency = Math.min(1.0, activeDays / Math.max(1, totalDays));
  const stability = 0.95;
  const margin = marginRate / 100;
  const longevity = tenureScore / 100;
  const estimatedCri = Math.round((0.35 * stability + 0.35 * consistency + 0.20 * margin + 0.10 * longevity) * 1000) / 10;
  const estimatedTier = estimatedCri >= 75 ? 'PRIME_RESILIENT' : estimatedCri >= 60 ? 'GROWTH_NEAR_PRIME' : 'VULNERABLE';

  const handlePersonaChange = (type: 'GIG_WORKER' | 'UPI_MERCHANT') => {
    setPersonaType(type);
    if (type === 'UPI_MERCHANT') {
      setSourceName('PhonePe Business');
      if (!fullName) setFullName('Murugan Tea Stall');
    } else {
      setSourceName('Swiggy');
      if (!fullName) setFullName('Ramesh Kumar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    setZkTlsStage('Connecting to MPC-TLS Witness Rail...');

    await new Promise(r => setTimeout(r, 400));
    setZkTlsStage('Executing Zero-Knowledge Redaction on PII...');
    await new Promise(r => setTimeout(r, 450));
    setZkTlsStage('Minting RFC 8785 Ed25519 Canonical Identity Seal...');
    await new Promise(r => setTimeout(r, 400));

    const payload = {
      full_name: fullName.trim(),
      worker_id: workerId.trim() || undefined,
      persona_type: personaType,
      source_name: sourceName,
      monthly_inflow: monthlyInflow,
      active_days: activeDays,
      total_window_days: totalDays,
      margin_rate: margin,
      tenure_score: longevity,
      stability: stability,
      daily_avg_scans: personaType === 'UPI_MERCHANT' ? dailyScans : undefined,
      rating: personaType === 'GIG_WORKER' ? rating : undefined
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
      // Fallback local synthetic profile if backend is in mock mode
    }

    const cleanSlug = fullName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const localProfile: WorkerProfile = {
      worker_id: workerId.trim() || `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
      worker_name: fullName.trim(),
      name: fullName.trim(),
      email: `${cleanSlug}@gignite.network`,
      persona_type: personaType,
      did: `did:india:${personaType === 'UPI_MERCHANT' ? 'merchant' : 'worker'}:${cleanSlug}`,
      category: personaType === 'UPI_MERCHANT' ? `${sourceName} QR Merchant` : `${sourceName} Fleet Partner`,
      credit_bureau_status: 'THIN_FILE_VERIFIED_BY_GIGNITE',
      platform_badges: [sourceName],
      monthly_inflow: monthlyInflow,
      cri_score: estimatedCri,
      resilience_tier: estimatedTier,
      max_prime_credit_limit_inr: Math.round(monthlyInflow * 0.70),
      instant_safe_floor_inr: Math.round(monthlyInflow * 0.50),
      is_zktls_verified: true,
      verification_status: 'ZKTLS_VERIFIED',
      telemetry_summary: {
        telemetry_period_days: totalDays,
        active_working_days: activeDays,
        active_days_ratio: consistency,
        consistency_rate: `${(consistency * 100).toFixed(1)}%`,
        consistency_ratio: consistency,
        stability_rate: '95.0%',
        stability_index: 0.95,
        monthly_inflow_inr: monthlyInflow,
        gross_earnings_180d_inr: monthlyInflow * 6,
        net_earnings_180d_inr: monthlyInflow * margin * 6,
        zero_income_weeks: 0,
        margin_rate: margin,
        tenure_score: longevity,
        daily_avg_scans: personaType === 'UPI_MERCHANT' ? dailyScans : undefined,
        is_zktls_verified: true,
        verification_status: 'ZKTLS_VERIFIED'
      }
    };

    onOnboardSuccess(localProfile);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#090D1A] border border-[#17223B] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#17223B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Onboard New Earner
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  zkTLS MPC
                </span>
              </h2>
              <p className="text-xs text-slate-400">Mint Verifiable Financial Identity for Gig Workers & UPI Merchants</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#121B30] border border-[#17223B] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1A2542] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live CRI Score Banner */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-[#0E1424] to-[#121B30] border border-blue-500/25 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Calculated CRI Index
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold font-mono text-cyan-400">
                {estimatedCri.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                estimatedTier === 'PRIME_RESILIENT'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {estimatedTier.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="text-right text-xs font-mono">
            <span className="text-slate-400 block text-[10px]">Pre-Approved Credit Line</span>
            <span className="text-sm font-bold text-emerald-400">
              ₹{Math.round(monthlyInflow * 0.70).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Persona Type Radio Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Persona Domain</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePersonaChange('GIG_WORKER')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                  personaType === 'GIG_WORKER'
                    ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500 text-white shadow-md'
                    : 'bg-[#0E1424] border-[#17223B] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  personaType === 'GIG_WORKER' ? 'bg-blue-600 text-white' : 'bg-[#121B30] text-slate-400'
                }`}>
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Gig Worker</span>
                  <span className="text-[10px] text-slate-400">Swiggy, Zomato, Uber, Zepto</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaChange('UPI_MERCHANT')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                  personaType === 'UPI_MERCHANT'
                    ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-indigo-500 text-white shadow-md'
                    : 'bg-[#0E1424] border-[#17223B] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  personaType === 'UPI_MERCHANT' ? 'bg-indigo-600 text-white' : 'bg-[#121B30] text-slate-400'
                }`}>
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">UPI Merchant</span>
                  <span className="text-[10px] text-slate-400">PhonePe, Paytm, BHIM QR</span>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name & Custom ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Name / Business Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={personaType === 'UPI_MERCHANT' ? 'e.g. Murugan Tea Stall' : 'e.g. Ramesh Kumar'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Earner Identifier (Optional)
              </label>
              <input
                type="text"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                placeholder="e.g. murugan-tea-4821"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Platform, Scans/Rating & Monthly Inflow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Ingested Platform / Rail
              </label>
              <input
                type="text"
                required
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. PhonePe Business or Swiggy"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {personaType === 'UPI_MERCHANT' ? 'Daily Scans Avg' : 'Platform Rating'}
              </label>
              {personaType === 'UPI_MERCHANT' ? (
                <input
                  type="number"
                  min={1}
                  value={dailyScans}
                  onChange={(e) => setDailyScans(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              ) : (
                <input
                  type="number"
                  step={0.01}
                  min={3.0}
                  max={5.0}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Monthly Inflow (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">₹</span>
                <input
                  type="number"
                  required
                  min={5000}
                  step={500}
                  value={monthlyInflow}
                  onChange={(e) => setMonthlyInflow(Number(e.target.value))}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Active Days / Window & Margin & Tenure */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Active Days
              </label>
              <input
                type="number"
                min={1}
                max={totalDays}
                value={activeDays}
                onChange={(e) => setActiveDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Window Days
              </label>
              <input
                type="number"
                min={30}
                max={365}
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Margin ({marginRate}%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={marginRate}
                onChange={(e) => setMarginRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Tenure ({tenureScore}%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={tenureScore}
                onChange={(e) => setTenureScore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1424] border border-[#17223B] text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
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
                <span>Simulating zkTLS Ingestion & Authority Sign...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Simulate zkTLS Ingestion & Onboard</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
