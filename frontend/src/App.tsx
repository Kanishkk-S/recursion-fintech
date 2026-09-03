import { useState, useEffect } from 'react';
import { GIgniteLogo } from './components/GIgniteLogo';
import { RoleNav } from './components/RoleNav';
import { WorkerView } from './components/WorkerView';
import { LenderView } from './components/LenderView';
import { LoginPage } from './components/LoginPage';
import { LogOut } from 'lucide-react';
import type { WorkerProfile, W3CCredential, UnderwritingResult, LenderProfile } from './types';
import { 
  WORKER_PERSONAS, 
  LENDER_PERSONAS, 
  generateWorkerCredential,
  type ExtendedWorkerProfile,
  type ExtendedLenderProfile
} from './data/personas';

interface StoredSession {
  role: 'worker' | 'lender';
  workerId?: string;
  lenderId?: string;
  email: string;
}

export default function App() {
  // Session State (null = show LoginPage)
  const [session, setSession] = useState<StoredSession | null>(() => {
    try {
      const savedUser = localStorage.getItem('gignite_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.type === 'worker' && parsed.worker) {
          return { role: 'worker', workerId: parsed.worker.worker_id, email: parsed.worker.email };
        }
        if (parsed.type === 'lender' && parsed.lender) {
          return { role: 'lender', lenderId: parsed.lender.id, email: parsed.lender.email };
        }
      }
      const savedSession = localStorage.getItem('gignite_active_session');
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Navigation Role State ('worker' | 'lender')
  const [activeRole, setActiveRole] = useState<'worker' | 'lender'>(() => {
    try {
      const savedUser = localStorage.getItem('gignite_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.type === 'lender') return 'lender';
      }
    } catch {
      // ignore
    }
    return 'worker';
  });

  // Active Personas Data
  const [profile, setProfile] = useState<WorkerProfile>(() => {
    try {
      const savedUser = localStorage.getItem('gignite_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.type === 'worker' && parsed.worker) {
          return parsed.worker;
        }
      }
      const savedSession = localStorage.getItem('gignite_active_session');
      if (savedSession) {
        const parsed: StoredSession = JSON.parse(savedSession);
        if (parsed.workerId && WORKER_PERSONAS[parsed.workerId]) {
          return WORKER_PERSONAS[parsed.workerId];
        }
      }
    } catch {
      // ignore
    }
    return WORKER_PERSONAS['ramesh-kumar-9872'];
  });

  const [activeLender, setActiveLender] = useState<LenderProfile>(() => {
    try {
      const savedUser = localStorage.getItem('gignite_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.type === 'lender' && parsed.lender) {
          return parsed.lender;
        }
      }
      const savedSession = localStorage.getItem('gignite_active_session');
      if (savedSession) {
        const parsed: StoredSession = JSON.parse(savedSession);
        if (parsed.lenderId && LENDER_PERSONAS[parsed.lenderId]) {
          return LENDER_PERSONAS[parsed.lenderId];
        }
      }
    } catch {
      // ignore
    }
    return LENDER_PERSONAS['finprime-nbfc'];
  });

  const [rawCredential, setRawCredential] = useState<W3CCredential | null>(() => {
    try {
      const savedUser = localStorage.getItem('gignite_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.type === 'worker' && parsed.worker) {
          return generateWorkerCredential(parsed.worker);
        }
      }
    } catch {
      // ignore
    }
    return generateWorkerCredential(WORKER_PERSONAS['ramesh-kumar-9872']);
  });

  // Engine & Health States
  const [isLiveEngine, setIsLiveEngine] = useState<boolean>(false);

  // Underwriting Action Panel States
  const [requestedLoan, setRequestedLoan] = useState<number>(30000);
  const [isTamperMode, setIsTamperMode] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [underwritingResult, setUnderwritingResult] = useState<UnderwritingResult | null>(null);

  // Sync session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('gignite_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.type === 'worker' && parsed.worker) {
          setProfile(parsed.worker);
          setRawCredential(generateWorkerCredential(parsed.worker));
          setActiveRole('worker');
          const defaultLoan = Math.round(parsed.worker.telemetry_summary.monthly_inflow_inr * 0.65 / 1000) * 1000;
          setRequestedLoan(Math.max(10000, defaultLoan));
          return;
        } else if (parsed.type === 'lender' && parsed.lender) {
          setActiveLender(parsed.lender);
          setActiveRole('lender');
          return;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // ----------------------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // ----------------------------------------------------------------------------
  const handleLoginSuccess = (account: { type: 'worker'; worker: ExtendedWorkerProfile } | { type: 'lender'; lender: ExtendedLenderProfile }) => {
    try {
      localStorage.setItem('gignite_current_user', JSON.stringify(account));
      if (account.type === 'worker') {
        localStorage.setItem('gignite_last_email', account.worker.email);
      } else {
        localStorage.setItem('gignite_last_email', account.lender.email);
      }
    } catch {
      // ignore
    }

    if (account.type === 'worker') {
      const newSession: StoredSession = {
        role: 'worker',
        workerId: account.worker.worker_id,
        email: account.worker.email
      };
      localStorage.setItem('gignite_active_session', JSON.stringify(newSession));
      setSession(newSession);
      setProfile(account.worker);
      setRawCredential(generateWorkerCredential(account.worker));
      setActiveRole('worker');
      const defaultLoan = Math.round(account.worker.telemetry_summary.monthly_inflow_inr * 0.65 / 1000) * 1000;
      setRequestedLoan(Math.max(10000, defaultLoan));
    } else {
      const newSession: StoredSession = {
        role: 'lender',
        lenderId: account.lender.id,
        email: account.lender.email
      };
      localStorage.setItem('gignite_active_session', JSON.stringify(newSession));
      setSession(newSession);
      setActiveLender(account.lender);
      setActiveRole('lender');
    }
    setUnderwritingResult(null);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('gignite_active_user');
      localStorage.removeItem('gignite_current_user');
      localStorage.removeItem('gignite_active_session');
      // Retain gignite_last_email so the login input is prefilled
    } catch {
      // ignore
    }
    setSession(null);
    setUnderwritingResult(null);
  };

  // ----------------------------------------------------------------------------
  // WORKER SELECTION HANDLER
  // ----------------------------------------------------------------------------
  const handleSelectWorker = (workerId: string) => {
    const newProfile = WORKER_PERSONAS[workerId] || WORKER_PERSONAS['ramesh-kumar-9872'];
    setProfile(newProfile);
    
    // Update active stored session and current user
    try {
      localStorage.setItem('gignite_current_user', JSON.stringify({ type: 'worker', worker: newProfile }));
      localStorage.setItem('gignite_last_email', newProfile.email);
      if (session?.role === 'worker') {
        const updatedSession: StoredSession = {
          ...session,
          workerId: newProfile.worker_id,
          email: newProfile.email
        };
        localStorage.setItem('gignite_active_session', JSON.stringify(updatedSession));
        setSession(updatedSession);
      }
    } catch {
      // ignore
    }

    // Auto-adjust default loan target to worker's scale
    const defaultLoan = Math.round(newProfile.telemetry_summary.monthly_inflow_inr * 0.65 / 1000) * 1000;
    setRequestedLoan(Math.max(10000, defaultLoan));
    
    // Generate fresh authentic credential for new worker
    const newCred = generateWorkerCredential(newProfile);
    setRawCredential(newCred);
    setUnderwritingResult(null);
  };

  // ----------------------------------------------------------------------------
  // LENDER SELECTION HANDLER
  // ----------------------------------------------------------------------------
  const handleSelectLender = (lenderId: string) => {
    const newLender = LENDER_PERSONAS[lenderId] || LENDER_PERSONAS['finprime-nbfc'];
    setActiveLender(newLender);

    // Update active stored session and current user
    try {
      localStorage.setItem('gignite_current_user', JSON.stringify({ type: 'lender', lender: newLender }));
      localStorage.setItem('gignite_last_email', newLender.email);
      if (session?.role === 'lender') {
        const updatedSession: StoredSession = {
          ...session,
          lenderId: newLender.id,
          email: newLender.email
        };
        localStorage.setItem('gignite_active_session', JSON.stringify(updatedSession));
        setSession(updatedSession);
      }
    } catch {
      // ignore
    }
    
    // Clamp loan request to lender maximum
    if (requestedLoan > newLender.max_limit_inr) {
      setRequestedLoan(newLender.max_limit_inr);
    }
    setUnderwritingResult(null);
  };

  // ----------------------------------------------------------------------------
  // FETCH CREDENTIAL HELPER
  // ----------------------------------------------------------------------------
  const fetchCredential = async (worker: WorkerProfile, loanAmount: number) => {
    try {
      const credRes = await fetch('http://localhost:8000/api/credential/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: worker.worker_id,
          requested_amount: loanAmount,
          disclose_full_history: false
        })
      });
      if (credRes.ok) {
        const credData = await credRes.json();
        setRawCredential(credData);
        return;
      }
    } catch {
      // Fallback local deterministic credential
    }
    setRawCredential(generateWorkerCredential(worker));
  };

  // ----------------------------------------------------------------------------
  // HEALTH POLLING & BACKEND ENGINE CHECK
  // ----------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function checkHealthAndFetch() {
      try {
        const healthRes = await fetch('http://localhost:8000/health');
        if (healthRes.ok) {
          if (isMounted) setIsLiveEngine(true);
        } else {
          if (isMounted) setIsLiveEngine(false);
        }
      } catch {
        if (isMounted) setIsLiveEngine(false);
      }
    }

    checkHealthAndFetch();
    const interval = setInterval(checkHealthAndFetch, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ----------------------------------------------------------------------------
  // RUN ZERO-TRUST UNDERWRITE
  // ----------------------------------------------------------------------------
  const handleUnderwrite = async () => {
    setIsEvaluating(true);
    setUnderwritingResult(null);

    let credentialPayload = rawCredential 
      ? JSON.parse(JSON.stringify(rawCredential)) 
      : JSON.parse(JSON.stringify(generateWorkerCredential(profile)));

    if (isTamperMode) {
      if (credentialPayload.credentialSubject) {
        credentialPayload.credentialSubject.monthlyInflowGte = 85000;
        credentialPayload.credentialSubject.averageMonthlyInflowINR = 85000.0;
      }
    }

    const roundVal = (v: number) => Math.round(v * 100) / 100;

    // Simulate Network Latency for realism
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      // If backend live, attempt call; fallback to comprehensive client evaluator
      if (isLiveEngine && profile.worker_id === 'ramesh-kumar-9872') {
        const response = await fetch('http://localhost:8000/api/lender/underwrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential: credentialPayload,
            loan_amount_requested: requestedLoan
          })
        });

        if (response.ok || response.status === 403) {
          const result = await response.json();
          if (result.decision === 'APPROVED') {
            result.annual_interest_rate_p_a = activeLender.base_apr_p_a;
          }
          setUnderwritingResult(result);
          setIsEvaluating(false);
          return;
        }
      }
    } catch {
      // Continue to local dynamic evaluator
    }

    // Comprehensive Zero-Trust Multi-Lender Rule Engine
    if (isTamperMode) {
      setUnderwritingResult({
        decision: "REJECTED_SECURITY_HALT",
        security_flag: "FRAUD_TAMPER_DETECTED",
        error: "Signature mismatch on canonical payload. Digest altered after issuance.",
        audit_metadata: {
          expected_signature: "5c2a1669b44f57f70bb1d19fca1b1c94b3476fbd2fcc8b017b37b418a81c19e5",
          presented_signature: credentialPayload.proof?.proofValue || "90a874f02c029562bb9d20e207c56c45...",
          computed_digest_sha512: "b9655a058b554246e28e3bbf1fdb4351a38a115f0e5e5913e4e88a8bae3364bc",
          claimed_digest_sha512: credentialPayload.proof?.payloadDigest || "e5a7b6cf901765c010aaef437890b056...",
          verificationMethod: "did:gignite:authority-node-01#key-2026"
        },
        timestamp: new Date().toISOString()
      });
      setIsEvaluating(false);
      return;
    }

    // Rule 1: Check Institutional Min CRI Mandate
    if (profile.cri_score < activeLender.min_cri) {
      const criGap = roundVal(activeLender.min_cri - profile.cri_score);
      setUnderwritingResult({
        decision: "REJECTED_BELOW_MIN_CRI",
        tier: "TIER_3_HIGH_CARE",
        resilience_tier: profile.resilience_tier,
        cri_score: profile.cri_score,
        requested_amount: requestedLoan,
        error: `${profile.worker_name}'s CRI score (${profile.cri_score.toFixed(1)}) is below ${activeLender.name}'s risk threshold (Min CRI ${activeLender.min_cri}). Switch to a flexible desk like MicroFlex Capital or follow the pathway below.`,
        remediation_plan: {
          target_loan_amount: requestedLoan,
          instant_approved_limit: 0,
          funding_gap: requestedLoan,
          target_active_consistency: "80%",
          required_consistency_ratio: 0.80,
          required_monthly_inflow: roundVal(requestedLoan / 0.5),
          inflow_gap_inr: roundVal(Math.max(0, (requestedLoan / 0.5) - profile.telemetry_summary.monthly_inflow_inr)),
          daily_extra_earnings_inr: 450.0,
          daily_extra_trips: 5,
          weekly_extra_trips: 30,
          roadmap_days: 28,
          actionable_milestones: [
            {
              day_range: "Weeks 1-2",
              title: "Active Working Attendance",
              action: "Log at least 5 active working shifts per week to increase consistency ratio from " + profile.telemetry_summary.consistency_rate + " to 80%.",
              target_delta: `+${roundVal(criGap * 0.6)} CRI Score Boost`
            },
            {
              day_range: "Weeks 3-4",
              title: "Peak-Hour Inflow Acceleration",
              action: `Complete ~5 additional delivery orders daily during high-demand slots to boost monthly earnings past ₹${(requestedLoan * 1.5).toLocaleString('en-IN')}.`,
              target_delta: `Qualify for ${activeLender.name} Min CRI ${activeLender.min_cri}`
            }
          ]
        },
        timestamp: new Date().toISOString()
      });
      setIsEvaluating(false);
      return;
    }

    // Rule 2: Prime Full Approval (Within Capacity & Above Min CRI)
    const primeMaxBorrowing = profile.telemetry_summary.monthly_inflow_inr * 0.70;
    if (requestedLoan <= primeMaxBorrowing && requestedLoan <= activeLender.max_limit_inr) {
      const r = (activeLender.base_apr_numeric / 100) / 12;
      const n = activeLender.max_tenure_months;
      const emi = roundVal((requestedLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

      setUnderwritingResult({
        decision: "APPROVED",
        tier: "TIER_1_PRIME",
        resilience_tier: profile.resilience_tier,
        cri_score: profile.cri_score,
        sanctioned_amount: requestedLoan,
        instant_available_limit: requestedLoan,
        requested_amount: requestedLoan,
        max_prime_limit: Math.min(activeLender.max_limit_inr, roundVal(primeMaxBorrowing)),
        annual_interest_rate_p_a: activeLender.base_apr_p_a,
        tenure_months: n,
        monthly_emi_inr: emi,
        total_repayable_inr: roundVal(emi * n),
        counterfactual_needed: false,
        underwriting_audit: {
          verification_status: "CRYPTOGRAPHICALLY_VERIFIED_AUTHENTIC",
          issuer_did: "did:gignite:authority-node-01",
          credential_id: `urn:uuid:${profile.worker_id}-w3c-credential-2026`,
          worker_id: profile.did,
          worker_name: profile.worker_name
        },
        timestamp: new Date().toISOString()
      });
      setIsEvaluating(false);
      return;
    }

    // Rule 3: Conditional Approval with Safe Floor & Growth Remediation
    const safeFloor = roundVal(Math.min(activeLender.max_limit_inr * 0.6, profile.telemetry_summary.monthly_inflow_inr * 0.50));
    const gap = requestedLoan - safeFloor;
    const neededInflow = roundVal(requestedLoan / 0.70);
    const inflowGap = roundVal(Math.max(0, neededInflow - profile.telemetry_summary.monthly_inflow_inr));
    const dailyExtra = roundVal(inflowGap / 30);
    const trips = Math.max(1, Math.ceil(dailyExtra / 85));

    setUnderwritingResult({
      decision: "CONDITIONAL_APPROVAL",
      tier: "TIER_2_GROWTH",
      resilience_tier: profile.resilience_tier,
      cri_score: profile.cri_score,
      instant_available_limit: safeFloor,
      requested_amount: requestedLoan,
      max_prime_limit: activeLender.max_limit_inr,
      annual_interest_rate_p_a: activeLender.base_apr_p_a,
      tenure_months: activeLender.max_tenure_months,
      instant_monthly_emi_inr: roundVal((safeFloor * ((activeLender.base_apr_numeric/100)/12) * Math.pow(1 + (activeLender.base_apr_numeric/100)/12, 6)) / (Math.pow(1 + (activeLender.base_apr_numeric/100)/12, 6) - 1)),
      counterfactual_needed: true,
      remediation_plan: {
        target_loan_amount: requestedLoan,
        instant_approved_limit: safeFloor,
        funding_gap: gap,
        target_active_consistency: "90%",
        required_consistency_ratio: 0.9,
        required_monthly_inflow: neededInflow,
        inflow_gap_inr: inflowGap,
        daily_extra_earnings_inr: dailyExtra,
        daily_extra_trips: trips,
        weekly_extra_trips: trips * 6,
        roadmap_days: 21,
        actionable_milestones: [
          {
            day_range: "Days 1-7",
            title: "Peak-Hour Shift Optimization",
            action: `Add ~${trips} orders daily during peak surge slots to narrow the ₹${inflowGap.toLocaleString('en-IN')} inflow gap.`,
            target_delta: `+₹${(dailyExtra * 7).toLocaleString('en-IN', { maximumFractionDigits: 2 })} weekly inflow`
          },
          {
            day_range: "Days 8-14",
            title: "Attendance & Stability Lock",
            action: "Maintain active working attendance on 6 out of 7 days to eliminate volatility.",
            target_delta: "Zero-volatility consistency flag"
          },
          {
            day_range: "Days 15-21",
            title: "Telemetry Refresh & Full Disbursal",
            action: `Re-issue Verifiable Credential to unlock the remaining ₹${gap.toLocaleString('en-IN', { maximumFractionDigits: 2 })} credit line.`,
            target_delta: `Full ₹${requestedLoan.toLocaleString('en-IN')} Working Capital Disbursal`
          }
        ]
      },
      underwriting_audit: {
        verification_status: "CRYPTOGRAPHICALLY_VERIFIED_AUTHENTIC",
        issuer_did: "did:gignite:authority-node-01",
        credential_id: `urn:uuid:${profile.worker_id}-w3c-credential-2026`,
        worker_id: profile.did,
        worker_name: profile.worker_name
      },
      timestamp: new Date().toISOString()
    });

    setIsEvaluating(false);
  };

  // If no active session, render the Login Page
  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#07030F] text-[#F3F4F6] flex flex-col font-sans selection:bg-purple-600 selection:text-white relative overflow-x-hidden">
      
      {/* Subtle background ambient illumination */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[350px] bg-[#240552]/08 rounded-full blur-[160px] pointer-events-none -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-[#7E22CE]/05 rounded-full blur-[180px] pointer-events-none translate-y-1/2"></div>

      {/* ==================================================================== */}
      {/* GLOBAL TOP NAVIGATION BAR                                            */}
      {/* ==================================================================== */}
      <header className="w-full bg-[#0D061C]/90 backdrop-blur-md border-b border-[#1C0B3B] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: GIgnite Brand Badge */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="w-10 h-10 rounded-2xl bg-[#140929] border border-purple-500/30 flex items-center justify-center shadow-md shadow-purple-950/40 p-1">
              <GIgniteLogo size={32} className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">GIgnite</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#7E22CE]/15 text-[#D8B4FE] border border-purple-500/20 tracking-wider">
                  AIRLOCK
                </span>
              </div>
              <p className="text-[10px] text-[#9CA3AF] font-medium hidden sm:block">
                Zero-Trust Verifiable Financial Identity Engine
              </p>
            </div>
          </div>

          {/* Center: Persistent Segmented Role Switcher */}
          <div className="w-full md:w-auto flex justify-center">
            <RoleNav
              activeRole={activeRole}
              onSelectRole={(role) => setActiveRole(role)}
              hasIssuedCredential={!!rawCredential}
              workerName={profile?.worker_name}
            />
          </div>

          {/* Right: User Pill, Engine Health Indicator & Logout Button */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            
            {/* Live Engine Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07030F] border border-[#1C0B3B]">
              {isLiveEngine ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span className="text-[11px] font-bold text-[#10B981] tracking-wider font-mono">LIVE</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-[11px] font-bold text-amber-400 tracking-wider font-mono">MOCK</span>
                </>
              )}
            </div>

            {/* Logged in User Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#140929] border border-purple-500/30 text-xs">
              <span className="text-[#9CA3AF]">Logged in:</span>
              <span className="font-bold text-white truncate max-w-[120px]">
                {activeRole === 'worker' ? profile.worker_name.split(' ')[0] : activeLender.name.split(' ')[0]}
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#180933] border border-[#1C0B3B] hover:border-rose-500/40 text-xs font-semibold text-[#9CA3AF] hover:text-rose-300 transition-colors cursor-pointer"
              title="Sign Out to Login Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN VIEW CONTAINER                                                  */}
      {/* ==================================================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {activeRole === 'worker' ? (
          <WorkerView
            profile={profile}
            rawCredential={rawCredential}
            onSelectWorker={handleSelectWorker}
            onSendToLender={() => setActiveRole('lender')}
            onRefreshCredential={() => fetchCredential(profile, requestedLoan)}
          />
        ) : (
          <LenderView
            profile={profile}
            rawCredential={rawCredential}
            activeLender={activeLender}
            onSelectLender={handleSelectLender}
            requestedLoan={requestedLoan}
            setRequestedLoan={setRequestedLoan}
            isTamperMode={isTamperMode}
            setIsTamperMode={setIsTamperMode}
            isEvaluating={isEvaluating}
            underwritingResult={underwritingResult}
            onExecuteUnderwrite={handleUnderwrite}
          />
        )}
      </main>

      {/* Footer Strip */}
      <footer className="w-full border-t border-[#1C0B3B] py-4 text-center text-xs text-[#6B7280] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GIgnite Protocol • Multi-Tenant Verifiable Identity Architecture</span>
          <span>RFC 8785 Canonical JSON • Ed25519 Cryptographic Proofs</span>
        </div>
      </footer>

    </div>
  );
}
