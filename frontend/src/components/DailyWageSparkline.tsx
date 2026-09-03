import React, { useState } from 'react';
import { TrendingUp, Zap, Coffee } from 'lucide-react';

interface DailyWageSparklineProps {
  dailyWages?: number[];
  monthlyInflow: number;
  consistencyRate: string;
  activeDays?: number;
  workerName?: string;
  className?: string;
}

export const DailyWageSparkline: React.FC<DailyWageSparklineProps> = ({
  dailyWages = [],
  monthlyInflow,
  consistencyRate,
  activeDays,
  className = ''
}) => {
  // Fallback 30-day distribution if empty
  const wages = dailyWages && dailyWages.length === 30 ? dailyWages : Array.from({ length: 30 }, (_, i) => {
    if (i % 6 === 0) return 0;
    const base = monthlyInflow / 25;
    const jitter = (Math.sin(i * 1.5) * 0.2 + 1);
    return Math.round((base * jitter) / 10) * 10;
  });

  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number } | null>(null);

  const maxWage = Math.max(...wages, 1000);
  const calculatedActiveCount = activeDays !== undefined ? activeDays : wages.filter(w => w > 0).length;
  const restDaysCount = 30 - calculatedActiveCount;
  const totalSum = wages.reduce((acc, curr) => acc + curr, 0);
  const avgActiveDaily = calculatedActiveCount > 0 ? Math.round(totalSum / calculatedActiveCount) : 0;

  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-[#0D061C] border border-[#1C0B3B] shadow-xl flex flex-col gap-4 ${className}`}>
      
      {/* Header with Title & Live Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse"></span>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#C084FC]" />
              30-Day Daily Wage Stream (zkTLS Inflow Telemetry)
            </h3>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Automated daily micro-payout fluctuation across connected platform shifts
          </p>
        </div>

        {/* Aggregate Inflow Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-2xl bg-[#140929] border border-purple-500/30 text-right">
            <span className="text-[10px] text-[#9CA3AF] uppercase font-mono block">30-Day Inflow</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#4ADE80]">
              ₹{totalSum.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
          <span className="text-[10px] text-[#9CA3AF] block">Active Shifts</span>
          <span className="text-xs font-bold font-mono text-white flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-[#C084FC]" />
            {calculatedActiveCount} / 30 Days
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
          <span className="text-[10px] text-[#9CA3AF] block">Rest / Off Days</span>
          <span className="text-xs font-bold font-mono text-[#9CA3AF] flex items-center gap-1 mt-0.5">
            <Coffee className="w-3 h-3 text-amber-400/80" />
            {restDaysCount} Days
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
          <span className="text-[10px] text-[#9CA3AF] block">Shift Consistency</span>
          <span className="text-xs font-bold font-mono text-emerald-400 mt-0.5 block">
            {consistencyRate}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#07030F] border border-[#1C0B3B]">
          <span className="text-[10px] text-[#9CA3AF] block">Avg Active Daily</span>
          <span className="text-xs font-bold font-mono text-[#D8B4FE] mt-0.5 block">
            ₹{avgActiveDaily.toLocaleString('en-IN')}/day
          </span>
        </div>
      </div>

      {/* Interactive 30-Bar Sparkline Chart Container */}
      <div className="relative pt-6 pb-2">
        
        {/* Floating Tooltip when hovering over a bar */}
        {hoveredDay && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-[#1E0E3E] border border-purple-500/50 shadow-lg text-[11px] font-mono z-20 flex items-center gap-2 pointer-events-none animate-in fade-in">
            <span className="text-[#C084FC] font-bold">Day {hoveredDay.day}:</span>
            {hoveredDay.amount > 0 ? (
              <span className="text-[#4ADE80] font-bold">₹{hoveredDay.amount.toLocaleString('en-IN')} (Active)</span>
            ) : (
              <span className="text-amber-400 font-semibold">₹0 (Rest Day)</span>
            )}
          </div>
        )}

        {/* 30 Bars Container */}
        <div className="h-28 flex items-end justify-between gap-1 sm:gap-1.5 px-1">
          {wages.map((amount, idx) => {
            const dayNum = idx + 1;
            const isRest = amount === 0;
            const heightPercent = isRest ? 6 : Math.max(12, Math.round((amount / maxWage) * 95));
            const isPeak = amount >= avgActiveDaily * 1.15;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredDay({ day: dayNum, amount })}
                onMouseLeave={() => setHoveredDay(null)}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
              >
                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-md transition-all duration-200 group-hover:opacity-100 ${
                    isRest
                      ? 'bg-[#1C0B3B] group-hover:bg-amber-500/40 border-t border-amber-500/30'
                      : isPeak
                      ? 'bg-gradient-to-t from-[#7E22CE] to-[#10B981] opacity-90 group-hover:brightness-125 shadow-sm shadow-emerald-500/20'
                      : 'bg-gradient-to-t from-[#4C1D95] to-[#A855F7] opacity-80 group-hover:brightness-125'
                  }`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Timeline Axis Labels */}
        <div className="flex items-center justify-between text-[9px] font-mono text-[#6B7280] pt-2 px-1 border-t border-[#1C0B3B]">
          <span>Day 1</span>
          <span>Day 8</span>
          <span>Day 15 (Mid-Month)</span>
          <span>Day 22</span>
          <span>Day 30</span>
        </div>
      </div>

    </div>
  );
};
