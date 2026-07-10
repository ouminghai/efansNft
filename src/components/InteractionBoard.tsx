"use client";

import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { POINT_SYSTEM_ABI, POINT_SYSTEM_ADDRESS } from "../constants/abis";
import { Calendar, Heart, Music, Vote, ArrowUpCircle, Loader2, Coins } from "lucide-react";
import { toast } from "react-hot-toast";
import { monadTestnet } from "../lib/chains";
import { pushActivity } from "../lib/activity";
import { useState } from "react";
import { parseEther } from "viem";

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
    value,
  }: {
    actionId: string;
    title: string;
    detail: string;
    functionName: string;
    args?: any[];
    value?: bigint;
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
        value,
        account: address,
        chain: monadTestnet,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      pushActivity({
        kind: actionId as any,
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
        title: "Daily Check-in",
        detail: "Claimed daily interaction reward.",
        functionName: "checkIn",
      });
    } else if (action === "like") {
      void runContractAction({
        actionId: "like",
        title: "Like Support",
        detail: "Liked Eason's latest update.",
        functionName: "like",
      });
    } else if (action === "song") {
      void runContractAction({
        actionId: "song",
        title: "Song Support",
        detail: "Supported the song 'Uphill Road'.",
        functionName: "supportSong",
        args: ["Uphill Road"],
      });
    } else if (action === "vote") {
      void runContractAction({
        actionId: "vote",
        title: "Community Vote",
        detail: "Voted for the next concert city.",
        functionName: "vote",
        args: [1n], // Proposal ID 1
      });
    } else if (action === "donate") {
      void runContractAction({
        actionId: "donate",
        title: "Creator Donation",
        detail: "Donated 0.1 MON to support Eason.",
        functionName: "donate",
        value: parseEther("0.1"),
      });
    }
  };

  const handleUpgrade = () => {
    void runContractAction({
      actionId: "upgrade",
      title: "Badge Upgrade",
      detail: "Leveled up the Eason Fan Badge.",
      functionName: "upgradeBadge",
    });
  };

  const actions = [
    { id: "checkIn", name: "Daily Check-in", icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10", desc: "Earn +10 pts" },
    { id: "like", name: "Like Support", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", desc: "Earn +2 pts" },
    { id: "song", name: "Song Support", icon: Music, color: "text-amber-400", bg: "bg-amber-500/10", desc: "Earn +20 pts" },
    { id: "vote", name: "DAO Vote", icon: Vote, color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "Weight based on level" },
    { id: "donate", name: "Support Eason", icon: Coins, color: "text-purple-400", bg: "bg-purple-500/10", desc: "0.1 MON = 10 pts" },
  ];

  return (
    <div className="flex flex-col gap-4">
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
              <p className="text-zinc-500 text-xs">{action.desc}</p>
            </div>
            {activeAction === action.id ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-zinc-400" /> : null}
          </button>
        ))}
      </div>
      
      <button
        onClick={handleUpgrade}
        disabled={!!activeAction}
        className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50"
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
