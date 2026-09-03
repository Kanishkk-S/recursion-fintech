import type { WorkerProfile, W3CCredential, LenderProfile } from '../types';

// ==============================================================================
// 3 REGISTERED WORKER PERSONAS
// ==============================================================================

export interface ExtendedWorkerProfile extends WorkerProfile {
  email: string;
  phone: string;
}

export interface ExtendedLenderProfile extends LenderProfile {
  email: string;
  portal_name: string;
}

// Pre-generated realistic 30-day daily payout arrays
const RAMESH_30D_WAGES = [
  1850, 1920, 2100, 1780, 1950, 2250, 0, // W1 (1 rest day)
  1800, 1910, 2050, 1890, 2150, 2300, 0, // W2
  1940, 1820, 2010, 1980, 2120, 2280, 0, // W3
  1890, 1950, 2040, 1880, 2200, 2350, 0, // W4
  1960, 2106                              // Days 29-30 (Total = 49,066)
];

const PRIYA_30D_WAGES = [
  950, 1020, 1100, 920, 1050, 0, 0,      // W1 (2 rest days)
  980, 1040, 1120, 960, 1080, 1150, 0,   // W2
  1010, 940, 1060, 990, 1110, 0, 0,      // W3
  1020, 980, 1090, 1030, 1140, 1200, 0,  // W4
  1050, 1100                              // Days 29-30 (Total = 24,800)
];

const VIKRAM_30D_WAGES = [
  750, 0, 820, 0, 780, 890, 0,           // W1 (3 rest days)
  0, 810, 0, 840, 0, 910, 0,             // W2
  760, 0, 830, 0, 800, 0, 0,             // W3
  880, 0, 790, 850, 0, 920, 0,           // W4
  830, 0                                 // Days 29-30 (Total = 11,200)
];

