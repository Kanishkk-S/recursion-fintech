import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Landmark,
  Fingerprint,
  Search,
  Lock,
  Zap,
  CheckCircle2,
  TrendingUp,
  Wallet,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Cpu,
  Car,
  Bike,
  Calendar
} from 'lucide-react';

// ==============================================================================
// TYPE DEFINITIONS
// ==============================================================================

interface PlatformRecord {
  platform: string;
  role: string;
  rating: number;
  trips_completed: number;
  verified_active: boolean;
  payout_frequency: string;
  badge: string;
  payout_amount_inr: number;
}

interface WorkerTelemetry {
  telemetry_period_days: number;
  active_working_days: number;
  active_days_ratio: number;
  consistency_rate: string;
  consistency_ratio: number;
  stability_rate: string;
  stability_index: number;
  monthly_inflow_inr: number;
  gross_earnings_180d_inr: number;
  net_earnings_180d_inr: number;
  zero_income_weeks: number;
}

interface WorkerProfile {
  worker_id: string;
  worker_name: string;
  did: string;
  category: string;
  credit_bureau_status: string;
  platform_badges: string[];
  platform_details?: PlatformRecord[];
  telemetry_summary: WorkerTelemetry;
  cri_score: number;
  resilience_tier: string;
  max_prime_credit_limit_inr: number;
  instant_safe_floor_inr: number;
}

interface UnderwritingResult {
  decision: string;
  security_flag?: string;
  error?: string;
  tier?: string;
  resilience_tier?: string;
  cri_score?: number;
  sanctioned_amount?: number;
  instant_available_limit?: number;
  requested_amount?: number;
  max_prime_limit?: number;
  annual_interest_rate_p_a?: string;
  tenure_months?: number;
  monthly_emi_inr?: number;
  instant_monthly_emi_inr?: number;
  total_repayable_inr?: number;
  counterfactual_needed?: boolean;
  remediation_plan?: {
    target_loan_amount: number;
    instant_approved_limit: number;
    funding_gap: number;
    target_active_consistency: string;
    required_consistency_ratio: number;
    required_monthly_inflow: number;
    inflow_gap_inr: number;
    daily_extra_earnings_inr: number;
    daily_extra_trips: number;
    weekly_extra_trips: number;
    roadmap_days: number;
    actionable_milestones: Array<{
      day_range: string;
      title: string;
      action: string;
      target_delta: string;
    }>;
  };
  audit_metadata?: {
    expected_signature?: string;
    presented_signature?: string;
    computed_digest_sha512?: string;
    claimed_digest_sha512?: string;
    verificationMethod?: string;
  };
  underwriting_audit?: {
    verification_status: string;
    issuer_did: string;
    credential_id: string;
    worker_id: string;
    worker_name: string;
  };
  timestamp?: string;
}

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

