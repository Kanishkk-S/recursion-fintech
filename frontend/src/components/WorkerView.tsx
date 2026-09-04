import React, { useState } from 'react';
import {
  Lock,
  Fingerprint,
  TrendingUp,
  Volume2,
  Share2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  Briefcase,
  Layers,
  Radio,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import type { WorkerProfile, W3CCredential } from '../types';
import { WORKER_PERSONAS } from '../data/personas';
import { SoundboxModal } from './SoundboxModal';
import { StudioDrawer, type StudioTab } from './StudioDrawer';

interface WorkerViewProps {
  profile: WorkerProfile;
  rawCredential: W3CCredential | null;
  onSelectWorker: (workerId: string) => void;
  onSendToLender: () => void;
  onRefreshCredential: () => Promise<void>;
  onVerifyZkTls?: () => Promise<void> | void;
  onVerifySoundbox?: (data: { totalInflow: number; criScore: number; scans: number; avgDaily: number; credentialId: string; }) => void;
}

export const WorkerView: React.FC<WorkerViewProps> = ({
  profile,
  rawCredential,
  onSelectWorker,
  onSendToLender,
  onRefreshCredential,
  onVerifyZkTls,
  onVerifySoundbox
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSoundboxModalOpen, setIsSoundboxModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);

  // Collapsible Studio Flyout Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<StudioTab>('telemetry');

  const openDrawer = (tab: StudioTab) => {
    setDrawerTab(tab);
    setIsDrawerOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshCredential();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ==================================================================== */}
      {/* TOP COMPACT BAR: Persona Switcher, Quick Links & Actions             */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[#090D1A] border border-[#17223B] shadow-xl">
        
        {/* Left: Persona Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#121B30] border border-[#202E4F] hover:border-blue-500/50 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-[11px] text-white">
              {profile.worker_name.split(' ').map(n => n[0]).join('')}
            </div>
            <span>Persona: <strong>{profile.worker_name.split(' ')[0]} (CRI {profile.cri_score.toFixed(1)})</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-[#0B0F1E] border border-[#202E4F] shadow-2xl z-50 p-2 flex flex-col gap-1.5 animate-in fade-in">
              <span className="text-[10px] font-mono text-[#64748B] px-2 py-1 uppercase tracking-wider block">
                Select Worker Identity:
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
                      ? 'bg-[#18233C] border border-blue-500/40 text-white'
                      : 'hover:bg-[#121B30] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <span>{w.worker_name}</span>
                      <span className="text-[10px] font-mono text-blue-400">({w.did.split(':').pop()})</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] block">
                      {w.platform_badges.join(' + ')} • ₹{w.telemetry_summary.monthly_inflow_inr.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono ${
                      w.cri_score >= 75 ? 'text-emerald-400' : w.cri_score >= 60 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {w.cri_score.toFixed(1)}
                    </span>
                    <span className="text-[9px] block text-[#64748B]">{w.resilience_tier.replace('_', ' ')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Contextual Quick Studio Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#94A3B8]">
          <button 
            type="button"
            onClick={() => openDrawer('telemetry')}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>Telemetry Studio</span>
          </button>
          <button 
            type="button"
            onClick={() => openDrawer('soundbox')}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Soundbox Rail</span>
          </button>
          <button 
            type="button"
            onClick={() => openDrawer('credential')}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>W3C Proofs</span>
          </button>
          <button 
            type="button"
            onClick={() => openDrawer('underwrite')}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Underwrite Studio</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-[#121B30] border border-[#202E4F] text-[#94A3B8] hover:text-white hover:border-blue-500/40 transition-colors cursor-pointer disabled:opacity-50"
            title="Sync & Re-mint Credential"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => openDrawer('telemetry')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Studio</span>
          </button>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* MAIN 3-COLUMN BENTO STUDIO GRID (FINZOO-STYLE LAYOUT)                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ------------------------------------------------------------------ */}
        {/* LEFT COLUMN: 3 Stacked Floating Cards (3 Cols)                    */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Card 1: Growth Insights & Worker Persona Profile */}
          <div 
            onClick={() => openDrawer('credential')}
            className="p-5 rounded-3xl bg-[#090D1A] border border-[#17223B] hover:border-blue-500/40 shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden min-h-[220px]"
          >
            {/* Subtle Gradient Backdrop */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-3 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-[1.5px] shadow-lg shadow-blue-950/50">
                <div className="w-full h-full bg-[#0D1426] rounded-[14px] flex items-center justify-center font-extrabold text-xl text-white">
                  {profile.worker_name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                  {profile.worker_name}
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="text-xs text-[#94A3B8] truncate">
                    {profile.primary_domain || profile.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] mt-3 leading-relaxed relative z-10">
              Zero-knowledge verifiable cash flow telemetry engineered for unbanked gig earners.
            </p>
          </div>

          {/* Card 2: 5K+ Global Trusted Badge */}
          <div 
            onClick={() => openDrawer('credential')}
            className="p-4 rounded-3xl bg-[#090D1A] border border-[#17223B] hover:border-blue-500/40 shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#090D1A] bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                  RK
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#090D1A] bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                  PS
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#090D1A] bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                  VS
                </div>
              </div>

              <div>
                <span className="text-sm font-extrabold text-white block">5K+</span>
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
                  Attested DIDs
                </span>
              </div>
            </div>

            <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>

          {/* Card 3: Digital Banking / Soundbox Live Feed */}
          <div 
            onClick={() => openDrawer('soundbox')}
            className="p-5 rounded-3xl bg-[#090D1A] border border-[#17223B] hover:border-purple-500/40 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 group min-h-[160px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Soundbox Oracle</span>
              </div>
              <Radio className={`w-3.5 h-3.5 ${profile.is_soundbox_verified ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            </div>

            <div>
              <span className="text-lg font-bold font-mono text-white block">
                {profile.is_soundbox_verified ? "1,120 Scans" : "Awaiting Link"}
              </span>
              <span className="text-[11px] text-[#94A3B8] mt-0.5 block">
                {profile.is_soundbox_verified ? "PhonePe • T+0 Auto-Settled" : "Click to Ingest Soundbox Telemetry"}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 pt-2 border-t border-[#17223B]">
              <span>Hardware Voice Box</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------------ */}
        {/* CENTER COLUMN: Hero Headline & Holographic Card Showcase (6 Cols)  */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-5">
          
          {/* Top Hero Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090D1A] border border-[#17223B] shadow-2xl flex flex-col justify-between gap-5 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="space-y-4 relative z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.05] uppercase">
                BANKING<br />
                MADE FOR<br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  GROWTH
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg leading-relaxed">
                Discover zero-trust cash flow resilience, zkTLS platform settlement proofs, and instant decentralized working capital for daily-wage workers.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 relative z-10 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openDrawer('telemetry')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-blue-900/40 transition-all cursor-pointer group"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-[#121B30] border border-[#202E4F] hover:border-blue-500/40 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Export W3C Claim</span>
              </button>
            </div>
          </div>

          {/* Lower Center: Metallic Holographic Credential Card Stage */}
          <div 
            onClick={() => openDrawer('credential')}
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0D1426] via-[#090E1D] to-[#120D26] border border-blue-500/30 shadow-2xl shadow-blue-950/40 hover:border-blue-400/60 transition-all duration-300 cursor-pointer group relative overflow-hidden min-h-[220px] flex flex-col justify-between"
          >
            {/* Ambient Hologram Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Card Header: W3C Lock Badge + EMV Chip */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#070B16]/80 border border-blue-500/30 backdrop-blur-md">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-slate-200">W3C Verifiable Credential</span>
              </div>
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/40 shadow-inner"></div>
            </div>

            {/* Center Score Metric */}
            <div className="my-4 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#94A3B8]">
                  Cash-Flow Resilience Index (CRI)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                    {profile.cri_score.toFixed(1)}
                  </span>
                  <span className="text-sm font-mono text-[#64748B]">/ 100</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ml-2 ${
                    profile.cri_score >= 75
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : profile.cri_score >= 60
                      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {profile.resilience_tier.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Platform Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {profile.platform_badges.map((badge, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-[#141C30] border border-[#1E2945] text-xs font-semibold text-slate-200">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer DID Seal */}
            <div className="pt-3 border-t border-[#1B253D] flex items-center justify-between text-xs font-mono relative z-10">
              <div className="flex items-center gap-1.5 text-[#94A3B8]">
                <Fingerprint className="w-4 h-4 text-blue-400" />
                <span>{profile.did}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Ed25519 Sealed</span>
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT COLUMN: Metric Spotlight, 3D Layered Cards & Inflow (3 Cols)*/}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Card 4: Top Fintech Platform Metric Card */}
          <div 
            onClick={() => openDrawer('underwrite')}
            className="p-5 rounded-3xl bg-[#090D1A] border border-[#17223B] hover:border-blue-500/40 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between text-center min-h-[190px] group"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
              TOP FINTECH IDENTITY
            </span>

            <div className="my-2">
              <span className="text-5xl font-black text-white tracking-tight block">
                #1
              </span>
              <span className="text-xs text-[#94A3B8] mt-1 block">
                For verified gig payments
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-emerald-400 pt-2 border-t border-[#17223B]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{profile.resilience_tier.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Card 5: Isometric 3D Layered Cards Showcase */}
          <div 
            onClick={() => openDrawer('credential')}
            className="p-5 rounded-3xl bg-[#090D1A] border border-[#17223B] hover:border-indigo-500/40 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between items-center relative overflow-hidden group min-h-[220px]"
          >
            <div className="w-full flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-mono text-[10px] uppercase tracking-wider">Multi-Layer Rails</span>
              <Layers className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>

            {/* 3D Stacked Isometric Cards Visual Representation */}
            <div className="relative w-full h-28 flex items-center justify-center my-1">
              {/* Layer 3 (Bottom) */}
              <div className="absolute w-44 h-16 rounded-2xl bg-purple-900/30 border border-purple-500/30 rotate-[-12deg] translate-y-3 -translate-x-2 blur-[0.5px]"></div>
              {/* Layer 2 (Middle) */}
              <div className="absolute w-44 h-16 rounded-2xl bg-blue-900/40 border border-blue-500/40 rotate-[-6deg] translate-y-1.5 translate-x-1"></div>
              {/* Layer 1 (Top Front) */}
              <div className="absolute w-44 h-16 rounded-2xl bg-gradient-to-r from-[#17223B] to-[#1E2C4F] border border-blue-400/60 p-2.5 shadow-2xl flex flex-col justify-between rotate-0 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between text-[8px] font-mono text-slate-300">
                  <span>W3C CREDENTIAL</span>
                  <span className="text-emerald-400">AUTHENTIC</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white">
                  <span>**** 9872</span>
                  <span className="text-blue-300">GIgnite</span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#64748B] text-center block">
              3 Layered Verifiable Rails Connected
            </span>
          </div>

          {/* Card 6: Big Inflow Spotlight */}
          <div 
            onClick={() => openDrawer('telemetry')}
            className="p-5 rounded-3xl bg-[#090D1A] border border-[#17223B] hover:border-emerald-500/40 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] group"
          >
            <div>
              <span className="text-3xl font-extrabold font-mono text-white block tracking-tight">
                ₹{profile.telemetry_summary.monthly_inflow_inr.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#94A3B8] mt-1 block">
                Monthly Inflow Verified Securely
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-2 border-t border-[#17223B]">
              <span>T+0 Daily Settlement</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

        </div>

      </div>

      {/* ==================================================================== */}
      {/* COLLAPSIBLE FLYOUT STUDIO DRAWER                                     */}
      {/* ==================================================================== */}
      <StudioDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={drawerTab}
        setActiveTab={setDrawerTab}
        profile={profile}
        rawCredential={rawCredential}
        onVerifyZkTls={onVerifyZkTls}
        onOpenSoundboxModal={() => setIsSoundboxModalOpen(true)}
        onSendToLender={onSendToLender}
      />

      {/* ==================================================================== */}
      {/* SOUNDBOX zkTLS INGESTION MODAL                                       */}
      {/* ==================================================================== */}
      <SoundboxModal
        isOpen={isSoundboxModalOpen}
        onClose={() => setIsSoundboxModalOpen(false)}
        workerName={profile.worker_name}
        onApplyCredential={(data) => {
          if (onVerifySoundbox) {
            onVerifySoundbox(data);
          }
        }}
      />

      {/* ==================================================================== */}
      {/* EXPORT W3C CREDENTIAL MODAL                                          */}
      {/* ==================================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#090D1A] border border-[#17223B] rounded-3xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#17223B]">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">W3C Verifiable Credential Payload</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#121B30] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative flex-1 min-h-0 bg-[#060913] border border-[#17223B] rounded-2xl p-4 overflow-y-auto max-h-[300px]">
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                {rawCredential ? JSON.stringify(rawCredential, null, 2) : "// Loading credential..."}
              </pre>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#17223B]">
              <button
                type="button"
                onClick={() => {
                  if (rawCredential) {
                    navigator.clipboard.writeText(JSON.stringify(rawCredential, null, 2));
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121B30] border border-[#202E4F] text-xs font-semibold text-white hover:border-blue-500/40 transition-colors cursor-pointer"
              >
                <span>Copy Payload</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExportModalOpen(false);
                  onSendToLender();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                <span>Send to Lender Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
