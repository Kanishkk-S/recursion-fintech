import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  Mail,
  AlertCircle
} from 'lucide-react';
import { GIgniteLogo } from './GIgniteLogo';
import { findAccountByEmail } from '../data/personas';
import type { ExtendedWorkerProfile, ExtendedLenderProfile } from '../data/personas';

interface LoginPageProps {
  onLoginSuccess: (account: { type: 'worker'; worker: ExtendedWorkerProfile } | { type: 'lender'; lender: ExtendedLenderProfile }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedTab, setSelectedTab] = useState<'worker' | 'lender'>('worker');
  const [emailInput, setEmailInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = (emailToUse?: string) => {
    const targetEmail = (emailToUse || emailInput).trim();
    if (!targetEmail) {
      setErrorMessage('Please enter a registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const resolved = findAccountByEmail(targetEmail);
      if (resolved) {
        onLoginSuccess(resolved);
      } else {
        setErrorMessage(`No verified identity found for "${targetEmail}". Please try one of the registered demo accounts below.`);
        setIsLoading(false);
      }
    }, 350);
  };

  const handleQuickLogin = (email: string) => {
    setEmailInput(email);
    handleLogin(email);
  };

  return (
    <div className="min-h-screen bg-[#07030F] text-[#F3F4F6] flex flex-col justify-between font-sans selection:bg-purple-600 selection:text-white relative overflow-hidden">
      
      {/* Background Cosmic Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-[#240552]/12 rounded-full blur-[170px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[450px] h-[450px] bg-[#7E22CE]/06 rounded-full blur-[190px] pointer-events-none"></div>

      {/* Top Simple Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#140929] border border-purple-500/30 flex items-center justify-center shadow-md shadow-purple-950/40 p-1">
            <GIgniteLogo size={32} className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white">GIgnite</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#7E22CE]/15 text-[#D8B4FE] border border-purple-500/20 tracking-wider">
              AIRLOCK GATEWAY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#9CA3AF]">
          <Cpu className="w-3.5 h-3.5 text-[#C084FC]" />
          <span>Zero-Trust RFC 8785 Protocol</span>
        </div>
      </header>

      {/* Main Center Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg bg-[#0D061C] border border-[#1C0B3B] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
          
          {/* Card Title & Icon */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#7E22CE] to-[#A855F7] p-[1.5px] shadow-lg shadow-purple-950/50">
              <div className="w-full h-full bg-[#0D061C] rounded-[22px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-[#C084FC]" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Financial Identity Airlock
              </h1>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
                Enter your email to load your cryptographic telemetry or underwriting terminal
              </p>
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#07030F] p-1.5 rounded-2xl border border-[#1C0B3B]">
            <button
              type="button"
              onClick={() => {
                setSelectedTab('worker');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'worker'
                  ? 'bg-[#180933] text-white border border-purple-500/30 shadow-md'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>Worker / Borrower</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTab('lender');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'lender'
                  ? 'bg-[#180933] text-white border border-purple-500/30 shadow-md'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>NBFC Lender Desk</span>
            </button>
          </div>

          {/* Email Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {selectedTab === 'worker' ? 'Registered Worker Email' : 'Institutional Underwriter Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={selectedTab === 'worker' ? 'e.g., ramesh@swiggy.in' : 'e.g., underwriter@finprime.com'}
                  className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-purple-500/60 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl purple-magenta-gradient hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg glow-purple transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Identity...' : 'Access Financial Identity'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Quick-Access Accounts for Hackathon Judges */}
          <div className="pt-4 border-t border-[#1C0B3B] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />
                Demo Persona One-Click Access
              </span>
              <span className="text-[10px] font-mono text-[#6B7280]">Instant Login</span>
            </div>

            {selectedTab === 'worker' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ramesh@swiggy.in')}
                  className="p-2.5 rounded-xl bg-[#120826] border border-[#1C0B3B] hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#C084FC]">Ramesh</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400">CRI 88.7</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280] block truncate">Swiggy + Uber</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('priya@blinkit.com')}
                  className="p-2.5 rounded-xl bg-[#120826] border border-[#1C0B3B] hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#C084FC]">Priya</span>
                    <span className="text-[9px] font-mono font-bold text-[#C084FC]">CRI 64.2</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280] block truncate">Blinkit + Zepto</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('vikram@zomato.com')}
                  className="p-2.5 rounded-xl bg-[#120826] border border-[#1C0B3B] hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#C084FC]">Vikram</span>
                    <span className="text-[9px] font-mono font-bold text-amber-400">CRI 41.0</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280] block truncate">Zomato Fleet</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('underwriter@finprime.com')}
                  className="p-3 rounded-xl bg-[#120826] border border-[#1C0B3B] hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#C084FC]">FinPrime NBFC</span>
                    <span className="text-[10px] font-mono text-emerald-400">Min CRI 75</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280] block">Prime Low-Risk Desk</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('desk@microflex.capital')}
                  className="p-3 rounded-xl bg-[#120826] border border-[#1C0B3B] hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#C084FC]">MicroFlex Capital</span>
                    <span className="text-[10px] font-mono text-[#C084FC]">Min CRI 50</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280] block">Growth Micro-Lender Desk</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#6B7280] font-mono relative z-10">
        GIgnite Verifiable Identity Airlock • RFC 8785 Canonical Serialization • Ed25519 Cryptographic Signatures
      </footer>

    </div>
  );
};