export const WORKER_PERSONAS: Record<string, ExtendedWorkerProfile> = {
  "ramesh-kumar-9872": {
    worker_id: "ramesh-kumar-9872",
    worker_name: "Ramesh Kumar",
    email: "ramesh@swiggy.in",
    phone: "+91 98765 43210",
    did: "did:india:worker:9872",
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
      zero_income_weeks: 0,
      daily_wages_30d: RAMESH_30D_WAGES,
      earning_bracket: 'high',
      is_zktls_verified: true,
      verification_status: 'ZKTLS_VERIFIED'
    },
    cri_score: 88.7,
    resilience_tier: "PRIME_RESILIENT",
    max_prime_credit_limit_inr: 34346.20,
    instant_safe_floor_inr: 24500.00,
    daily_wages_30d: RAMESH_30D_WAGES,
    earning_bracket: 'high',
    is_zktls_verified: true,
    verification_status: 'ZKTLS_VERIFIED'
  },

  "priya-sharma-3411": {
    worker_id: "priya-sharma-3411",
    worker_name: "Priya Sharma",
    email: "priya@blinkit.com",
    phone: "+91 98111 22334",
    did: "did:india:worker:3411",
    category: "Quick-Commerce Dark Store Picker & Rider",
    credit_bureau_status: "THIN_FILE_NEW_TO_CREDIT",
    platform_badges: ["Blinkit", "Zepto"],
    platform_details: [
      {
        platform: "Blinkit",
        role: "Express Delivery Executive",
        rating: 4.82,
        trips_completed: 610,
        verified_active: true,
        payout_frequency: "Weekly",
        badge: "Blinkit Gold Fleet",
        payout_amount_inr: 14200.00
      },
      {
        platform: "Zepto",
        role: "Dark-Store Dispatcher",
        rating: 4.75,
        trips_completed: 450,
        verified_active: true,
        payout_frequency: "Bi-Weekly",
        badge: "Zepto Super Saver",
        payout_amount_inr: 10600.00
      }
    ],
    telemetry_summary: {
      telemetry_period_days: 60,
      active_working_days: 47,
      active_days_ratio: 0.7833,
      consistency_rate: "78.3%",
      consistency_ratio: 0.783,
      stability_rate: "85.0%",
      stability_index: 0.85,
      monthly_inflow_inr: 24800.00,
      gross_earnings_180d_inr: 148800.00,
      net_earnings_180d_inr: 114576.00,
      zero_income_weeks: 1,
      daily_wages_30d: PRIYA_30D_WAGES,
      earning_bracket: 'standard',
      is_zktls_verified: true,
      verification_status: 'ZKTLS_VERIFIED'
    },
    cri_score: 64.2,
    resilience_tier: "NEAR_PRIME",
    max_prime_credit_limit_inr: 17360.00,
    instant_safe_floor_inr: 12400.00,
    daily_wages_30d: PRIYA_30D_WAGES,
    earning_bracket: 'standard',
    is_zktls_verified: true,
    verification_status: 'ZKTLS_VERIFIED'
  },

  "vikram-singh-1029": {
    worker_id: "vikram-singh-1029",
    worker_name: "Vikram Singh",
    email: "vikram@zomato.com",
    phone: "+91 98222 33445",
    did: "did:india:worker:1029",
    category: "Entry-Level Food Delivery Partner",
    credit_bureau_status: "THIN_FILE_UNBANKED",
    platform_badges: ["Zomato"],
    platform_details: [
      {
        platform: "Zomato",
        role: "Food Delivery Partner",
        rating: 4.60,
        trips_completed: 120,
        verified_active: true,
        payout_frequency: "Weekly",
        badge: "Zomato Apprentice",
        payout_amount_inr: 11200.00
      }
    ],
    telemetry_summary: {
      telemetry_period_days: 14,
      active_working_days: 6,
      active_days_ratio: 0.4285,
      consistency_rate: "45.0%",
      consistency_ratio: 0.45,
      stability_rate: "50.0%",
      stability_index: 0.50,
      monthly_inflow_inr: 11200.00,
      gross_earnings_180d_inr: 67200.00,
      net_earnings_180d_inr: 49728.00,
      zero_income_weeks: 3,
      daily_wages_30d: VIKRAM_30D_WAGES,
      earning_bracket: 'entry',
      is_zktls_verified: true,
      verification_status: 'ZKTLS_VERIFIED'
    },
    cri_score: 41.0,
    resilience_tier: "VULNERABLE",
    max_prime_credit_limit_inr: 7840.00,
    instant_safe_floor_inr: 5600.00,
    daily_wages_30d: VIKRAM_30D_WAGES,
    earning_bracket: 'entry',
    is_zktls_verified: true,
    verification_status: 'ZKTLS_VERIFIED'
  }
};

// ==============================================================================
// 2 INSTITUTIONAL LENDER PROFILES
// ==============================================================================

export const LENDER_PERSONAS: Record<string, ExtendedLenderProfile> = {
  "finprime-nbfc": {
    id: "finprime-nbfc",
    name: "FinPrime NBFC",
    email: "underwriter@finprime.com",
    portal_name: "FinPrime Institutional Credit Portal",
    code: "FINPRIME_PRIME_DESK",
    focus: "Prime & Near-Prime Mandate (Low Risk)",
    max_limit_inr: 50000,
    min_cri: 75,
    base_apr_p_a: "11.5%",
    base_apr_numeric: 11.5,
    max_tenure_months: 12,
    badge: "FinPrime A+ Institutional Desk",
    accent_color: "emerald"
  },

  "microflex-capital": {
    id: "microflex-capital",
    name: "MicroFlex Capital",
    email: "desk@microflex.capital",
    portal_name: "MicroFlex High-Yield Desk",
    code: "MICROFLEX_GROWTH_DESK",
    focus: "Growth & Developing Mandate (Flexible)",
    max_limit_inr: 25000,
    min_cri: 50,
    base_apr_p_a: "16.5%",
    base_apr_numeric: 16.5,
    max_tenure_months: 6,
    badge: "MicroFlex Growth NBFC Desk",
    accent_color: "purple"
  }
};

// ==============================================================================
// 30-DAY DAILY WAGE STREAM SIMULATOR
// ==============================================================================

