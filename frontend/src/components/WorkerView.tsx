import React, { useState } from 'react';
import {
  Lock,
  Fingerprint,
  Bike,
  Car,
  TrendingUp,
  Activity,
  Calendar,
  Wallet,
  Copy,
  Check,
  Share2,
  FileCode2,
  Sparkles,
  ArrowRight,
  X,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  UserCheck,
  ShoppingBag
} from 'lucide-react';
import type { WorkerProfile, W3CCredential } from '../types';
import { WORKER_PERSONAS } from '../data/personas';
import { DailyWageSparkline } from './DailyWageSparkline';

interface WorkerViewProps {
  profile: WorkerProfile;
  rawCredential: W3CCredential | null;
  onSelectWorker: (workerId: string) => void;
  onSendToLender: () => void;
  onRefreshCredential: () => Promise<void>;
}

export const WorkerView: React.FC<WorkerViewProps> = ({
  profile,
  rawCredential,
  onSelectWorker,
  onSendToLender,
  onRefreshCredential
}) => {
  const [copiedDid, setCopiedDid] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);

  const handleCopyDid = () => {
    navigator.clipboard.writeText(profile.did);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  const handleCopyJson = () => {
    if (rawCredential) {
      navigator.clipboard.writeText(JSON.stringify(rawCredential, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshCredential();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper to render platform icon
  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('swiggy') || p.includes('zomato')) {
      return <Bike className="w-3.5 h-3.5 text-orange-400" />;
    }
    if (p.includes('uber')) {
      return <Car className="w-3.5 h-3.5 text-[#C084FC]" />;
    }
    return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-2">
      
      {/* Worker Greeting & Persona Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0D061C] border border-[#1C0B3B]">
        
        {/* Left: Avatar & Worker Details */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7E22CE] to-[#A855F7] p-[1.5px] shadow-md shadow-purple-950/40 shrink-0">
            <div className="w-full h-full bg-[#0D061C] rounded-[14px] flex items-center justify-center font-bold text-base text-white">
              {profile.worker_name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">{profile.worker_name}</h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                profile.resilience_tier === 'PRIME_RESILIENT'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : profile.resilience_tier === 'NEAR_PRIME'
                  ? 'bg-purple-500/15 text-[#D8B4FE] border-purple-500/25'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {profile.resilience_tier.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{profile.category}</p>
          </div>
        </div>

        {/* Right: Persona Dropdown & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#140929] border border-purple-500/30 text-xs font-semibold text-white hover:border-purple-400/50 transition-all cursor-pointer shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>Persona: <strong>{profile.worker_name.split(' ')[0]} (CRI {profile.cri_score.toFixed(1)})</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[#0D061C] border border-purple-500/30 shadow-2xl z-50 p-2 flex flex-col gap-1.5 animate-in fade-in">
                <span className="text-[10px] font-mono text-[#6B7280] px-2 py-1 uppercase tracking-wider block">
                  Select Worker Persona:
                </span>
                {Object.values(WORKER_PERSONAS).map((w) => (
                  <button
                    key={w.worker_id}
                    type="button"
                    onClick={() => {
                      onSelectWorker(w.worker_id);
                      setIsUserDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      profile.worker_id === w.worker_id
                        ? 'bg-[#1E0E3E] border border-purple-500/40 text-white'
                        : 'hover:bg-[#140929] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span>{w.worker_name}</span>
                        <span className="text-[10px] font-mono text-[#C084FC]">({w.did.split(':').pop()})</span>
                      </div>
                      <span className="text-[10px] text-[#6B7280] block">
                        {w.platform_badges.join(' + ')} • ₹{w.telemetry_summary.monthly_inflow_inr.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold font-mono ${
                        w.cri_score >= 75 ? 'text-emerald-400' : w.cri_score >= 60 ? 'text-[#C084FC]' : 'text-amber-400'
                      }`}>
                        {w.cri_score.toFixed(1)}
                      </span>
                      <span className="text-[9px] block text-[#6B7280]">{w.resilience_tier.replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sync Telemetry Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#140929] border border-[#1C0B3B] text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-purple-500/30 transition-colors cursor-pointer disabled:opacity-50"
            title="Re-compute and mint fresh credential"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C084FC]' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Minting...' : 'Sync'}</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl purple-magenta-gradient text-white text-xs font-bold shadow-md glow-purple hover:opacity-95 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: Hero Credential Card + Inflow Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Metallic Hero Credential Card (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* E-Wallet Card */}
          <div className="cosmic-hero-gradient rounded-3xl p-6 sm:p-7 border border-purple-500/25 relative overflow-hidden shadow-xl glow-purple group transition-all duration-300">
            {/* Subtle background flares */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/08 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600/08 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16"></div>

            {/* Top Row: W3C Lock Badge + EMV Chip */}
            <div className="flex items-center justify-between relative z-10 mb-6">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0D061C]/90 border border-purple-500/20 backdrop-blur-md">
                <Lock className="w-3.5 h-3.5 text-[#C084FC]" />
                <span className="text-xs font-semibold text-slate-200 tracking-wide">W3C Verifiable Credential</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-widest">GIgnite Oracle</span>
                <div className="w-9 h-6 rounded-md bg-gradient-to-br from-amber-200/90 via-amber-400/80 to-amber-600/90 border border-amber-300/30 opacity-85 shadow-inner"></div>
              </div>
            </div>

            {/* Middle Row: CRI Score */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10 my-4">
              <div>
                <span className="text-xs font-medium text-[#9CA3AF] tracking-wider uppercase">Cash-Flow Resilience Index</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-white drop-shadow">
                    {profile.cri_score.toFixed(1)}
                  </span>
                  <span className="text-[#9CA3AF] font-mono text-sm font-semibold">/ 100</span>
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono tracking-wide ${
                    profile.cri_score >= 75
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : profile.cri_score >= 60
                      ? 'bg-purple-500/15 text-[#E9D5FF] border-purple-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {profile.resilience_tier.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Platform Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {profile.platform_badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#160A2E] border border-[#1C0B3B] text-slate-200 text-xs font-semibold">
                    {getPlatformIcon(badge)}
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: DID and Inflow Claim */}
            <div className="pt-5 mt-5 border-t border-[#1C0B3B] flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center gap-2 font-mono">
                <Fingerprint className="w-4 h-4 text-[#C084FC]" />
                <span className="text-[#9CA3AF] font-medium">RFC 8785 • Ed25519 Sealed</span>
              </div>
              <div className="text-right">
                <span className="text-[#9CA3AF] block text-[10px] uppercase tracking-wider">Attested Inflow</span>
                <span className="text-base sm:text-lg font-bold font-mono text-[#10B981]">
                  ₹{profile.telemetry_summary.monthly_inflow_inr.toLocaleString('en-IN')} <span className="text-xs text-[#9CA3AF] font-normal">/ mo</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick DID Anchor Bar */}
          <div className="bg-[#0D061C] p-4 rounded-2xl border border-[#1C0B3B] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#140929] border border-[#1C0B3B] flex items-center justify-center shrink-0">
                <Fingerprint className="w-4 h-4 text-[#C084FC]" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] text-[#9CA3AF] block font-medium">Worker Decentralized ID (DID)</span>
                <span className="text-xs font-mono text-slate-200 truncate block">{profile.did}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyDid}
              className="p-2 rounded-xl bg-[#140929] border border-[#1C0B3B] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer shrink-0"
              title="Copy DID"
            >
              {copiedDid ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Shortcut to Lender Terminal */}
          <div className="bg-[#120826] p-5 rounded-3xl border border-purple-500/20 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C084FC]" />
                Transfer Credential to Underwriter
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Test how different NBFC lenders assess <strong>{profile.worker_name}'s</strong> risk tier.
              </p>
            </div>
            <button
              type="button"
              onClick={onSendToLender}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#180933] border border-purple-500/40 text-white font-semibold text-xs hover:bg-[#7E22CE] hover:border-purple-400 transition-all cursor-pointer shadow-md shrink-0"
            >
              <span>Underwrite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Telemetry Stream & Attested Inflow Ledger (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* 3x Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#0D061C] p-4 rounded-2xl border border-[#1C0B3B] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium mb-1">
                <span>Consistency</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <div className="text-xl font-bold font-mono text-white mb-2">
                {profile.telemetry_summary.consistency_rate}
              </div>
              <div className="w-full bg-[#160A2E] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#10B981] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, profile.telemetry_summary.consistency_ratio * 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-[#6B7280] mt-1.5 font-mono">
                {profile.telemetry_summary.active_working_days} / {profile.telemetry_summary.telemetry_period_days} Days
              </span>
            </div>

            <div className="bg-[#0D061C] p-4 rounded-2xl border border-[#1C0B3B] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium mb-1">
                <span>Stability</span>
                <Activity className="w-3.5 h-3.5 text-[#C084FC]" />
              </div>
              <div className="text-xl font-bold font-mono text-white mb-2">
                {profile.telemetry_summary.stability_rate}
              </div>
              <div className="w-full bg-[#160A2E] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#7E22CE] to-[#A855F7] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, profile.telemetry_summary.stability_index * 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-[#6B7280] mt-1.5 font-mono">
                {profile.telemetry_summary.zero_income_weeks} Zero-Income Weeks
              </span>
            </div>

            <div className="bg-[#0D061C] p-4 rounded-2xl border border-[#1C0B3B] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium mb-1">
                <span>Period</span>
                <Calendar className="w-3.5 h-3.5 text-[#A855F7]" />
              </div>
              <div className="text-xl font-bold font-mono text-white mb-2">
                {profile.telemetry_summary.telemetry_period_days} <span className="text-xs font-normal text-[#9CA3AF]">Days</span>
              </div>
              <div className="w-full bg-[#160A2E] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#7E22CE] h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
              <span className="text-[10px] text-[#6B7280] mt-1.5 font-mono">
                {profile.platform_badges.join(' + ')}
              </span>
            </div>
          </div>

          {/* Attested Inflow Stream */}
          <div className="bg-[#0D061C] rounded-3xl p-5 sm:p-6 border border-[#1C0B3B] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-[#C084FC]" />
                <h3 className="text-sm font-bold text-white tracking-wide">Attested Inflow Ledger</h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-purple-500/10 text-[#D8B4FE] border border-purple-500/20 font-semibold">
                zkTLS Verified Multi-Tenant
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {profile.platform_details && profile.platform_details.map((plat, idx) => (
                <div key={idx} className="bg-[#120826] p-4 rounded-2xl border border-[#1C0B3B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#160A2E] border border-[#1C0B3B] flex items-center justify-center shrink-0">
                      {getPlatformIcon(plat.platform)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#F3F4F6]">{plat.platform} Partner Payout</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                          zkTLS Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {plat.trips_completed} orders • Rating: <span className="text-amber-400 font-semibold font-mono">★ {plat.rating.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:shrink-0">
                    <span className="text-base font-bold font-mono text-[#10B981]">
                      +₹{plat.payout_amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-[#6B7280] block font-mono">{plat.payout_frequency} Settlement</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Zero Knowledge Privacy Guarantee Note */}
            <div className="p-3.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B] flex items-center justify-between text-xs text-[#9CA3AF]">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#C084FC]" />
                <span>Zero-Knowledge Selective Disclosure Enabled</span>
              </div>
              <span className="text-[11px] font-mono text-[#10B981]">GPS & Customer PII Redacted</span>
            </div>

          </div>

        </div>

      </div>

      {/* 30-Day Daily Wage Stream Sparkline Section */}
      <DailyWageSparkline
        dailyWages={profile.daily_wages_30d || profile.telemetry_summary.daily_wages_30d}
        monthlyInflow={profile.telemetry_summary.monthly_inflow_inr}
        consistencyRate={profile.telemetry_summary.consistency_rate}
        activeDays={profile.telemetry_summary.active_working_days}
        workerName={profile.worker_name}
        className="w-full"
      />

      {/* ==================================================================== */}
      {/* EXPORT CREDENTIAL MODAL                                              */}
      {/* ==================================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0D061C] border border-purple-500/30 rounded-3xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1C0B3B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#180933] border border-purple-500/30 flex items-center justify-center">
                  <FileCode2 className="w-4 h-4 text-[#C084FC]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Export W3C Credential ({profile.worker_name})</h3>
                  <p className="text-xs text-[#9CA3AF]">Canonical JSON-LD with Ed25519 Cryptographic Proof</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#180933] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Signature & Issuer Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#07030F] border border-[#1C0B3B]">
                <span className="text-[10px] text-[#6B7280] block">Subject DID</span>
                <span className="text-[#C084FC] truncate block">{profile.did}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#07030F] border border-[#1C0B3B]">
                <span className="text-[10px] text-[#6B7280] block">Proof Type</span>
                <span className="text-[#10B981] truncate block">{rawCredential?.proof?.type || "Ed25519Signature2020"}</span>
              </div>
            </div>

            {/* Canonical JSON Payload View */}
            <div className="relative flex-1 min-h-0 bg-[#07030F] border border-[#1C0B3B] rounded-2xl p-4 overflow-y-auto max-h-[300px]">
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                {rawCredential ? JSON.stringify(rawCredential, null, 2) : "// Loading credential..."}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#1C0B3B]">
              <button
                type="button"
                onClick={handleCopyJson}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#140929] border border-[#1C0B3B] text-xs font-semibold text-white hover:border-purple-500/30 transition-colors cursor-pointer"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied Canonical JSON!' : 'Copy JSON Payload'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExportModalOpen(false);
                  onSendToLender();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl purple-magenta-gradient text-white text-xs font-bold shadow-md glow-purple hover:opacity-95 transition-all cursor-pointer"
              >
                <span>Send to Lender Terminal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
