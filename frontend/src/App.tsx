import { EarnerPortal } from './components/earner/EarnerPortal';
import { LenderDesk } from './components/lender/LenderDesk';
import { useWorkerProfile } from './hooks/useWorkerProfile';
import { Zap, Loader2 } from 'lucide-react';

function App() {
  const { loading, isOffline } = useWorkerProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-900/10 blur-[120px] pointer-events-none rounded-full" />
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F19] text-slate-100 min-h-screen font-sans antialiased flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-900/10 blur-[120px] pointer-events-none rounded-full" />
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0B0F19]/80 border-b border-white/5 px-6 py-4 transition-all flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold text-white leading-tight tracking-wide">GIgnite</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
              Financial Identity for the Informal Workforce
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
          {!isOffline ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 tracking-wider">LIVE ENGINE</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-bold text-amber-400 tracking-wider">MOCK FIXTURE MODE</span>
            </>
          )}
        </div>
      </header>

      {/* Floating Scenario Preset Toolbar */}
      <div className="sticky top-[80px] z-30 max-w-fit mx-auto bg-slate-900/40 border border-white/5 backdrop-blur-xl px-6 py-2 rounded-full flex flex-wrap gap-4 items-center justify-center shadow-2xl mt-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[10px] tracking-widest text-slate-300 uppercase font-mono">⚡ EVALUATION PRESETS</span>
        </div>
        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('TRIGGER_SCENARIO', { detail: 'A' }))}
            className="px-3 py-1.5 rounded-full border border-white/5 text-emerald-300 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-transparent hover:border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
          >
            Scenario A: ₹30k Standard
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('TRIGGER_SCENARIO', { detail: 'B' }))}
            className="px-3 py-1.5 rounded-full border border-white/5 text-rose-300 hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-transparent hover:border-rose-500/30 text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
          >
            Scenario B: Fraud Tamper Halt
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('TRIGGER_SCENARIO', { detail: 'C' }))}
            className="px-3 py-1.5 rounded-full border border-white/5 text-amber-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-transparent hover:border-amber-500/30 text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
          >
            Scenario C: ₹75k Remediation
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (cols 1-5): Screen 1 - Earner Mobile Portal */}
          <div className="lg:col-span-5">
            <EarnerPortal />
          </div>
          
          {/* Right Column (cols 6-12): Screen 2 - Lender Verification Desk */}
          <div className="lg:col-span-7">
            <LenderDesk />
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default App;
