import { useState } from 'react';
import { EarnerPortal } from './components/earner/EarnerPortal';
import { useWorkerProfile } from './hooks/useWorkerProfile';
import { LenderDesk } from './components/lender/LenderDesk';
import { Zap, Monitor, Smartphone, Columns, Loader2 } from 'lucide-react';

type ViewMode = 'MOBILE' | 'DESKTOP' | 'SPLIT';

function App() {
  const { profile, loading, isOffline } = useWorkerProfile();
  const [viewMode, setViewMode] = useState<ViewMode>('SPLIT');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-[#111827] flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight tracking-wide">GIgnite</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
              Igniting financial identity for the informal workforce
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Viewport Switcher */}
          <div className="hidden md:flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            <button 
              onClick={() => setViewMode('MOBILE')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'MOBILE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="Earner Portal (Mobile)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('SPLIT')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'SPLIT' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="Side-by-Side Split View"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('DESKTOP')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'DESKTOP' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="Lender Desk (Desktop)"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Backend Status Indicator */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            {!isOffline ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-400">Engine Online</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-xs font-medium text-amber-400">Mock Fixture Mode</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 flex transition-all duration-500 ease-in-out ${viewMode === 'SPLIT' ? '' : viewMode === 'MOBILE' ? '-translate-x-0' : '-translate-x-full md:-translate-x-0'}`}>
          
          {/* Mobile View (Earner Portal) */}
          <div className={`h-full transition-all duration-500 ease-in-out border-r border-slate-800/50 ${
            viewMode === 'MOBILE' ? 'w-full' : viewMode === 'SPLIT' ? 'w-full md:w-1/2' : 'w-0 overflow-hidden'
          }`}>
            {profile && <EarnerPortal profile={profile} />}
          </div>
          
          {/* Desktop View (Lender Desk Placeholder) */}
          <div className={`h-full bg-[#0B0F19] transition-all duration-500 ease-in-out border-l border-slate-800/50 relative overflow-hidden ${
            viewMode === 'DESKTOP' ? 'w-full' : viewMode === 'SPLIT' ? 'hidden md:block w-1/2' : 'w-0 hidden'
          }`}>
            <LenderDesk />
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default App;
