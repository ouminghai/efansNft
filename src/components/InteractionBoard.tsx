import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { POINT_SYSTEM_ABI, POINT_SYSTEM_ADDRESS } from "../constants/abis";
import { Calendar, Heart, Music, Vote, ArrowUpCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { monadTestnet } from "../lib/chains";
import { pushActivity } from "../lib/activity";
import { useState } from "react";

export const InteractionBoard = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const runContractAction = async ({
    actionId,
    title,
    detail,
    functionName,
    args,
  }: {
    actionId: string;
    title: string;
    detail: string;
    functionName: "checkIn" | "interact" | "upgradeBadge";
    args?: readonly [string];
  }) => {
    if (!address || !publicClient) {
      toast.error("Connect your wallet first.");
      return;
    }

    try {
      setActiveAction(actionId);
      toast.loading(`${title} is being submitted...`, { id: actionId });

      const hash = await writeContractAsync({
        address: POINT_SYSTEM_ADDRESS,
        abi: POINT_SYSTEM_ABI,
        functionName,
        args,
        account: address,
        chain: monadTestnet,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      pushActivity({
        kind: actionId as "checkIn" | "like" | "song" | "vote" | "upgrade",
        title,
        detail,
        txHash: hash,
      });

      toast.success(`${title} confirmed on-chain.`, { id: actionId });
    } catch (error) {
      const message = error instanceof Error ? error.message : `${title} failed.`;
      toast.error(message, { id: actionId });
    } finally {
      setActiveAction(null);
    }
  };

  const handleAction = (action: string) => {
    if (action === "checkIn") {
      void runContractAction({
        actionId: "checkIn",
        title: "Daily check-in",
        detail: "Claimed the daily interaction reward on Monad.",
        functionName: "checkIn",
      });
      return;
    }

    if (action === "song") {
      pushActivity({
        kind: "song",
        title: "Song support queued",
        detail: "The current contract only supports like and vote. Song support is reserved for the next contract upgrade.",
      });
      toast("Song support UI is ready, but the deployed contract does not expose this action yet.");
      return;
    }

    if (action === "like" || action === "vote") {
      void runContractAction({
        actionId: action,
        title: action === "like" ? "Like support" : "Community vote",
        detail: action === "like" ? "Supported the artist and earned interaction points." : "Cast a community vote and earned engagement points.",
        functionName: "interact",
        args: [action],
      });
    }
  };

  const handleUpgrade = () => {
    void runContractAction({
      actionId: "upgrade",
      title: "Badge upgrade",
      detail: "Spent points to level up the fan badge.",
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
          disabled={!!activeAction}
          className={`flex items-center gap-4 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group ${action.bg}`}
        >
          <div className={`p-3 rounded-lg bg-zinc-950 group-hover:scale-110 transition-transform ${action.color}`}>
            <action.icon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="text-white font-semibold">{action.name}</h4>
            <p className="text-zinc-500 text-xs">
              {action.id === "song" ? "UI ready, contract support pending" : "Earn daily interaction points"}
            </p>
          </div>
          {activeAction === action.id ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-zinc-400" /> : null}
        </button>
      ))}
      
      <button
        onClick={handleUpgrade}
        disabled={!!activeAction}
        className="md:col-span-2 flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50"
      >
        {activeAction === "upgrade" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ArrowUpCircle className="w-5 h-5" />
        )}
        UPGRADE BADGE
      </button>
    </div>
  );
};