// ==============================================================================
// MAIN APP COMPONENT
// ==============================================================================

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'credentials' | 'telemetry' | 'underwriter'>('dashboard');

  // Engine & Profile States
  const [isLiveEngine, setIsLiveEngine] = useState<boolean>(false);
  const [profile, setProfile] = useState<WorkerProfile>(FALLBACK_PROFILE);
  const [rawCredential, setRawCredential] = useState<any>(null);

  // Search & Copy states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedDid, setCopiedDid] = useState<boolean>(false);

  // Underwriting Action Panel States
  const [requestedLoan, setRequestedLoan] = useState<number>(30000);
  const [isTamperMode, setIsTamperMode] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [underwritingResult, setUnderwritingResult] = useState<UnderwritingResult | null>(null);

  // ----------------------------------------------------------------------------
  // INITIAL DATA FETCH & HEALTH POLLING
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

      try {
        const profileRes = await fetch('http://localhost:8000/api/worker/profile?worker_id=ramesh-kumar-9872');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (isMounted) {
            setProfile(profileData);
          }
        }
      } catch (e) {
        console.warn('Backend profile fetch failed, operating in mock fallback mode.', e);
      }

      // Fetch or issue initial authentic credential
      try {
        const credRes = await fetch('http://localhost:8000/api/credential/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id: 'ramesh-kumar-9872',
            requested_amount: requestedLoan,
            disclose_full_history: false
          })
        });
        if (credRes.ok) {
          const credData = await credRes.json();
          if (isMounted) setRawCredential(credData);
        }
      } catch {
        // Fallback local credential
        const fallbackCred = {
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
        if (isMounted) setRawCredential(fallbackCred);
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
  // COPY DID HANDLER
  // ----------------------------------------------------------------------------
  const handleCopyDid = () => {
    navigator.clipboard.writeText(profile.did);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  // ----------------------------------------------------------------------------
  // RUN ZERO-TRUST UNDERWRITE
  // ----------------------------------------------------------------------------
  const handleUnderwrite = async () => {
    setIsEvaluating(true);
    setUnderwritingResult(null);

    let credentialPayload = rawCredential ? JSON.parse(JSON.stringify(rawCredential)) : null;

    if (!credentialPayload) {
      credentialPayload = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        id: "urn:uuid:60e219e385dae5c0d090ec785b056a40",
        credentialSubject: {
          id: profile.did,
          workerName: profile.worker_name,
          monthlyInflowGte: 25000,
          averageMonthlyInflowINR: 49066.0,
          cri_score: 88.7,
          consistencyRatio: 0.935
        },
        proof: {
          type: "Ed25519Signature2020",
          proofValue: "90a874f02c029562bb9d20e207c56c45",
          payloadDigest: "e5a7b6cf901765c010aaef437890b056"
        }
      };
    }

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

  const roundVal = (v: number) => Math.round(v * 100) / 100;

  // Real-time slider calculation preview
  const estimatedPreview = useMemo(() => {
    const isPrime = requestedLoan <= 35000;
    const rate = isPrime ? 11.5 : 13.5;
    const tenure = isPrime ? 12 : 6;
    const r = (rate / 100) / 12;
    const n = tenure;
    const emi = (requestedLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return {
      rate: `${rate}%`,
      tenure: `${tenure} Mo`,
      emi: isNaN(emi) ? 0 : Math.round(emi),
      isPrime
    };
  }, [requestedLoan]);

  return (
    <div className="min-h-screen bg-[#05020C] text-[#F5F5F6] flex flex-col font-sans selection:bg-[#A231C4] selection:text-white relative overflow-x-hidden">
      
      {/* Ambient background cosmic violet orb glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[500px] bg-[#240552]/25 rounded-full blur-[140px] pointer-events-none -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#A231C4]/15 rounded-full blur-[160px] pointer-events-none translate-y-1/2"></div>

      {/* ==================================================================== */}
      {/* 3-COLUMN LAYOUT WITH AI MANIFESTATION COACH COSMIC PURPLE TEMPLATE  */}
      {/* ==================================================================== */}
      <div className="flex-1 w-full max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen border-x border-[#240552]/40 relative z-10 backdrop-blur-[1px]">
        
        {/* ------------------------------------------------------------------ */}
        {/* COLUMN 1: LEFT NAVIGATION SIDEBAR (2.5 Cols on Desktop)             */}
        {/* ------------------------------------------------------------------ */}
        <aside className="lg:col-span-3 xl:col-span-2 bg-[#0B0518]/90 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-[#240552]/40 flex flex-col justify-between p-5">
          <div className="flex flex-col gap-6">
            
            {/* Brand Logo & Airlock Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-[#240552]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl purple-magenta-gradient flex items-center justify-center shadow-lg shadow-purple-900/40 border border-purple-400/40">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg tracking-tight text-[#F5F5F6]">GIgnite</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#A231C4]/20 text-[#A231C4] border border-[#A231C4]/40 tracking-wider">
                      AIRLOCK
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9F9EA2] font-medium">Fintech Zero-Trust Protocol</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#240552]/60 text-[#F5F5F6] border border-[#A231C4]/40 shadow-sm glow-purple'
                    : 'text-[#9F9EA2] hover:text-[#F5F5F6] hover:bg-[#140929]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-[#A231C4]" />
                  <span>Dashboard</span>
                </div>
                {activeTab === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-[#A231C4] shadow-sm shadow-[#A231C4]"></span>}
              </button>

              <button
                onClick={() => setActiveTab('credentials')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'credentials'
                    ? 'bg-[#240552]/60 text-[#F5F5F6] border border-[#A231C4]/40 shadow-sm glow-purple'
                    : 'text-[#9F9EA2] hover:text-[#F5F5F6] hover:bg-[#140929]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#4D22E6]" />
                  <span>W3C Credentials</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1B0B38] text-[#9F9EA2] font-mono border border-[#240552]">v2.0</span>
              </button>

              <button
                onClick={() => setActiveTab('telemetry')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'telemetry'
                    ? 'bg-[#240552]/60 text-[#F5F5F6] border border-[#A231C4]/40 shadow-sm glow-purple'
                    : 'text-[#9F9EA2] hover:text-[#F5F5F6] hover:bg-[#140929]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                  <span>Live Telemetry</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-sm shadow-emerald-500"></span>
              </button>

              <button
                onClick={() => setActiveTab('underwriter')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'underwriter'
                    ? 'bg-[#240552]/60 text-[#F5F5F6] border border-[#A231C4]/40 shadow-sm glow-purple'
                    : 'text-[#9F9EA2] hover:text-[#F5F5F6] hover:bg-[#140929]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Landmark className="w-4 h-4 text-[#A231C4]" />
                  <span>Underwriter Sandbox</span>
                </div>
              </button>
            </nav>

            {/* Quick Oracle Spec Card */}
            <div className="bg-[#140929]/80 p-3.5 rounded-2xl border border-[#240552]/50 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between text-[#9F9EA2] font-medium">
                <span className="flex items-center gap-1.5 text-[#F5F5F6]">
                  <Cpu className="w-3.5 h-3.5 text-[#A231C4]" />
                  Oracle Spec
                </span>
                <span className="text-[11px] text-[#10B981] font-mono">RFC 8785</span>
              </div>
              <div className="flex flex-col gap-1 text-[11px] text-[#9F9EA2] font-mono">
                <div className="flex justify-between">
                  <span>Signer:</span>
                  <span className="text-[#F5F5F6] truncate max-w-[100px]">Ed25519-HSM</span>
                </div>
                <div className="flex justify-between">
                  <span>Digest:</span>
                  <span className="text-[#A231C4] font-semibold">SHA-512</span>
                </div>
                <div className="flex justify-between">
                  <span>Proof:</span>
                  <span className="text-[#10B981]">Zero-Trust</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Profile Pin: Decentralized ID */}
          <div className="pt-4 border-t border-[#240552]/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#1E0E3E] border border-[#240552] flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 text-[#A231C4]" />
                </div>
                <span className="text-xs font-semibold text-[#F5F5F6]">Worker DID</span>
              </div>
              <button
                onClick={handleCopyDid}
                title="Copy DID"
                className="p-1 rounded-lg hover:bg-[#1E0E3E] text-[#9F9EA2] hover:text-[#F5F5F6] transition-colors cursor-pointer"
              >
                {copiedDid ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#05020C] border border-[#240552]/60 text-[10px] font-mono text-[#9F9EA2] truncate">
              {profile.did}
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------------ */}
        {/* COLUMN 2: MAIN WORKSPACE / TELEMETRY FEED (5.5-6 Cols)              */}
        {/* ------------------------------------------------------------------ */}
        <section className="lg:col-span-5 xl:col-span-6 bg-[#05020C]/90 p-5 lg:p-7 flex flex-col gap-6 overflow-y-auto max-h-screen">
          
          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#65636A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verifiable streams, DID hashes, zk-proofs..."
                className="w-full bg-[#0E071D] border border-[#240552]/60 rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F6] placeholder-[#65636A] focus:outline-none focus:border-[#A231C4] transition-colors"
              />
            </div>

            {/* Engine Status & Worker Badge */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Dynamic Status Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0E071D] border border-[#240552]/60">
                {isLiveEngine ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-sm shadow-emerald-500"></span>
                    <span className="text-[11px] font-bold text-[#10B981] tracking-wider font-mono">LIVE ENGINE</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-[11px] font-bold text-amber-400 tracking-wider font-mono">MOCK FIXTURE MODE</span>
                  </>
                )}
              </div>

              {/* User Avatar Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#240552]/50">
                <div className="w-8 h-8 rounded-full p-[1.5px] purple-magenta-gradient shadow-md shadow-purple-900/30">
                  <div className="w-full h-full bg-[#0E071D] rounded-full flex items-center justify-center font-bold text-xs text-[#F5F5F6]">
                    RK
                  </div>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-[#F5F5F6] leading-none">{profile.worker_name}</span>
                  <span className="text-[10px] text-[#A231C4] font-medium leading-tight">Tier 1 Gig Partner</span>
                </div>
              </div>
            </div>
          </header>

          {/* ================================================================ */}
          {/* HERO CREDENTIAL CARD (Cosmic Purple/Magenta Metallic Finish)     */}
          {/* ================================================================ */}
          <div className="cosmic-hero-gradient rounded-3xl p-6 border border-[#A231C4]/40 relative overflow-hidden shadow-2xl glow-purple group transition-all duration-300">
            {/* Ambient radial lighting flares */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#A231C4]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#4D22E6]/25 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

            {/* Card Top Row: W3C Badge & Chip Styling */}
            <div className="flex items-center justify-between relative z-10 mb-6">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0E071D]/90 border border-[#A231C4]/40 backdrop-blur-md">
                <Lock className="w-3.5 h-3.5 text-[#A231C4]" />
                <span className="text-xs font-semibold text-[#F5F5F6] tracking-wide">W3C Verifiable Credential</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#9F9EA2] uppercase tracking-widest">GIgnite Oracle</span>
                <div className="w-9 h-6 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/40 opacity-90 shadow-inner"></div>
              </div>
            </div>

            {/* Card Middle Row: Prominent CRI Score Display */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10 my-4">
              <div>
                <span className="text-xs font-medium text-[#9F9EA2] tracking-wider uppercase">Cash-Flow Resilience Index</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-5xl lg:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                    {profile.cri_score.toFixed(1)}
                  </span>
                  <span className="text-[#9F9EA2] font-mono text-sm font-semibold">/ 100</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#A231C4]/25 text-white border border-[#A231C4]/50 text-xs font-bold font-mono tracking-wide shadow-sm shadow-purple-900/40">
                    {profile.resilience_tier.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Platform Multi-Tenancy Badges */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold">
                  <Bike className="w-3.5 h-3.5" />
                  <span>Swiggy</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1E0E3E] border border-[#240552] text-[#F5F5F6] text-xs font-semibold">
                  <Car className="w-3.5 h-3.5 text-[#4D22E6]" />
                  <span>Uber India</span>
                </div>
              </div>
            </div>

            {/* Card Lower Strip */}
            <div className="pt-4 mt-4 border-t border-[#240552]/80 flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center gap-2 font-mono">
                <Fingerprint className="w-4 h-4 text-[#A231C4]" />
                <span className="text-[#9F9EA2] font-medium">Ed25519 • RFC 8785 Canonical</span>
              </div>
              <div className="text-right">
                <span className="text-[#9F9EA2] block text-[10px] uppercase tracking-wider">Attested Inflow</span>
                <span className="text-base font-bold font-mono text-[#10B981]">
                  ₹{profile.telemetry_summary.monthly_inflow_inr.toLocaleString('en-IN')} <span className="text-xs text-[#9F9EA2] font-normal">/ mo</span>
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* TELEMETRY SUMMARY CARDS                                          */}
          {/* ================================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* Shift Consistency Card */}
            <div className="bg-[#0E071D] p-4 rounded-2xl border border-[#240552]/60 flex flex-col justify-between hover:border-[#A231C4]/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-[#9F9EA2] font-medium mb-2">
                <span>Shift Consistency</span>
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mb-2">
                {profile.telemetry_summary.consistency_rate}
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[#180C33] h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: '93.5%' }}></div>
              </div>
              <span className="text-[10px] text-[#65636A] mt-2 font-mono">169 / 180 Active Shift Days</span>
            </div>

            {/* Cash Flow Stability Card */}
            <div className="bg-[#0E071D] p-4 rounded-2xl border border-[#240552]/60 flex flex-col justify-between hover:border-[#A231C4]/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-[#9F9EA2] font-medium mb-2">
                <span>Income Stability</span>
                <Activity className="w-4 h-4 text-[#A231C4]" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mb-2">
                {profile.telemetry_summary.stability_rate}
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[#180C33] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#A231C4] to-[#4D22E6] h-full rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
              </div>
              <span className="text-[10px] text-[#65636A] mt-2 font-mono">0 Zero-Income Week Breaches</span>
            </div>

            {/* Active Platform Period Card */}
            <div className="bg-[#0E071D] p-4 rounded-2xl border border-[#240552]/60 flex flex-col justify-between hover:border-[#A231C4]/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-[#9F9EA2] font-medium mb-2">
                <span>Telemetry Period</span>
                <Calendar className="w-4 h-4 text-[#4D22E6]" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mb-2">
                {profile.telemetry_summary.telemetry_period_days} <span className="text-sm font-normal text-[#9F9EA2]">Days</span>
              </div>
              <div className="w-full bg-[#180C33] h-2 rounded-full overflow-hidden">
                <div className="bg-[#4D22E6] h-full rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
              </div>
              <span className="text-[10px] text-[#65636A] mt-2 font-mono">Dual Swiggy + Uber Telemetry</span>
            </div>

          </div>

          {/* ================================================================ */}
          {/* INFLOW LEDGER (zkTLS Verified Platform Payouts)                  */}
          {/* ================================================================ */}
          <div className="bg-[#0E071D] rounded-3xl p-5 border border-[#240552]/60 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-[#A231C4]" />
                <h3 className="text-sm font-bold text-white tracking-wide">Attested Inflow Ledger</h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#A231C4]/15 text-[#A231C4] border border-[#A231C4]/30 font-semibold">
                zkTLS Dual-Oracle
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Swiggy Payout Item */}
              <div className="bg-[#140929] p-4 rounded-2xl border border-[#240552]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#A231C4]/40 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#F5F5F6]">Swiggy Partner Payout</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        zkTLS Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#9F9EA2] mt-0.5">
                      1,420 delivery trips • Customer Rating: <span className="text-amber-400 font-semibold font-mono">★ 4.92</span>
                    </p>
                  </div>
                </div>
                <div className="text-right sm:shrink-0">
                  <span className="text-base font-bold font-mono text-[#10B981]">+₹27,450.00</span>
                  <span className="text-[11px] text-[#65636A] block font-mono">Weekly Direct Settlement</span>
                </div>
              </div>

              {/* Uber Driver Settlement Item */}
              <div className="bg-[#140929] p-4 rounded-2xl border border-[#240552]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#A231C4]/40 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1E0E3E] border border-[#240552] flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 text-[#4D22E6]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#F5F5F6]">Uber Driver Settlement</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        zkTLS Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#9F9EA2] mt-0.5">
                      890 ride journeys • Customer Rating: <span className="text-amber-400 font-semibold font-mono">★ 4.88</span>
                    </p>
                  </div>
                </div>
                <div className="text-right sm:shrink-0">
                  <span className="text-base font-bold font-mono text-[#10B981]">+₹21,616.00</span>
                  <span className="text-[11px] text-[#65636A] block font-mono">Daily Instant Payout</span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* ------------------------------------------------------------------ */}
        {/* COLUMN 3: RIGHT ACTION PANEL (Lender Underwriting & Sandbox) (4-4.5) */}
        {/* ------------------------------------------------------------------ */}
        <section className="lg:col-span-4 xl:col-span-4 bg-[#0B0518]/95 border-t lg:border-t-0 lg:border-l border-[#240552]/40 p-5 lg:p-6 flex flex-col gap-5 overflow-y-auto max-h-screen">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#240552]/50">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#A231C4]" />
              <h2 className="font-bold text-base text-white">Lender Underwriting</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A231C4]/20 text-[#A231C4] border border-[#A231C4]/40 font-semibold">
              SANDBOX v2
            </span>
          </div>

          {/* ================================================================ */}
          {/* LOAN AMOUNT SLIDER & PREVIEW                                     */}
          {/* ================================================================ */}
          <div className="bg-[#140929] p-5 rounded-2xl border border-[#240552]/60 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9F9EA2]">Target Working Capital Loan</span>
              <span className="text-xl font-bold font-mono text-white">
                ₹{requestedLoan.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Slider Input */}
            <input
              type="range"
              min={10000}
              max={60000}
              step={2500}
              value={requestedLoan}
              onChange={(e) => setRequestedLoan(Number(e.target.value))}
              className="w-full h-2 bg-[#1E0E3E] rounded-lg appearance-none cursor-pointer accent-[#A231C4]"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-[#65636A]">
              <span>Min: ₹10,000</span>
              <span className="text-amber-400 font-semibold">Prime Limit: ₹35,000</span>
              <span>Max: ₹60,000</span>
            </div>

            {/* Real-time Calculation Preview */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#240552]/50 text-center">
              <div className="bg-[#0E071D] p-2 rounded-xl border border-[#240552]/50">
                <span className="text-[10px] text-[#65636A] block">Est. Rate</span>
                <span className="text-xs font-bold font-mono text-[#A231C4]">{estimatedPreview.rate}</span>
              </div>
              <div className="bg-[#0E071D] p-2 rounded-xl border border-[#240552]/50">
                <span className="text-[10px] text-[#65636A] block">Tenure</span>
                <span className="text-xs font-bold font-mono text-[#F5F5F6]">{estimatedPreview.tenure}</span>
              </div>
              <div className="bg-[#0E071D] p-2 rounded-xl border border-[#240552]/50">
                <span className="text-[10px] text-[#65636A] block">Est. Monthly EMI</span>
                <span className="text-xs font-bold font-mono text-[#10B981]">₹{estimatedPreview.emi.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* TAMPER SANDBOX SWITCH (Attacker Simulation)                      */}
          {/* ================================================================ */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isTamperMode 
              ? 'bg-[#3A0A1C]/50 border-rose-500/60 shadow-lg glow-rose' 
              : 'bg-[#140929] border-[#240552]/60'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isTamperMode ? 'bg-rose-500/20 text-rose-400' : 'bg-[#1E0E3E] text-[#9F9EA2]'
                }`}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Simulate 1-Bit Payload Tamper</h4>
                  <p className="text-[10px] text-[#9F9EA2] mt-0.5">Alters monthlyInflowGte: ₹25k ➔ ₹85k</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isTamperMode}
                  onChange={(e) => setIsTamperMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#1E0E3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <p className="text-[11px] text-[#9F9EA2] mt-2.5 pt-2.5 border-t border-[#240552]/60 leading-relaxed font-mono">
              {isTamperMode ? (
                <span className="text-rose-400 font-semibold">
                  ⚠️ Tampering active! Payload will be submitted with mismatched RFC 8785 Ed25519 signature to test zero-trust rejection.
                </span>
              ) : (
                <span>Untampered authentic W3C Credential will be cryptographically verified against the GIgnite Authority Node.</span>
              )}
            </p>
          </div>

          {/* ================================================================ */}
          {/* CTA: RUN ZERO-TRUST UNDERWRITE BUTTON                            */}
          {/* ================================================================ */}
          <button
            onClick={handleUnderwrite}
            disabled={isEvaluating}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl disabled:opacity-50 cursor-pointer ${
              isTamperMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white glow-rose animate-pulse'
                : 'purple-magenta-gradient hover:opacity-95 text-white glow-purple'
            }`}
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Zero-Trust Cryptography...</span>
              </>
            ) : isTamperMode ? (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Run Tampered Underwrite (Expect Halt)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Run Zero-Trust Underwrite</span>
              </>
            )}
          </button>

          {/* ================================================================ */}
          {/* RESULT TERMINAL CARD                                             */}
          {/* ================================================================ */}
          {underwritingResult && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all duration-300 animate-in fade-in ${
              underwritingResult.decision === 'REJECTED_SECURITY_HALT'
                ? 'bg-[#3A0A1C]/60 border-rose-500/60 shadow-xl glow-rose'
                : underwritingResult.decision === 'APPROVED'
                ? 'bg-[#0B261A]/60 border-emerald-500/60 shadow-xl glow-emerald'
                : 'bg-[#1E0E3E]/60 border-[#A231C4]/60 shadow-xl glow-purple'
            }`}>
              
              {/* Result Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {underwritingResult.decision === 'REJECTED_SECURITY_HALT' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : underwritingResult.decision === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#A231C4]" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
                    underwritingResult.decision === 'REJECTED_SECURITY_HALT'
                      ? 'text-rose-400'
                      : underwritingResult.decision === 'APPROVED'
                      ? 'text-emerald-400'
                      : 'text-[#F5F5F6]'
                  }`}>
                    {underwritingResult.decision === 'REJECTED_SECURITY_HALT'
                      ? 'HTTP 403 SECURITY HALT'
                      : underwritingResult.decision === 'APPROVED'
                      ? 'HTTP 200 APPROVED'
                      : 'HTTP 200 CONDITIONAL APPROVAL'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#9F9EA2]">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              {/* Decision Specific Content */}
              {underwritingResult.decision === 'REJECTED_SECURITY_HALT' ? (
                /* FRAUD SECURITY HALT VIEW */
                <div className="flex flex-col gap-2.5 text-xs text-slate-300 font-mono">
                  <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300">
                    <span className="font-bold block mb-1">[!] FRAUD_TAMPER_DETECTED</span>
                    <span>{underwritingResult.error || "Cryptographic signature mismatch on canonical payload."}</span>
                  </div>

                  {underwritingResult.audit_metadata && (
                    <div className="flex flex-col gap-1.5 text-[10px] text-[#9F9EA2] bg-[#05020C] p-3 rounded-xl border border-rose-900/40">
                      <div>
                        <span className="text-[#65636A] block">Presented Signature:</span>
                        <span className="text-rose-400 truncate block">{underwritingResult.audit_metadata.presented_signature}</span>
                      </div>
                      <div>
                        <span className="text-[#65636A] block">Expected Signature:</span>
                        <span className="text-emerald-400 truncate block">{underwritingResult.audit_metadata.expected_signature}</span>
                      </div>
                      <div>
                        <span className="text-[#65636A] block">Verification Method:</span>
                        <span className="text-[#F5F5F6]">{underwritingResult.audit_metadata.verificationMethod || "did:gignite:authority-node-01#key-2026"}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : underwritingResult.decision === 'APPROVED' ? (
                /* FULL APPROVAL VIEW */
                <div className="flex flex-col gap-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-[#05020C] p-2.5 rounded-xl border border-emerald-900/50">
                      <span className="text-[10px] text-[#9F9EA2] block">Sanctioned Limit</span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        ₹{underwritingResult.sanctioned_amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-[#05020C] p-2.5 rounded-xl border border-emerald-900/50">
                      <span className="text-[10px] text-[#9F9EA2] block">Annual Rate</span>
                      <span className="text-base font-bold font-mono text-[#A231C4]">
                        {underwritingResult.annual_interest_rate_p_a}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                    <div className="flex justify-between mb-1">
                      <span>Monthly EMI:</span>
                      <span className="font-bold text-white">₹{underwritingResult.monthly_emi_inr?.toLocaleString('en-IN')} / mo</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Tenure:</span>
                      <span>{underwritingResult.tenure_months} Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Direct Disbursal:</span>
                      <span className="font-bold text-emerald-400">INSTANT PRE-APPROVED</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* CONDITIONAL APPROVAL & REMEDIATION ROADMAP */
                <div className="flex flex-col gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#140929] border border-[#A231C4]/40 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-[#9F9EA2] block">Instant Available Limit</span>
                      <span className="text-base font-bold text-emerald-400">
                        ₹{underwritingResult.instant_available_limit?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#9F9EA2] block">Stretch Gap</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">
                        ₹{underwritingResult.remediation_plan?.funding_gap?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {underwritingResult.remediation_plan && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-bold text-[#F5F5F6] uppercase tracking-wider">
                        21-Day Actionable Remediation Pathway
                      </span>
                      {underwritingResult.remediation_plan.actionable_milestones.map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#05020C] border border-[#240552]/60 text-[11px]">
                          <div className="flex items-center justify-between text-[#A231C4] font-semibold mb-1">
                            <span>{m.day_range}: {m.title}</span>
                            <span className="text-emerald-400 font-mono text-[10px]">{m.target_delta}</span>
                          </div>
                          <p className="text-[#9F9EA2] leading-snug">{m.action}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </section>

      </div>

    </div>
  );
}
