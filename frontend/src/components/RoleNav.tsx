import React from 'react';
import { Wallet, Landmark, ArrowRight } from 'lucide-react';

interface RoleNavProps {
  activeRole: 'worker' | 'lender';
  onSelectRole: (role: 'worker' | 'lender') => void;
  hasIssuedCredential?: boolean;
}

export const RoleNav: React.FC<RoleNavProps> = ({
  activeRole,
  onSelectRole,
  hasIssuedCredential = true
}) => {
  return (
    <div className="flex items-center bg-[#07030F] p-1 rounded-2xl border border-[#1C0B3B] shadow-inner">
      {/* Role 1: Worker Wallet */}
      <button
        type="button"
        onClick={() => onSelectRole('worker')}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          activeRole === 'worker'
            ? 'bg-[#180933] text-white border border-purple-500/30 shadow-md shadow-purple-950/40'
            : 'text-[#9CA3AF] hover:text-white hover:bg-[#120726]/60'
        }`}
      >
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
          activeRole === 'worker' ? 'bg-[#7E22CE] text-white' : 'bg-[#180933] text-[#9CA3AF]'
        }`}>
          <Wallet className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <span>👷 Ramesh's Wallet</span>
          <span className="hidden md:inline text-[11px] text-[#A855F7] font-normal font-mono">(Borrower)</span>
        </div>
        {activeRole === 'worker' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]"></span>
        )}
      </button>

      {/* Divider with flow indicator */}
      <div className="hidden sm:flex items-center justify-center px-1 text-[#4B5563]">
        <ArrowRight className="w-3 h-3 opacity-60" />
      </div>

      {/* Role 2: Lender Terminal */}
      <button
        type="button"
        onClick={() => onSelectRole('lender')}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          activeRole === 'lender'
            ? 'bg-[#180933] text-white border border-purple-500/30 shadow-md shadow-purple-950/40'
            : 'text-[#9CA3AF] hover:text-white hover:bg-[#120726]/60'
        }`}
      >
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
          activeRole === 'lender' ? 'bg-[#7E22CE] text-white' : 'bg-[#180933] text-[#9CA3AF]'
        }`}>
          <Landmark className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <span>🏦 NBFC Underwriting Terminal</span>
          <span className="hidden md:inline text-[11px] text-[#A855F7] font-normal font-mono">(Lender)</span>
        </div>
        {hasIssuedCredential && activeRole !== 'lender' && (
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
        )}
        {activeRole === 'lender' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]"></span>
        )}
      </button>
    </div>
  );
};
