import { EarnerPortal } from './components/earner/EarnerPortal';
import { LenderDesk } from './components/lender/LenderDesk';
import { useWorkerProfile } from './hooks/useWorkerProfile';
import { Zap, Loader2 } from 'lucide-react';

function App() {
  const { loading, isOffline } = useWorkerProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 backdrop-blur-md">
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
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Engine Online</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Mock Mode</span>
            </>
          )}
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
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
