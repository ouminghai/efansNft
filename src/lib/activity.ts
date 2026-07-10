export type ActivityKind = "mint" | "checkIn" | "like" | "song" | "vote" | "upgrade" | "donate";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  txHash?: string;
  createdAt: number;
};

const STORAGE_KEY = "fanbadge-activity";

export function readActivities(): ActivityItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ActivityItem[];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function pushActivity(item: Omit<ActivityItem, "id" | "createdAt">) {
  if (typeof window === "undefined") {
    return;
  }

  const nextItem: ActivityItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
  };

  const next = [nextItem, ...readActivities()].slice(0, 8);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("fanbadge:activity"));
}
