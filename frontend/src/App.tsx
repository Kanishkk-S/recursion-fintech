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
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#070b14]/90 border-b border-slate-800/80 px-6 py-4 transition-all flex items-center justify-between shrink-0">
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
