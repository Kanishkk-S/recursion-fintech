import { useState, useEffect } from 'react';
import { GIgniteLogo } from './components/GIgniteLogo';
import { RoleNav } from './components/RoleNav';
import { WorkerView } from './components/WorkerView';
import { LenderView } from './components/LenderView';
import type { WorkerProfile, W3CCredential, UnderwritingResult } from './types';

// ==============================================================================
// DETERMINISTIC STATIC FALLBACK FIXTURE
// ==============================================================================

const FALLBACK_PROFILE: WorkerProfile = {
  worker_id: "ramesh-kumar-9872",
  worker_name: "Ramesh Kumar",
  did: "did:india:worker:ramesh-kumar-9872",
  category: "Urban Micro-Mobility & Food Delivery Partner",
  credit_bureau_status: "THIN_FILE_NO_CIBIL_RECORD",
  platform_badges: ["Swiggy", "Uber India"],
  platform_details: [
    {
      platform: "Swiggy",
      role: "Food Delivery Partner",
      rating: 4.92,
      trips_completed: 1420,
      verified_active: true,
      payout_frequency: "Weekly",
      badge: "Swiggy Star Rider",
      payout_amount_inr: 27450.00
    },
    {
      platform: "Uber India",
      role: "Premier Ride Driver",
      rating: 4.88,
      trips_completed: 890,
      verified_active: true,
      payout_frequency: "Daily Instant",
      badge: "Uber Diamond Partner",
      payout_amount_inr: 21616.00
    }
  ],
  telemetry_summary: {
    telemetry_period_days: 180,
    active_working_days: 169,
    active_days_ratio: 0.9389,
    consistency_rate: "93.5%",
    consistency_ratio: 0.935,
    stability_rate: "100.0%",
    stability_index: 1.0,
    monthly_inflow_inr: 49066.00,
    gross_earnings_180d_inr: 294396.12,
    net_earnings_180d_inr: 231590.25,
    zero_income_weeks: 0
  },
  cri_score: 88.7,
  resilience_tier: "PRIME_RESILIENT",
  max_prime_credit_limit_inr: 34346.20,
  instant_safe_floor_inr: 24500.00
};

const FALLBACK_CREDENTIAL: W3CCredential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.org",
    "https://gignite.network/credentials/v2"
  ],
  id: "urn:uuid:60e219e385dae5c0d090ec785b056a40",
  type: ["VerifiableCredential", "CashFlowResilienceCredential"],
  issuer: {
    id: "did:gignite:authority-node-01",
    name: "GIgnite Autonomous Financial Identity Authority"
  },
  issuanceDate: new Date().toISOString(),
  expirationDate: "2026-12-31T23:59:59Z",
  credentialSubject: {
    id: "did:india:worker:ramesh-kumar-9872",
    workerName: "Ramesh Kumar",
    workerCategory: "Urban Delivery & Mobility Partner",
    platforms: ["Swiggy", "Uber India"],
    telemetryPeriodDays: 180,
    cri_score: 88.7,
    cashFlowResilienceScore: 88.7,
    resilience_tier: "PRIME_RESILIENT",
    scoreTier: "Prime Resilience (Tier-1 Low Risk)",
    monthlyInflowGte: 25000,
    averageMonthlyInflowINR: 49066.0,
    consistencyRatio: 0.935,
    stabilityIndex: 1.0,
    zeroIncomeWeeksCount: 0,
    selectiveDisclosure: {
      rawLocationTelemetryDisclosed: false,
      rawCustomerDetailsDisclosed: false,
      discloseFullHistory: false,
      verifiedMinIncomeGuaranteedINR: 25000,
      isUnderwritingAuditReady: true
    }
  },
  proof: {
    type: "Ed25519Signature2020",
    created: new Date().toISOString(),
    verificationMethod: "did:gignite:authority-node-01#key-2026",
    proofPurpose: "assertionMethod",
    proofValue: "90a874f02c029562bb9d20e207c56c45731bd1fbb8912efc464aa76948b8ca705b76bc2ebad21c97a892b1574a7d664c3905cfebaa63d3e23298a086b3cc7337",
    payloadDigest: "e5a7b6cf901765c010aaef437890b056f71295328901cb0098fca201e5b87190e5a7b6cf901765c010aaef437890b056f71295328901cb0098fca201e5b87190"
  }
};

