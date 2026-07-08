"use client";

import { useEffect, useState } from "react";
import { ExternalLink, History } from "lucide-react";
import { type ActivityItem, readActivities } from "../lib/activity";

function formatTime(timestamp: number) {
  const delta = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));

  if (delta < 60) {
    return `${delta}s ago`;
  }

  if (delta < 3600) {
    return `${Math.floor(delta / 60)}m ago`;
  }

  if (delta < 86400) {
    return `${Math.floor(delta / 3600)}h ago`;
  }

  return `${Math.floor(delta / 86400)}d ago`;
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <p className="mt-1 text-xs text-zinc-400">{item.detail}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{formatTime(item.createdAt)}</p>
        {item.txHash ? (
          <a
            className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            href={`https://testnet.monadscan.com/tx/${item.txHash}`}
            rel="noreferrer"
            target="_blank"
          >
            Tx
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function LiveActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readActivities());

    sync();
    window.addEventListener("fanbadge:activity", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("fanbadge:activity", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/70 px-6 py-10 text-center">
        <History className="mx-auto h-8 w-8 text-zinc-600" />
        <p className="mt-4 text-sm text-zinc-400">Your recent on-chain interactions will appear here after you mint or interact.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ActivityRow item={item} key={item.id} />
      ))}
    </div>
  );
}