export type EarningBracketKey = 'entry' | 'standard' | 'high';

export interface BracketConfig {
  key: EarningBracketKey;
  label: string;
  range: string;
  minDaily: number;
  maxDaily: number;
  avgDaily: number;
  description: string;
  color: string;
}

export const EARNING_BRACKETS: Record<EarningBracketKey, BracketConfig> = {
  entry: {
    key: 'entry',
    label: 'Entry',
    range: '₹600 - ₹900 / day',
    minDaily: 600,
    maxDaily: 900,
    avgDaily: 750,
    description: 'Casual or flexible part-time shifts',
    color: '#F59E0B' // Amber
  },
  standard: {
    key: 'standard',
    label: 'Standard',
    range: '₹1,000 - ₹1,500 / day',
    minDaily: 1000,
    maxDaily: 1500,
    avgDaily: 1250,
    description: 'Standard 6-day fleet shift (Recommended)',
    color: '#C084FC' // Purple
  },
  high: {
    key: 'high',
    label: 'High Velocity',
    range: '₹1,600 - ₹2,200 / day',
    minDaily: 1600,
    maxDaily: 2200,
    avgDaily: 1900,
    description: 'Peak surge & multi-platform continuous schedule',
    color: '#10B981' // Emerald
  }
};

export interface GeneratedWageStream {
  dailyStream: number[];
  totalMonthlyInflow: number;
  activeWorkingDays: number;
  restDaysCount: number;
  shiftConsistency: string;
  consistencyRatio: number;
  averageActiveDaily: number;
  bracket: EarningBracketKey;
}

export function generate30DayWageStream(bracketKey: EarningBracketKey = 'standard'): GeneratedWageStream {
  const cfg = EARNING_BRACKETS[bracketKey] || EARNING_BRACKETS.standard;
  
  // 4 to 6 random rest days (₹0 earnings)
  const restDaysCount = Math.floor(4 + Math.random() * 3);
  const restDayIndices = new Set<number>();
  while (restDayIndices.size < restDaysCount) {
    const day = Math.floor(Math.random() * 30);
    restDayIndices.add(day);
  }

  const dailyStream: number[] = [];
  let totalSum = 0;
  let activeCount = 0;

  for (let i = 0; i < 30; i++) {
    if (restDayIndices.has(i)) {
      dailyStream.push(0);
    } else {
      activeCount++;
      // Slight realistic variance (+-15%) on active days
      const base = cfg.minDaily + Math.random() * (cfg.maxDaily - cfg.minDaily);
      const variance = 1 + (Math.random() * 0.30 - 0.15); // 0.85 to 1.15
      const dayVal = Math.round((base * variance) / 10) * 10;
      dailyStream.push(dayVal);
      totalSum += dayVal;
    }
  }

  const consistencyRatio = Math.round((activeCount / 30) * 1000) / 1000;
  const shiftConsistency = `${(consistencyRatio * 100).toFixed(1)}%`;
  const averageActiveDaily = activeCount > 0 ? Math.round(totalSum / activeCount) : 0;

  return {
    dailyStream,
    totalMonthlyInflow: totalSum,
    activeWorkingDays: activeCount,
    restDaysCount,
    shiftConsistency,
    consistencyRatio,
    averageActiveDaily,
    bracket: bracketKey
  };
}

// ==============================================================================
// ACCOUNT RESOLVER
// ==============================================================================

export type ResolvedAccount = 
  | { type: 'worker'; worker: ExtendedWorkerProfile }
  | { type: 'lender'; lender: ExtendedLenderProfile }
  | null;

