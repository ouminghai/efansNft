"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { FAN_BADGE_NFT_ABI, FAN_BADGE_NFT_ADDRESS } from "../constants/abis";
import { Loader2, ShieldCheck, Sparkles, UserCheck, CalendarDays } from "lucide-react";
import { toast } from "react-hot-toast";
import { monadTestnet } from "../lib/chains";
import { pushActivity } from "../lib/activity";

type BadgeMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type?: string; value?: number | string }>;
};

export const BadgeCard = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [metadata, setMetadata] = useState<BadgeMetadata | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const { data: balance, isLoading: isBalanceLoading } = useReadContract({
    address: FAN_BADGE_NFT_ADDRESS,
    abi: FAN_BADGE_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const { data: tokenId } = useReadContract({
    address: FAN_BADGE_NFT_ADDRESS,
    abi: FAN_BADGE_NFT_ABI,
    functionName: "tokenOfOwnerByIndex",
    args: address ? [address, 0n] : undefined,
    query: { enabled: !!address && (balance ? BigInt(balance) > 0n : false) },
  });

  const { data: tokenURI, isLoading: isURILoading } = useReadContract({
    address: FAN_BADGE_NFT_ADDRESS,
    abi: FAN_BADGE_NFT_ABI,
    functionName: "tokenURI",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });

  const isLoading = isBalanceLoading || (!!balance && BigInt(balance) > 0n && tokenId === undefined) || (tokenId !== undefined && isURILoading);

  const badgeAttributes = useMemo(() => {
    if (!metadata?.attributes) return { level: 1, role: "Silver Fan", joinDate: "Recently" };
    const level = metadata.attributes.find(a => a.trait_type === "Level")?.value || 1;
    const role = metadata.attributes.find(a => a.trait_type === "Role")?.value || "Silver Fan";
    const joinTs = metadata.attributes.find(a => a.trait_type === "Join Date")?.value;
    const joinDate = joinTs ? new Date(Number(joinTs) * 1000).toLocaleDateString() : "Recently";
    return { level, role, joinDate };
  }, [metadata]);

  useEffect(() => {
    if (typeof tokenURI === "string") {
      try {
        const json = atob(tokenURI.split(",")[1]);
        setMetadata(JSON.parse(json));
      } catch (e) {
        console.error("Failed to parse metadata", e);
      }
    }
  }, [tokenURI]);

  const handleMint = async () => {
    if (!address || !publicClient) {
      toast.error("Connect your wallet before minting.");
      return;
    }

    try {
      setIsMinting(true);
      toast.loading("Minting your fan badge...", { id: "mint-badge" });

      const hash = await writeContractAsync({
        address: FAN_BADGE_NFT_ADDRESS,
        abi: FAN_BADGE_NFT_ABI,
        functionName: "mint",
        account: address,
        chain: monadTestnet,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      pushActivity({
        kind: "mint",
        title: "Badge minted",
        detail: "Joined the Eason Fan Community on Monad Testnet.",
        txHash: hash,
      });

      toast.success("Welcome to the community!", { id: "mint-badge" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mint failed.";
      toast.error(message, { id: "mint-badge" });
    } finally {
      setIsMinting(false);
    }
  };

  if (!isConnected) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (balance === 0n) {
    return (
      <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <h3 className="text-lg font-semibold text-white mb-2">Join the Community</h3>
        <p className="text-zinc-400 text-sm mb-6">Claim your exclusive Eason Fan Badge to unlock interactions and rewards.</p>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2 font-semibold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMinting}
          onClick={handleMint}
        >
          {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Mint Fan Badge
        </button>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-purple-500/50 transition-all duration-500 shadow-xl shadow-purple-500/5">
      <div className="aspect-square w-full bg-zinc-800 flex items-center justify-center overflow-hidden border-b border-zinc-800">
        {metadata?.image ? (
          <img src={metadata.image} alt="Fan Badge" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-cyan-900/20" />
        )}
      </div>
      <div className="p-5 bg-zinc-900/90 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-white tracking-tight">{metadata?.name || "Fan Badge"}</h3>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-black rounded-full border border-purple-500/30">
            LVL {badgeAttributes.level}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <UserCheck className="w-4 h-4 text-purple-500" />
            <span>{badgeAttributes.role}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <CalendarDays className="w-4 h-4 text-purple-500" />
            <span>Joined: {badgeAttributes.joinDate}</span>
          </div>
        </div>
        
        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 border-t border-zinc-800/50 pt-3">
          {metadata?.description}
        </p>
      </div>
    </div>
  );
};
