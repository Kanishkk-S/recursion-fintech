import React from 'react';
import { Wallet, Landmark, ArrowRight } from 'lucide-react';

interface RoleNavProps {
  activeRole: 'worker' | 'lender';
  onSelectRole: (role: 'worker' | 'lender') => void;
  hasIssuedCredential?: boolean;
  workerName?: string;
}

export const RoleNav: React.FC<RoleNavProps> = ({
  activeRole,
  onSelectRole,
  hasIssuedCredential = true,
  workerName
}) => {
  const firstName = workerName?.trim() ? workerName.trim().split(' ')[0] : 'Worker';
  const workerTabLabel = workerName?.trim() ? `👷 ${firstName}'s Wallet` : "👷 Worker Wallet";

  return (
    <div className="flex items-center bg-[#090D1A] p-1.5 rounded-2xl border border-[#17223B] shadow-inner">
      {/* Role 1: Worker Wallet */}
      <button
        type="button"
        onClick={() => onSelectRole('worker')}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          activeRole === 'worker'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/30 shadow-lg shadow-blue-900/30 font-bold'
            : 'text-slate-400 hover:text-white hover:bg-[#121B30]/60'
        }`}
      >
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
          activeRole === 'worker' ? 'bg-white/20 text-white' : 'bg-[#121B30] text-slate-400'
        }`}>
          <Wallet className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <span>{workerTabLabel}</span>
          <span className={`hidden md:inline text-[11px] font-normal font-mono ${activeRole === 'worker' ? 'text-blue-200' : 'text-slate-500'}`}>
            (Borrower)
          </span>
        </div>
        {activeRole === 'worker' && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
        )}
      </button>

      {/* Divider with flow indicator */}
      <div className="hidden sm:flex items-center justify-center px-1.5 text-slate-600">
        <ArrowRight className="w-3 h-3 opacity-60" />
      </div>

      {/* Role 2: Lender Terminal */}
      <button
        type="button"
        onClick={() => onSelectRole('lender')}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          activeRole === 'lender'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/30 shadow-lg shadow-blue-900/30 font-bold'
            : 'text-slate-400 hover:text-white hover:bg-[#121B30]/60'
        }`}
      >
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
          activeRole === 'lender' ? 'bg-white/20 text-white' : 'bg-[#121B30] text-slate-400'
        }`}>
          <Landmark className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <span>🏦 NBFC Underwriting Terminal</span>
          <span className={`hidden md:inline text-[11px] font-normal font-mono ${activeRole === 'lender' ? 'text-blue-200' : 'text-slate-500'}`}>
            (Lender)
          </span>
        </div>
        {hasIssuedCredential && activeRole !== 'lender' && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        )}
        {activeRole === 'lender' && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
        )}
      </button>
    </div>
  );
};
