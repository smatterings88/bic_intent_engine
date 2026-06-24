"use client";

import { useEffect, useState } from "react";

function parseEventDate(raw?: string): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function WebinarCountdown({ eventDate }: { eventDate?: string }) {
  const target = parseEventDate(eventDate);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [target]);

  if (!target) return null;
  const diff = target.getTime() - now;
  if (diff <= 0) {
    return <p className="text-sm font-medium text-amber-200">Event has started or passed.</p>;
  }
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return (
    <p className="font-mono text-sm text-white/90" suppressHydrationWarning>
      Starts in {days > 0 ? `${days}d ` : ""}
      {hrs}h {mins}m {secs}s
    </p>
  );
}