export function findAccountByEmail(inputEmail: string): ResolvedAccount {
  const normalized = inputEmail.trim().toLowerCase();

  // 1. Check workers
  for (const worker of Object.values(WORKER_PERSONAS)) {
    if (
      worker.email.toLowerCase() === normalized ||
      worker.worker_name.toLowerCase().includes(normalized) ||
      worker.worker_id.toLowerCase().includes(normalized)
    ) {
      return { type: 'worker', worker };
    }
  }

  // 2. Check aliases for workers
  if (normalized.includes('ramesh')) return { type: 'worker', worker: WORKER_PERSONAS['ramesh-kumar-9872'] };
  if (normalized.includes('priya')) return { type: 'worker', worker: WORKER_PERSONAS['priya-sharma-3411'] };
  if (normalized.includes('vikram')) return { type: 'worker', worker: WORKER_PERSONAS['vikram-singh-1029'] };

  // 3. Check lenders
  for (const lender of Object.values(LENDER_PERSONAS)) {
    if (
      lender.email.toLowerCase() === normalized ||
      lender.name.toLowerCase().includes(normalized) ||
      lender.id.toLowerCase().includes(normalized)
    ) {
      return { type: 'lender', lender };
    }
  }

  // 4. Check aliases for lenders
  if (normalized.includes('finprime') || normalized.includes('prime')) return { type: 'lender', lender: LENDER_PERSONAS['finprime-nbfc'] };
  if (normalized.includes('microflex') || normalized.includes('flex')) return { type: 'lender', lender: LENDER_PERSONAS['microflex-capital'] };

  return null;
}

// ==============================================================================
// CREDENTIAL GENERATOR
// ==============================================================================

export function generateWorkerCredential(profile: WorkerProfile): W3CCredential {
  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://schema.org",
      "https://gignite.network/credentials/v2"
    ],
    id: `urn:uuid:${profile.worker_id}-w3c-credential-2026`,
    type: ["VerifiableCredential", "CashFlowResilienceCredential"],
    issuer: {
      id: "did:gignite:authority-node-01",
      name: "GIgnite Autonomous Financial Identity Authority"
    },
    issuanceDate: new Date().toISOString(),
    expirationDate: "2026-12-31T23:59:59Z",
    credentialSubject: {
      id: profile.did,
      workerName: profile.worker_name,
      workerCategory: profile.category,
      platforms: profile.platform_badges,
      telemetryPeriodDays: profile.telemetry_summary.telemetry_period_days,
      cri_score: profile.cri_score,
      cashFlowResilienceScore: profile.cri_score,
      resilience_tier: profile.resilience_tier,
      scoreTier: profile.resilience_tier === 'PRIME_RESILIENT' 
        ? "Prime Resilience (Tier-1 Low Risk)" 
        : profile.resilience_tier === 'NEAR_PRIME'
        ? "Near-Prime Growth (Tier-2 Moderate Risk)"
        : "Developing Thin-File (Tier-3 High Care)",
      monthlyInflowGte: Math.round(profile.telemetry_summary.monthly_inflow_inr * 0.5),
      averageMonthlyInflowINR: profile.telemetry_summary.monthly_inflow_inr,
      consistencyRatio: profile.telemetry_summary.consistency_ratio,
      stabilityIndex: profile.telemetry_summary.stability_index,
      zeroIncomeWeeksCount: profile.telemetry_summary.zero_income_weeks,
      selectiveDisclosure: {
        rawLocationTelemetryDisclosed: false,
        rawCustomerDetailsDisclosed: false,
        discloseFullHistory: false,
        verifiedMinIncomeGuaranteedINR: Math.round(profile.telemetry_summary.monthly_inflow_inr * 0.5),
        isUnderwritingAuditReady: true
      }
    },
    proof: {
      type: "Ed25519Signature2020",
      created: new Date().toISOString(),
      verificationMethod: "did:gignite:authority-node-01#key-2026",
      proofPurpose: "assertionMethod",
      proofValue: `90a874f02c029562bb9d20e207c56c45731bd1fbb8912efc464aa76948b8ca705b76bc2ebad21c97a892b1574a7d664c3905cfebaa63d3e23298a086b3cc7337_${profile.worker_id}`,
      payloadDigest: `e5a7b6cf901765c010aaef437890b056f71295328901cb0098fca201e5b87190e5a7b6cf901765c010aaef437890b056f71295328901cb0098fca201e5b87190_${profile.worker_id}`
    }
  };
}
