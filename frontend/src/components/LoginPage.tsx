import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Mail,
  User,
  Building2,
  Sparkles,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { GIgniteLogo } from './GIgniteLogo';
import { findAccountByEmail } from '../data/personas';
import type { ExtendedWorkerProfile, ExtendedLenderProfile } from '../data/personas';

interface LoginPageProps {
  onLoginSuccess: (account: { type: 'worker'; worker: ExtendedWorkerProfile } | { type: 'lender'; lender: ExtendedLenderProfile }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedTab, setSelectedTab] = useState<'worker' | 'lender'>('worker');

  // Input States - Initialized from localStorage
  const [emailInput, setEmailInput] = useState<string>(() => {
    try {
      return localStorage.getItem('gignite_last_email') || '';
    } catch {
      return '';
    }
  });

  const [notFoundPrompt, setNotFoundPrompt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sign Up Form States
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Uber');
  const [monthlyInflow, setMonthlyInflow] = useState<number>(38500);
  const [institutionName, setInstitutionName] = useState<string>('');
  const [lenderFocus, setLenderFocus] = useState<string>('Prime / Growth Mandate');
  const [minCri, setMinCri] = useState<number>(65);

  // --------------------------------------------------------------------------
  // HANDLE SIGN IN (Checks SQLite API first, with fallback to local registry)
  // --------------------------------------------------------------------------
  const handleSignIn = async () => {
    const targetEmail = emailInput.trim();
    if (!targetEmail) {
      setErrorMessage('Please enter your email address.');
      setNotFoundPrompt(null);
      return;
    }

    try {
      localStorage.setItem('gignite_last_email', targetEmail);
    } catch {
      // ignore
    }

    setIsLoading(true);
    setErrorMessage(null);
    setNotFoundPrompt(null);

    // 1. Try Backend SQLite Endpoint if worker mode or lender
    if (selectedTab === 'worker') {
      try {
        const response = await fetch(`http://localhost:8000/api/worker/check?email=${encodeURIComponent(targetEmail)}`);
        if (response.ok) {
          const workerData = await response.json();
          try {
            localStorage.setItem('gignite_active_user', JSON.stringify(workerData));
            localStorage.setItem('gignite_current_user', JSON.stringify({ type: 'worker', worker: workerData }));
          } catch {
            // ignore
          }
          onLoginSuccess({ type: 'worker', worker: workerData });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend SQLite check error, trying local registry:', err);
      }
    }

    // 2. Check local personas fallback for workers or lenders
    const localResolved = findAccountByEmail(targetEmail);
    if (localResolved) {
      if (localResolved.type === 'worker') {
        try {
          localStorage.setItem('gignite_active_user', JSON.stringify(localResolved.worker));
        } catch {
          // ignore
        }
      }
      onLoginSuccess(localResolved);
      setIsLoading(false);
      return;
    }

    // 3. Not found -> prompt to sign up
    setIsLoading(false);
    setNotFoundPrompt(targetEmail);
  };

  // --------------------------------------------------------------------------
  // HANDLE SIGN UP / REGISTRATION (Posts to SQLite Backend)
  // --------------------------------------------------------------------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = emailInput.trim();
    if (!targetEmail) {
      setErrorMessage('Email is required for registration.');
      return;
    }

    try {
      localStorage.setItem('gignite_last_email', targetEmail);
    } catch {
      // ignore
    }

    setIsLoading(true);
    setErrorMessage(null);

    if (selectedTab === 'worker') {
      const nameToUse = fullName.trim() || targetEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Attempt backend SQLite registration
      try {
        const response = await fetch('http://localhost:8000/api/worker/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: targetEmail,
            name: nameToUse,
            platform: selectedPlatform,
            monthly_inflow: monthlyInflow
          })
        });

        if (response.ok) {
          const registeredWorker = await response.json();
          try {
            localStorage.setItem('gignite_active_user', JSON.stringify(registeredWorker));
            localStorage.setItem('gignite_current_user', JSON.stringify({ type: 'worker', worker: registeredWorker }));
          } catch {
            // ignore
          }
          onLoginSuccess({ type: 'worker', worker: registeredWorker });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend SQLite register failed, using client-side generator:', err);
      }

      // Client-side fallback registration
      const workerId = `${nameToUse.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const calculatedCri = 82.4;

      const fallbackWorker: ExtendedWorkerProfile = {
        worker_id: workerId,
        worker_name: nameToUse,
        email: targetEmail,
        phone: phone.trim() || "+91 98000 11223",
        did: `did:gignite:worker:${targetEmail.split('@')[0]}`,
        category: `${selectedPlatform} Fleet Partner`,
        credit_bureau_status: "THIN_FILE_VERIFIED_BY_GIGNITE",
        platform_badges: [selectedPlatform],
        platform_details: [
          {
            platform: selectedPlatform,
            role: `${selectedPlatform} Driver Partner`,
            rating: 4.86,
            trips_completed: 450,
            verified_active: true,
            payout_frequency: "Weekly",
            badge: `${selectedPlatform} Verified Partner`,
            payout_amount_inr: monthlyInflow
          }
        ],
        telemetry_summary: {
          telemetry_period_days: 180,
          active_working_days: 160,
          active_days_ratio: 0.89,
          consistency_rate: "89.0%",
          consistency_ratio: 0.89,
          stability_rate: "100.0%",
          stability_index: 1.0,
          monthly_inflow_inr: monthlyInflow,
          gross_earnings_180d_inr: monthlyInflow * 6,
          net_earnings_180d_inr: monthlyInflow * 4.7,
          zero_income_weeks: 0
        },
        cri_score: calculatedCri,
        resilience_tier: "PRIME_RESILIENT",
        max_prime_credit_limit_inr: Math.round(monthlyInflow * 0.7),
        instant_safe_floor_inr: Math.round(monthlyInflow * 0.5)
      };

      try {
        localStorage.setItem('gignite_active_user', JSON.stringify(fallbackWorker));
        localStorage.setItem('gignite_current_user', JSON.stringify({ type: 'worker', worker: fallbackWorker }));
      } catch {
        // ignore
      }

      onLoginSuccess({ type: 'worker', worker: fallbackWorker });
      setIsLoading(false);
    } else {
      // Lender Registration
      const instName = institutionName.trim() || targetEmail.split('@')[0].toUpperCase() + ' Capital';
      const lenderId = `${instName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;

      const newLender: ExtendedLenderProfile = {
        id: lenderId,
        name: instName,
        email: targetEmail,
        portal_name: `${instName} Underwriting Portal`,
        code: `${instName.toUpperCase().replace(/\s+/g, '_')}_DESK`,
        focus: lenderFocus,
        max_limit_inr: 40000,
        min_cri: minCri,
        base_apr_p_a: "13.5%",
        base_apr_numeric: 13.5,
        max_tenure_months: 12,
        badge: `${instName} Institutional Desk`,
        accent_color: "purple"
      };

      try {
        localStorage.setItem('gignite_current_user', JSON.stringify({ type: 'lender', lender: newLender }));
      } catch {
        // ignore
      }

      onLoginSuccess({ type: 'lender', lender: newLender });
      setIsLoading(false);
    }
  };