// ==============================================================================
// MAIN APPLICATION
// ==============================================================================

export default function App() {
  // Role Navigation State
  const [activeRole, setActiveRole] = useState<'worker' | 'lender'>('worker');

  // Engine & Profile States
  const [isLiveEngine, setIsLiveEngine] = useState<boolean>(false);
  const [profile, setProfile] = useState<WorkerProfile>(FALLBACK_PROFILE);
  const [rawCredential, setRawCredential] = useState<W3CCredential | null>(FALLBACK_CREDENTIAL);

  // Underwriting Action Panel States
  const [requestedLoan, setRequestedLoan] = useState<number>(30000);
  const [isTamperMode, setIsTamperMode] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [underwritingResult, setUnderwritingResult] = useState<UnderwritingResult | null>(null);

  // ----------------------------------------------------------------------------
  // INITIAL DATA FETCH & HEALTH POLLING
  // ----------------------------------------------------------------------------
  const fetchCredential = async (loanAmount: number = 30000) => {
    try {
      const credRes = await fetch('http://localhost:8000/api/credential/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: 'ramesh-kumar-9872',
          requested_amount: loanAmount,
          disclose_full_history: false
        })
      });
      if (credRes.ok) {
        const credData = await credRes.json();
        setRawCredential(credData);
      }
    } catch {
      setRawCredential(FALLBACK_CREDENTIAL);
    }
  };

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

      try {
        const profileRes = await fetch('http://localhost:8000/api/worker/profile?worker_id=ramesh-kumar-9872');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (isMounted) {
            setProfile(profileData);
          }
        }
      } catch (e) {
        console.warn('Backend profile fetch failed, using fallback profile.', e);
      }

      if (isMounted) {
        await fetchCredential(requestedLoan);
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

    let credentialPayload = rawCredential ? JSON.parse(JSON.stringify(rawCredential)) : JSON.parse(JSON.stringify(FALLBACK_CREDENTIAL));

    if (isTamperMode) {
      if (credentialPayload.credentialSubject) {
        credentialPayload.credentialSubject.monthlyInflowGte = 85000;
        credentialPayload.credentialSubject.averageMonthlyInflowINR = 85000.0;
      }
    }

    try {
      const response = await fetch('http://localhost:8000/api/lender/underwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialPayload,
          loan_amount_requested: requestedLoan
        })
      });

      const result = await response.json();
      setUnderwritingResult(result);
    } catch (err) {
      console.warn('Backend API request failed, executing client-side zero-trust evaluator fallback:', err);
      const roundVal = (v: number) => Math.round(v * 100) / 100;

      if (isTamperMode) {
        setUnderwritingResult({
          decision: "REJECTED_SECURITY_HALT",
          security_flag: "FRAUD_TAMPER_DETECTED",
          error: "Signature mismatch on canonical payload",
          audit_metadata: {
            expected_signature: "5c2a1669b44f57f70bb1d19fca1b1c94b3476fbd2fcc8b017b37b418a81c19e5",
            presented_signature: credentialPayload.proof?.proofValue || "90a874f02c029562bb9d20e207c56c45...",
            computed_digest_sha512: "b9655a058b554246e28e3bbf1fdb4351a38a115f0e5e5913e4e88a8bae3364bc",
            claimed_digest_sha512: credentialPayload.proof?.payloadDigest || "e5a7b6cf901765c010aaef437890b056...",
            verificationMethod: "did:gignite:authority-node-01#key-2026"
          },
          timestamp: new Date().toISOString()
        });
      } else if (requestedLoan <= 35000) {
        const r = (11.5 / 100) / 12;
        const n = 12;
        const emi = roundVal((requestedLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
        setUnderwritingResult({
          decision: "APPROVED",
          tier: "TIER_1_PRIME",
          resilience_tier: "PRIME_RESILIENT",
          cri_score: 88.7,
          sanctioned_amount: requestedLoan,
          instant_available_limit: requestedLoan,
          requested_amount: requestedLoan,
          max_prime_limit: 35000.0,
          annual_interest_rate_p_a: "11.5%",
          tenure_months: 12,
          monthly_emi_inr: emi,
          total_repayable_inr: roundVal(emi * 12),
          counterfactual_needed: false,
          remediation_plan: undefined,
          underwriting_audit: {
            verification_status: "CRYPTOGRAPHICALLY_VERIFIED_AUTHENTIC",
            issuer_did: "did:gignite:authority-node-01",
            credential_id: "urn:uuid:60e219e385dae5c0d090ec785b056a40",
            worker_id: profile.did,
            worker_name: profile.worker_name
          },
          timestamp: new Date().toISOString()
        });
      } else {
        const floor = 24500.0;
        const gap = requestedLoan - floor;
        const neededInflow = roundVal(requestedLoan / 0.70);
        const inflowGap = roundVal(Math.max(0, neededInflow - 49066.0));
        const dailyExtra = roundVal(inflowGap / 30);
        const trips = Math.max(1, Math.ceil(dailyExtra / 85));

        setUnderwritingResult({
          decision: "CONDITIONAL_APPROVAL",
          tier: "TIER_2_GROWTH",
          resilience_tier: "PRIME_RESILIENT",
          cri_score: 88.7,
          instant_available_limit: floor,
          requested_amount: requestedLoan,
          max_prime_limit: 35000.0,
          annual_interest_rate_p_a: "13.5%",
          tenure_months: 6,
          instant_monthly_emi_inr: 4245.58,
          counterfactual_needed: true,
          remediation_plan: {
            target_loan_amount: requestedLoan,
            instant_approved_limit: floor,
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
                action: `Add ~${trips} delivery/ride trips daily during dinner surge slots (19:00 - 22:30).`,
                target_delta: `+₹${(dailyExtra * 7).toLocaleString('en-IN', { maximumFractionDigits: 2 })} weekly inflow`
              },
              {
                day_range: "Days 8-14",
                title: "Consistency & Attendance Lock",
                action: "Maintain active working attendance on 6 out of 7 days (reach 90% shift regularity).",
                target_delta: "Zero-volatility consistency flag"
              },
              {
                day_range: "Days 15-21",
                title: "Telemetry Refresh & Auto-Unlock",
                action: `Re-issue Verifiable Credential to automatically unlock the remaining ₹${gap.toLocaleString('en-IN', { maximumFractionDigits: 2 })} credit line.`,
                target_delta: `Full ₹${requestedLoan.toLocaleString('en-IN')} Working Capital Disbursal`
              }
            ]
          },
          underwriting_audit: {
            verification_status: "CRYPTOGRAPHICALLY_VERIFIED_AUTHENTIC",
            issuer_did: "did:gignite:authority-node-01",
            credential_id: "urn:uuid:60e219e385dae5c0d090ec785b056a40",
            worker_id: profile.did,
            worker_name: profile.worker_name
          },
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

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
                  FINTECH AIRLOCK
                </span>
              </div>
              <p className="text-[10px] text-[#9CA3AF] font-medium hidden sm:block">
                Cryptographic Financial Identity for Gig Workers
              </p>
            </div>
          </div>

          {/* Center: Persistent Segmented Role Switcher */}
          <div className="w-full md:w-auto flex justify-center">
            <RoleNav
              activeRole={activeRole}
              onSelectRole={(role) => setActiveRole(role)}
              hasIssuedCredential={!!rawCredential}
            />
          </div>

          {/* Right: Engine Health Indicator */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07030F] border border-[#1C0B3B]">
              {isLiveEngine ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span className="text-[11px] font-bold text-[#10B981] tracking-wider font-mono">LIVE ENGINE</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-[11px] font-bold text-amber-400 tracking-wider font-mono">MOCK FIXTURE MODE</span>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN VIEW CONTENT CONTAINER                                          */}
      {/* ==================================================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {activeRole === 'worker' ? (
          <WorkerView
            profile={profile}
            rawCredential={rawCredential}
            onSendToLender={() => setActiveRole('lender')}
            onRefreshCredential={() => fetchCredential(requestedLoan)}
          />
        ) : (
          <LenderView
            profile={profile}
            rawCredential={rawCredential}
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
          <span>GIgnite Protocol • Zero-Trust Verifiable Identity Architecture</span>
          <span>RFC 8785 Canonical JSON • Ed25519 Cryptographic Proofs</span>
        </div>
      </footer>

    </div>
  );
}
