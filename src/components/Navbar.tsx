"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BadgeCheck } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <BadgeCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-mono">
            Efans Nft
          </span>
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
};
