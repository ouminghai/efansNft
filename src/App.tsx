import { Navbar } from "./components/Navbar";
import { BadgeCard } from "./components/BadgeCard";
import { PointsDisplay } from "./components/PointsDisplay";
import { InteractionBoard } from "./components/InteractionBoard";
import { Toaster } from "react-hot-toast";
import { useAccount } from "wagmi";
import { Sparkles } from "lucide-react";

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-500/30">
      <Navbar />
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a',
        },
      }} />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Your Web3 Fan Identity <br /> Starts Here
            </h1>
            <p className="text-zinc-400 text-lg max-w-lg mb-10">
              Connect your wallet to mint your dynamic Fan Badge and start earning points through high-frequency interactions on Monad.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Profile & Points */}
            <div className="lg:col-span-4 space-y-6">
              <section>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Your Badge</h2>
                <BadgeCard />
              </section>
              <section>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Stats</h2>
                <PointsDisplay />
              </section>
            </div>

            {/* Right Column: Interactions */}
            <div className="lg:col-span-8 space-y-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Interaction Hub</h2>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Monad Testnet Active
                  </span>
                </div>
                <div className="p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                  <InteractionBoard />
                </div>
              </section>

              {/* Recent Activity Placeholder */}
              <section>
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Live Activity</h2>
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center">
                  <p className="text-zinc-500 text-sm">Recent on-chain interactions will appear here...</p>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-purple-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-cyan-600/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

export default App;
