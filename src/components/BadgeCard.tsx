"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { FAN_BADGE_NFT_ABI, FAN_BADGE_NFT_ADDRESS } from "../constants/abis";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
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

  const badgeLevel = useMemo(() => metadata?.attributes?.[0]?.value || 1, [metadata]);

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
        detail: "Your on-chain fan identity is now live on Monad Testnet.",
        txHash: hash,
      });

      toast.success("Badge minted successfully.", { id: "mint-badge" });
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
        <h3 className="text-lg font-semibold text-white mb-2">No Badge Found</h3>
        <p className="text-zinc-400 text-sm mb-6">Mint your first fan badge to activate your fan profile and start earning points.</p>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2 font-semibold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMinting}
          onClick={handleMint}
        >
          {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          初始化勋章
        </button>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-purple-500/50 transition-all duration-500">
      <div className="aspect-square w-full bg-zinc-800 flex items-center justify-center overflow-hidden">
        {metadata?.image ? (
          <img src={metadata.image} alt="Fan Badge" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-cyan-900/20" />
        )}
      </div>
      <div className="p-4 bg-zinc-900/90 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-white">{metadata?.name || "Fan Badge"}</h3>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30">
            LVL {badgeLevel}
          </span>
        </div>
        <p className="text-zinc-400 text-xs line-clamp-2">{metadata?.description}</p>
      </div>
    </div>
  );
};
