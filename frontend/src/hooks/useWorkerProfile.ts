import { useState, useEffect } from 'react';

export interface WorkerProfile {
  worker_id: string;
  name: string;
  cri_score: number;
  resilience_tier: string;
  active_days_tracked: number;
  consistency_rate: number;
  income_stability_rate: number;
  avg_monthly_inflow: number;
  platforms: {
    name: string;
    status: string;
    tenure_months: number;
    rating: number;
  }[];
}

const FALLBACK_PAYLOAD: WorkerProfile = {
  worker_id: "ramesh-kumar-9872",
  name: "Ramesh Kumar",
  cri_score: 88.7,
  resilience_tier: "PRIME_RESILIENT",
  active_days_tracked: 180,
  consistency_rate: 0.935,
  income_stability_rate: 1.0,
  avg_monthly_inflow: 49066.0,
  platforms: [
    { name: "Swiggy", status: "ACTIVE", tenure_months: 14, rating: 4.89 },
    { name: "Uber", status: "ACTIVE", tenure_months: 22, rating: 4.92 }
  ]
};

export function useWorkerProfile(workerId: string = "ramesh-kumar-9872") {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`http://localhost:8000/api/worker/profile?worker_id=${workerId}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setProfile(data);
        setIsOffline(false);
      } catch (err) {
        console.warn("Backend unreachable, using mock fallback", err);
        setProfile(FALLBACK_PAYLOAD);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
    // Optional: setup a polling interval for live updates
    const intervalId = setInterval(fetchProfile, 10000);
    return () => clearInterval(intervalId);
  }, [workerId]);

  return { profile, loading, isOffline };
}
