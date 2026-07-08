import { useAccount, useReadContract } from "wagmi";
import { FAN_BADGE_NFT_ABI, FAN_BADGE_NFT_ADDRESS } from "../constants/abis";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export const BadgeCard = () => {
  const { address, isConnected } = useAccount();
  const [metadata, setMetadata] = useState<any>(null);

  const { data: balance } = useReadContract({
    address: FAN_BADGE_NFT_ADDRESS,
    abi: FAN_BADGE_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: tokenId } = useReadContract({
    address: FAN_BADGE_NFT_ADDRESS,
    abi: FAN_BADGE_NFT_ABI,
    functionName: "tokenOfOwnerByIndex",
    args: address ? [address, 0n] : undefined,
    query: { enabled: !!address && Number(balance) > 0 },
  });

  const { data: tokenURI, isLoading } = useReadContract({
    address: FAN_BADGE_NFT_ADDRESS,
    abi: FAN_BADGE_NFT_ABI,
    functionName: "tokenURI",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });

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

  if (!isConnected) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (Number(balance) === 0) {
    return (
      <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <h3 className="text-lg font-semibold text-white mb-2">No Badge Found</h3>
        <p className="text-zinc-400 text-sm mb-6">Mint your first fan badge to start your journey!</p>
        <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all">
          Mint Initial Badge
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
            LVL {metadata?.attributes?.[0]?.value || 1}
          </span>
        </div>
        <p className="text-zinc-400 text-xs line-clamp-2">{metadata?.description}</p>
      </div>
    </div>
  );
};
