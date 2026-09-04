export interface LenderProfile {
  id: string;
  name: string;
  code: string;
  focus: string;
  max_limit_inr: number;
  min_cri: number;
  base_apr_p_a: string;
  base_apr_numeric: number;
  max_tenure_months: number;
  badge: string;
  accent_color: string;
}

export interface PlatformRecord {
  platform: string;
  role: string;
  rating: number;
  trips_completed: number;
  verified_active: boolean;
  payout_frequency: string;
  badge: string;
  payout_amount_inr: number;
}

export interface WorkerTelemetry {
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
  daily_wages_30d?: number[];
  earning_bracket?: 'entry' | 'standard' | 'high' | string;
  primary_domain?: string;
  primary_domain_category?: string;
  is_zktls_verified?: boolean;
  verification_status?: 'UNVERIFIED_MANUAL_CLAIM' | 'ZKTLS_VERIFIED' | string;
  is_soundbox_verified?: boolean;
  soundbox_details?: {
    provider: string;
    scans: number;
    gross_volume: number;
    avg_daily: number;
    credential_id: string;
  };
}

export interface WorkerProfile {
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
  daily_wages_30d?: number[];
  earning_bracket?: 'entry' | 'standard' | 'high' | string;
  primary_domain?: string;
  primary_domain_category?: string;
  is_zktls_verified?: boolean;
  verification_status?: 'UNVERIFIED_MANUAL_CLAIM' | 'ZKTLS_VERIFIED' | string;
  is_soundbox_verified?: boolean;
  soundbox_details?: {
    provider: string;
    scans: number;
    gross_volume: number;
    avg_daily: number;
    credential_id: string;
  };
}

export interface W3CCredential {
  "@context": string[];
  id: string;
  type: string[];
  issuer: {
    id: string;
    name: string;
  };
  issuanceDate: string;
  expirationDate: string;
  credentialSubject: {
    id: string;
    workerName: string;
    workerCategory?: string;
    platforms?: string[];
    telemetryPeriodDays?: number;
    cri_score?: number;
    cashFlowResilienceScore?: number;
    resilience_tier?: string;
    scoreTier?: string;
    monthlyInflowGte: number;
    averageMonthlyInflowINR: number;
    consistencyRatio: number;
    stabilityIndex: number;
    zeroIncomeWeeksCount: number;
    selectiveDisclosure?: {
      rawLocationTelemetryDisclosed: boolean;
      rawCustomerDetailsDisclosed: boolean;
      discloseFullHistory: boolean;
      verifiedMinIncomeGuaranteedINR: number;
      isUnderwritingAuditReady: boolean;
    };
  };
  proof?: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
    payloadDigest: string;
  };
}

export interface UnderwritingResult {
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
