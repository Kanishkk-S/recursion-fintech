"""
Counterfactual Underwriting Engine for Alternative Credit Scoring.
Generates deterministic, actionable remediation pathways and conditional approvals
when requested loan amounts exceed the current pre-approved risk limit.
"""

import math
from typing import Dict, Any, List, Optional


def generate_counterfactual_pathway(
    requested_amount_inr: float,
    credential_subject: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates loan request against verified W3C Credential claims.
    If fully approved -> Returns APPROVED decision with terms.
    If partially eligible -> Returns CONDITIONAL_APPROVAL with pre-approved limit
    and an actionable step-by-step remediation plan to unlock the full requested limit.
    """
    score = credential_subject.get("cashFlowResilienceScore", 700)
    monthly_inflow = float(credential_subject.get("monthlyInflowGte", 25000.0))
    avg_monthly_inflow = float(credential_subject.get("averageMonthlyInflowINR", monthly_inflow))
    consistency = float(credential_subject.get("consistencyRatio", 0.90))
    stability = float(credential_subject.get("stabilityIndex", 0.90))
    worker_name = credential_subject.get("workerName", "Borrower")
    platforms = credential_subject.get("platforms", ["Gig Platforms"])

    # 1. Calculate Maximum Pre-Approved Limit based on CFRI Tier
    if score >= 750:
        multiplier = 1.5
        annual_rate = 11.5
        tier_label = "Prime Resilience (Tier-1 Low Risk)"
    elif score >= 650:
        multiplier = 1.0
        annual_rate = 13.5
        tier_label = "Standard Resilience (Tier-2 Moderate Risk)"
    else:
        multiplier = 0.5
        annual_rate = 16.0
        tier_label = "Subprime Resilience (Tier-3 High Risk)"

    # Hard risk cap of ₹60,000 for working capital micro-loans
    pre_approved_limit = min(60000.0, round(monthly_inflow * multiplier, 2))
    tenure_months = 6

    def compute_emi(principal: float, rate_p_a: float, n_months: int) -> float:
        if principal <= 0:
            return 0.0
        r = (rate_p_a / 100.0) / 12.0
        return round((principal * r * ((1 + r) ** n_months)) / (((1 + r) ** n_months) - 1), 2)

    # 2. Determine Approval vs Conditional Approval
    if requested_amount_inr <= pre_approved_limit:
        sanctioned_amount = requested_amount_inr
        monthly_emi = compute_emi(sanctioned_amount, annual_rate, tenure_months)
        return {
            "decision": "APPROVED",
            "is_conditionally_approved": False,
            "requested_amount_inr": requested_amount_inr,
            "pre_approved_limit_inr": pre_approved_limit,
            "sanctioned_loan_amount_inr": sanctioned_amount,
            "interest_rate_p_a": f"{annual_rate}%",
            "tenure_months": tenure_months,
            "monthly_emi_inr": monthly_emi,
            "total_repayable_inr": round(monthly_emi * tenure_months, 2),
            "remediation_plan": None,
            "score_tier": tier_label
        }

    # 3. Conditional Approval & Actionable Counterfactual Remediation Plan
    sanctioned_amount = pre_approved_limit
    monthly_emi = compute_emi(sanctioned_amount, annual_rate, tenure_months)
    gap_amount_inr = round(requested_amount_inr - pre_approved_limit, 2)

    # Target baseline inflow needed to unlock full requested amount (at 1.5x max multiplier)
    target_monthly_inflow_inr = round(requested_amount_inr / 1.5, 2)
    inflow_boost_required_inr = round(max(0.0, target_monthly_inflow_inr - monthly_inflow), 2)

    # Average net income contribution per ride/delivery ~ ₹85
    avg_per_trip_payout = 85.0
    extra_trips_monthly = math.ceil(inflow_boost_required_inr / avg_per_trip_payout)
    daily_extra_trips = max(1, math.ceil(extra_trips_monthly / 26.0))

    target_consistency = min(0.98, round(max(consistency, 0.94), 4))
    target_cfri = min(900, max(780, int(score + 35)))

    platform_str = " / ".join(platforms)
    remediation_plan = {
        "target_loan_amount_inr": requested_amount_inr,
        "current_pre_approved_limit_inr": pre_approved_limit,
        "unlocked_gap_inr": gap_amount_inr,
        "target_monthly_inflow_inr": target_monthly_inflow_inr,
        "inflow_boost_required_inr": inflow_boost_required_inr,
        "suggested_daily_extra_trips": daily_extra_trips,
        "suggested_weekly_extra_trips": daily_extra_trips * 6,
        "target_consistency_ratio": target_consistency,
        "target_cfri_score": target_cfri,
        "remediation_timeline_days": 30,
        "actionable_milestones": [
            {
                "step": 1,
                "title": "Increase Daily Ride / Delivery Velocity",
                "description": f"Complete ~{daily_extra_trips} additional trips per day (~{daily_extra_trips * 6} weekly) on {platform_str} during evening peak surge hours (18:00 - 22:00).",
                "impact": f"+₹{inflow_boost_required_inr:,.2f}/month gross inflow"
            },
            {
                "step": 2,
                "title": "Maintain High Weekly Consistency",
                "description": f"Maintain active working attendance on at least 25 out of 30 days ({target_consistency * 100:.0f}% attendance target) to boost CFRI score.",
                "impact": f"Target CFRI Score: {target_cfri}/900"
            },
            {
                "step": 3,
                "title": "Continuous Telemetry Re-Minting",
                "description": f"After 30 days of consistent earnings telemetry, re-mint your Verifiable Credential to automatically unlock the full ₹{requested_amount_inr:,.2f} credit line.",
                "impact": f"Full loan limit of ₹{requested_amount_inr:,.2f} instantly unlocked"
            }
        ]
    }

    return {
        "decision": "CONDITIONAL_APPROVAL",
        "is_conditionally_approved": True,
        "requested_amount_inr": requested_amount_inr,
        "pre_approved_limit_inr": pre_approved_limit,
        "sanctioned_loan_amount_inr": sanctioned_amount,
        "interest_rate_p_a": f"{annual_rate}%",
        "tenure_months": tenure_months,
        "monthly_emi_inr": monthly_emi,
        "total_repayable_inr": round(monthly_emi * tenure_months, 2),
        "score_tier": tier_label,
        "remediation_plan": remediation_plan
    }
