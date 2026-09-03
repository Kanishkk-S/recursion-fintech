"""
Counterfactual Underwriting Engine for Alternative Credit Scoring.
Provides deterministic, actionable credit decisions and growth pathways:
  - TIER_1_PRIME: Instant Approval for conservative micro-loans (<= 70% monthly inflow)
  - TIER_2_GROWTH: Conditional Approval for stretch loans (> 70% monthly inflow) with
    a safe credit floor (50% inflow) and a structured 21-day growth roadmap.
"""

import math
from typing import Dict, Any, Optional, Union


def generate_counterfactual_pathway(
    current_cri: Union[float, int],
    current_consistency: float,
    monthly_inflow: float,
    requested_loan: float,
    **kwargs: Any
) -> Dict[str, Any]:
    """
    Evaluates loan underwriting criteria and generates counterfactual pathways:
    
    Args:
        current_cri: Cash-Flow Resilience Index (scale: 0-100 or 300-900)
        current_consistency: Consistency ratio (0.0 - 1.0)
        monthly_inflow: Verified monthly gross inflow in INR
        requested_loan: Target loan amount requested by borrower in INR
        
    Returns:
        dict with underwriting decision, tier, limits, and optional remediation roadmap.
    """
    # Normalize CRI score: if 300-900 scale, normalize to 0-100 for threshold comparison
    cri_normalized = (current_cri / 9.0) if current_cri > 100 else float(current_cri)
    monthly_inflow_float = float(monthly_inflow)
    requested_loan_float = float(requested_loan)
    consistency_float = float(current_consistency)

    # Threshold: loan requested is within 70% of monthly inflow and CRI is high resilience
    max_prime_limit = round(monthly_inflow_float * 0.70, 2)

    # --------------------------------------------------------------------------
    # SCENARIO A: INSTANT FULL APPROVAL (TIER 1 PRIME)
    # --------------------------------------------------------------------------
    if requested_loan_float <= max_prime_limit and cri_normalized >= 75.0:
        annual_rate = 11.5
        tenure_months = 6
        r = (annual_rate / 100.0) / 12.0
        n = tenure_months
        monthly_emi = round((requested_loan_float * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1), 2)

        return {
            "decision": "APPROVED",
            "tier": "TIER_1_PRIME",
            "sanctioned_amount": requested_loan_float,
            "instant_available_limit": requested_loan_float,
            "requested_amount": requested_loan_float,
            "max_prime_limit": max_prime_limit,
            "annual_interest_rate_p_a": f"{annual_rate}%",
            "tenure_months": tenure_months,
            "monthly_emi_inr": monthly_emi,
            "total_repayable_inr": round(monthly_emi * tenure_months, 2),
            "counterfactual_needed": False,
            "remediation_plan": None
        }

    # --------------------------------------------------------------------------
    # SCENARIO C: CONDITIONAL APPROVAL & REMEDIATION ROADMAP (TIER 2 GROWTH)
    # --------------------------------------------------------------------------
    # Safe credit floor: 50% of verified monthly inflow (e.g. ₹24,500 on ~₹49,000 inflow)
    safe_credit_floor = round(monthly_inflow_float * 0.50, 2)
    unlocked_gap = round(requested_loan_float - safe_credit_floor, 2)

    # Target monthly inflow needed to safely support requested loan at 70% DTI threshold
    target_monthly_inflow = round(requested_loan_float / 0.70, 2)
    inflow_gap = round(max(0.0, target_monthly_inflow - monthly_inflow_float), 2)

    # 21-day timeline calculations
    roadmap_days = 21
    daily_extra_earnings = round(inflow_gap / 30.0, 2)  # run-rate increase needed
    avg_trip_fare = 85.0
    daily_extra_trips = max(1, math.ceil(daily_extra_earnings / avg_trip_fare))
    target_consistency_ratio = 0.90

    annual_rate = 13.5
    tenure_months = 6
    r = (annual_rate / 100.0) / 12.0
    n = tenure_months
    floor_emi = round((safe_credit_floor * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1), 2)

    remediation_plan = {
        "target_loan_amount": requested_loan_float,
        "instant_approved_limit": safe_credit_floor,
        "funding_gap": unlocked_gap,
        "target_active_consistency": f"{target_consistency_ratio * 100:.0f}%",
        "required_consistency_ratio": target_consistency_ratio,
        "required_monthly_inflow": target_monthly_inflow,
        "inflow_gap_inr": inflow_gap,
        "daily_extra_earnings_inr": daily_extra_earnings,
        "daily_extra_trips": daily_extra_trips,
        "weekly_extra_trips": daily_extra_trips * 6,
        "roadmap_days": roadmap_days,
        "actionable_milestones": [
            {
                "day_range": "Days 1-7",
                "title": "Peak-Hour Shift Optimization",
                "action": f"Add ~{daily_extra_trips} delivery/ride trips daily during dinner surge slots (19:00 - 22:30).",
                "target_delta": f"+₹{daily_extra_earnings * 7:,.2f} weekly inflow"
            },
            {
                "day_range": "Days 8-14",
                "title": "Consistency & Attendance Lock",
                "action": f"Maintain active working attendance on 6 out of 7 days (reach {target_consistency_ratio * 100:.0f}% shift regularity).",
                "target_delta": "Zero-volatility consistency flag"
            },
            {
                "day_range": "Days 15-21",
                "title": "Telemetry Refresh & Auto-Unlock",
                "action": f"Re-issue Verifiable Credential to automatically unlock the remaining ₹{unlocked_gap:,.2f} credit line.",
                "target_delta": f"Full ₹{requested_loan_float:,.2f} Working Capital Disbursal"
            }
        ]
    }

    return {
        "decision": "CONDITIONAL_APPROVAL",
        "tier": "TIER_2_GROWTH",
        "instant_available_limit": safe_credit_floor,
        "requested_amount": requested_loan_float,
        "max_prime_limit": max_prime_limit,
        "annual_interest_rate_p_a": f"{annual_rate}%",
        "tenure_months": tenure_months,
        "instant_monthly_emi_inr": floor_emi,
        "counterfactual_needed": True,
        "remediation_plan": remediation_plan
    }
