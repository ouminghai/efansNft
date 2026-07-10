"use client";

import { useAccount, useReadContract } from "wagmi";
import { POINT_SYSTEM_ABI, POINT_SYSTEM_ADDRESS } from "../constants/abis";
import { Coins, TrendingUp, HandCoins } from "lucide-react";
import { useMemo } from "react";
import { formatEther } from "viem";

export const PointsDisplay = () => {
  const { address, isConnected } = useAccount();

  const { data: userData } = useReadContract({
    address: POINT_SYSTEM_ADDRESS,
    abi: POINT_SYSTEM_ABI,
    functionName: "users",
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const [points, lastCheckIn, totalDonated] = userData || [0n, 0n, 0n];

  const nextLevelCost = useMemo(() => {
    const currentPoints = Number(points);
    const baseCost = 50; // Simple logic, match contract if possible
    const deficit = Math.max(baseCost - currentPoints, 0);

    return {
      baseCost,
      deficit,
    };
  }, [points]);

  if (!isConnected) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-zinc-400 font-medium">Available Points</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-white leading-none">
            {points.toString()}
          </span>
          <span className="text-zinc-500 font-mono text-sm mb-1">PTS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-zinc-400">
              {nextLevelCost.deficit === 0 ? "Upgrade Ready" : `${nextLevelCost.deficit} pts to next level`}
            </span>
          </div>
          <span className="text-xs font-bold text-white">{nextLevelCost.baseCost} PTS</span>
        </div>

        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-zinc-400">Total Support</span>
          </div>
          <span className="text-xs font-bold text-white">{formatEther(totalDonated)} MON</span>
        </div>
      </div>
    </div>
  );
};