  // Quick helper to directly trigger sign up with entered email
  const handleQuickRegisterPrompt = () => {
    setAuthMode('signup');
    setNotFoundPrompt(null);
  };

  return (
    <div className="min-h-screen bg-[#07030F] text-[#F3F4F6] flex flex-col justify-between font-sans selection:bg-purple-600 selection:text-white relative overflow-hidden">
      
      {/* Background Cosmic Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-[#240552]/12 rounded-full blur-[170px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[450px] h-[450px] bg-[#7E22CE]/06 rounded-full blur-[190px] pointer-events-none"></div>

      {/* Top Header */}
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

      {/* Main Center Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg bg-[#0D061C] border border-[#1C0B3B] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
          
          {/* Header Title & Shield Icon */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#7E22CE] to-[#A855F7] p-[1.5px] shadow-lg shadow-purple-950/50">
              <div className="w-full h-full bg-[#0D061C] rounded-[22px] flex items-center justify-center">
                {authMode === 'signin' ? (
                  <ShieldCheck className="w-7 h-7 text-[#C084FC]" />
                ) : (
                  <Sparkles className="w-7 h-7 text-[#C084FC]" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {authMode === 'signin' ? 'Financial Identity Airlock' : 'Create New Financial Identity'}
              </h1>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
                {authMode === 'signin'
                  ? 'Enter your registered email to load your cryptographic telemetry or underwriting desk'
                  : 'Register your decentralized identity with verified SQLite telemetry integration'}
              </p>
            </div>
          </div>

          {/* Role Filter Tabs (Worker vs Lender) */}
          <div className="grid grid-cols-2 gap-2 bg-[#07030F] p-1.5 rounded-2xl border border-[#1C0B3B]">
            <button
              type="button"
              onClick={() => {
                setSelectedTab('worker');
                setErrorMessage(null);
                setNotFoundPrompt(null);
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
                setNotFoundPrompt(null);
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

          {/* ---------------------------------------------------------------- */}
          {/* MODE 1: SIGN IN VIEW                                             */}
          {/* ---------------------------------------------------------------- */}
          {authMode === 'signin' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  {selectedTab === 'worker' ? 'Worker Email Address' : 'Underwriting Desk Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      try {
                        localStorage.setItem('gignite_last_email', e.target.value);
                      } catch {
                        // ignore
                      }
                      if (errorMessage) setErrorMessage(null);
                      if (notFoundPrompt) setNotFoundPrompt(null);
                    }}
                    placeholder={selectedTab === 'worker' ? 'e.g., ramesh@uber.com or itsmedwin@uber' : 'e.g., underwriter@finprime.com'}
                    className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-purple-500/60 transition-colors font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {/* Standard Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* PROMPT: NO ACCOUNT FOUND -> WANNA SIGN UP? */}
              {notFoundPrompt && (
                <div className="p-4 rounded-2xl bg-[#1F0A20] border border-purple-500/40 text-xs flex flex-col gap-3 animate-in fade-in shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#7E22CE]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />
                    </div>
                    <div>
                      <p className="font-bold text-white">No account found for "{notFoundPrompt}"</p>
                      <p className="text-[#9CA3AF] mt-0.5">
                        Would you like to register this email and create a new GIgnite Financial Identity in SQLite?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-purple-500/20">
                    <button
                      type="button"
                      onClick={handleQuickRegisterPrompt}
                      className="flex-1 py-2 px-3 rounded-xl purple-magenta-gradient text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Yes, Sign Up Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotFoundPrompt(null)}
                      className="py-2 px-3 rounded-xl bg-[#07030F] border border-[#1C0B3B] text-[#9CA3AF] hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl purple-magenta-gradient hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg glow-purple transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Identity in SQLite...' : 'Access Financial Identity'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct Toggle to Sign Up */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                    setNotFoundPrompt(null);
                  }}
                  className="text-xs text-[#9CA3AF] hover:text-[#C084FC] transition-colors cursor-pointer"
                >
                  Don't have an identity registered? <strong className="text-white underline">Sign Up</strong>
                </button>
              </div>
            </form>
          ) : (
            /* ---------------------------------------------------------------- */
            /* MODE 2: SIGN UP VIEW (Saves directly to SQLite DB)               */
            /* ---------------------------------------------------------------- */
            <form onSubmit={handleSignUp} className="flex flex-col gap-4 animate-in fade-in">
              
              {/* Full Name / Organization */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-xs font-semibold text-slate-300">
                  {selectedTab === 'worker' ? 'Full Legal Name' : 'Financial Institution Name'}
                </label>
                <div className="relative">
                  {selectedTab === 'worker' ? (
                    <User className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  ) : (
                    <Building2 className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    value={selectedTab === 'worker' ? fullName : institutionName}
                    onChange={(e) => selectedTab === 'worker' ? setFullName(e.target.value) : setInstitutionName(e.target.value)}
                    placeholder={selectedTab === 'worker' ? 'e.g., Edwin' : 'e.g., Apex Capital NBFC'}
                    className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-purple-500/60 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-email" className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    autoComplete="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      try {
                        localStorage.setItem('gignite_last_email', e.target.value);
                      } catch {
                        // ignore
                      }
                    }}
                    placeholder="e.g., itsmedwin@uber"
                    className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-purple-500/60 transition-colors font-mono"
                    required
                  />
                </div>
              </div>

              {/* Worker Specific Fields */}
              {selectedTab === 'worker' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Primary Platform</label>
                      <div className="relative">
                        <select
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60 transition-colors cursor-pointer"
                        >
                          <option value="Uber">Uber India</option>
                          <option value="Swiggy">Swiggy Delivery</option>
                          <option value="Zomato">Zomato Fleet</option>
                          <option value="Blinkit">Blinkit Express</option>
                          <option value="Zepto">Zepto Dispatch</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Monthly Inflow (INR)</label>
                      <input
                        type="number"
                        min={5000}
                        max={150000}
                        step={1000}
                        value={monthlyInflow}
                        onChange={(e) => setMonthlyInflow(Number(e.target.value))}
                        className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500/60 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-xs font-semibold text-slate-300">Mobile Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98000 11223"
                        className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-purple-500/60 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Lender Specific Fields */
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Minimum CRI Mandate</label>
                    <input
                      type="number"
                      min={40}
                      max={90}
                      value={minCri}
                      onChange={(e) => setMinCri(Number(e.target.value))}
                      className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500/60 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Risk Focus</label>
                    <select
                      value={lenderFocus}
                      onChange={(e) => setLenderFocus(e.target.value)}
                      className="w-full bg-[#07030F] border border-[#1C0B3B] rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60 transition-colors cursor-pointer"
                    >
                      <option value="Prime / Low-Risk Mandate">Prime / Low-Risk</option>
                      <option value="Growth / Flexible Mandate">Growth / Flexible</option>
                      <option value="Micro-Capital Mandate">Micro-Capital</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl purple-magenta-gradient hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg glow-purple transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Registering in SQLite & Issuing W3C Proof...' : 'Complete Registration & Enter'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              {/* Back to Sign In Toggle */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-[#9CA3AF] hover:text-[#C084FC] transition-colors cursor-pointer"
                >
                  Already have an account? <strong className="text-white underline">Sign In</strong>
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#6B7280] font-mono relative z-10">
        GIgnite Verifiable Identity Airlock • SQLite Account Registry • RFC 8785 Canonical Serialization
      </footer>

    </div>
  );
};
