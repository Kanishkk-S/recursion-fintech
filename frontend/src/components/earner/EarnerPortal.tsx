import { ShieldCheck, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { WorkerProfile } from '../../hooks/useWorkerProfile';

export function EarnerPortal({ profile }: { profile: WorkerProfile }) {
  const criScore = profile.cri_score;
  const strokeDasharray = 283; // 2 * pi * r (r=45)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * criScore) / 100;

  return (
    <div className="flex justify-center items-center h-full w-full bg-[#0B0F19]/50 p-4 sm:p-8">
      {/* Smartphone Mockup Container */}
      <div className="w-full max-w-[420px] h-full max-h-[850px] min-h-[700px] bg-[#111827] rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden flex flex-col relative shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
          <div className="w-32 h-6 bg-[#0B0F19] rounded-b-3xl"></div>
        </div>

        {/* Header content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <div className="pt-12 px-6 pb-6 bg-gradient-to-b from-slate-800/50 to-transparent">
            <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.platforms.map((p, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-300">{p.name} {p.rating}★</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gauge Section */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-48 h-48 flex items-center justify-center group cursor-pointer transition-transform duration-300 hover:scale-105">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                {/* Background track */}
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="transparent" 
                  stroke="#1E293B" 
                  strokeWidth="8" 
                />
                {/* Progress track */}
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  className="text-emerald-500 transition-all duration-1500 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{
                    strokeDasharray: strokeDasharray,
                    strokeDashoffset: strokeDashoffset,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white tracking-tight">{criScore}</span>
                <span className="text-xs text-slate-400 font-medium mt-1">CRI SCORE</span>
              </div>
            </div>
            
            <div className="mt-4 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-sm font-semibold text-emerald-400 tracking-wide uppercase">
                {profile.resilience_tier.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Telemetry Highlights */}
          <div className="px-6 grid gap-4">
            <div className="bg-[#1E293B]/60 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm transition-all hover:bg-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Avg Monthly Inflow</p>
                  <p className="text-lg font-semibold text-white">₹{profile.avg_monthly_inflow.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1E293B]/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm transition-all hover:bg-[#1E293B]">
                <div className="p-2 bg-amber-500/10 rounded-xl w-max mb-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Active Days</p>
                <p className="text-lg font-semibold text-white">{profile.active_days_tracked}</p>
              </div>

              <div className="bg-[#1E293B]/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm transition-all hover:bg-[#1E293B]">
                <div className="p-2 bg-rose-500/10 rounded-xl w-max mb-2">
                  <TrendingUp className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Consistency</p>
                <p className="text-lg font-semibold text-white">{(profile.consistency_rate * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Anchor */}
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#111827] via-[#111827] to-transparent">
          <button 
            disabled 
            className="w-full py-4 rounded-xl font-semibold text-sm transition-all bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-80"
          >
            Generate Verifiable Credential
          </button>
        </div>
      </div>
    </div>
  );
}
