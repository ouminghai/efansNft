import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { POINT_SYSTEM_ABI, POINT_SYSTEM_ADDRESS } from "../constants/abis";
import { Calendar, Heart, Music, Vote, ArrowUpCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export const InteractionBoard = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleAction = (action: string) => {
    if (action === "checkIn") {
      writeContract({
        address: POINT_SYSTEM_ADDRESS,
        abi: POINT_SYSTEM_ABI,
        functionName: "checkIn",
      });
    } else if (action === "like" || action === "vote" || action === "song") {
      writeContract({
        address: POINT_SYSTEM_ADDRESS,
        abi: POINT_SYSTEM_ABI,
        functionName: "interact",
        args: [action],
      });
    }
  };

  const handleUpgrade = () => {
    writeContract({
      address: POINT_SYSTEM_ADDRESS,
      abi: POINT_SYSTEM_ABI,
      functionName: "upgradeBadge",
    });
  };

  const actions = [
    { id: "checkIn", name: "Daily Check-in", icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "like", name: "Like Support", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
    { id: "song", name: "Song Support", icon: Music, color: "text-amber-400", bg: "bg-amber-500/10" },
    { id: "vote", name: "Community Vote", icon: Vote, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleAction(action.id)}
          disabled={isPending || isConfirming}
          className={`flex items-center gap-4 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group ${action.bg}`}
        >
          <div className={`p-3 rounded-lg bg-zinc-950 group-hover:scale-110 transition-transform ${action.color}`}>
            <action.icon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="text-white font-semibold">{action.name}</h4>
            <p className="text-zinc-500 text-xs">Earn daily interaction points</p>
          </div>
        </button>
      ))}
      
      <button
        onClick={handleUpgrade}
        disabled={isPending || isConfirming}
        className="md:col-span-2 flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50"
      >
        {isPending || isConfirming ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ArrowUpCircle className="w-5 h-5" />
        )}
        UPGRADE BADGE
      </button>
    </div>
  );
};
