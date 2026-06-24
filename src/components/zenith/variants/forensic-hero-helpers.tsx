import type { ReactNode } from "react";

import type { ForensicArtifactExchange, ForensicWaveformBar } from "@/types/zenith-content";

export type WaveformToneClass = "g" | "a" | "r" | "rr";

export const FALLBACK_BAR_HEIGHTS = [
  28, 45, 62, 38, 55, 70, 48, 65, 42, 58, 72, 50, 68, 44, 60, 75, 52, 66, 40, 56, 71, 46, 63, 39,
  54, 67, 43, 59, 74, 51, 64, 41, 57, 69, 47, 61, 76, 53, 65, 37, 55, 70, 49, 62, 38, 54, 68, 45,
];

export function normalizeWaveformTone(tone?: string): WaveformToneClass {
  const t = (tone ?? "").toLowerCase();
  if (t === "g" || t.includes("green") || t.includes("engaged")) return "g";
  if (t === "a" || t.includes("amber") || t.includes("drift")) return "a";
  if (t === "r" || t.includes("collapse") || (t.includes("red") && !t.includes("deep"))) return "r";
  if (t === "rr" || t.includes("deep") || t.includes("exit") || t.includes("fake")) return "rr";
  return "g";
}

export function defaultWaveformBars(): WaveformWaveformBarWithClass[] {
  const out: WaveformWaveformBarWithClass[] = [];
  for (let i = 0; i < 48; i++) {
    let tone: WaveformToneClass = "g";
    if (i < 26) tone = "g";
    else if (i < 34) tone = "a";
    else if (i < 42) tone = "r";
    else tone = "rr";
    out.push({
      tone,
      height: FALLBACK_BAR_HEIGHTS[i % FALLBACK_BAR_HEIGHTS.length],
    });
  }
  return out;
}

export type WaveformWaveformBarWithClass = {
  tone: WaveformToneClass;
  height: number;
};

export function resolveWaveformBars(
  waveform?: ForensicWaveformBar[],
): WaveformWaveformBarWithClass[] {
  if (waveform?.length) {
    return waveform.map((bar, i) => ({
      tone: normalizeWaveformTone(bar.tone),
      height:
        typeof bar.height === "number"
          ? bar.height
          : FALLBACK_BAR_HEIGHTS[i % FALLBACK_BAR_HEIGHTS.length],
    }));
  }
  return defaultWaveformBars();
}

export function normalizeMarkerClass(exchange: ForensicArtifactExchange): string {
  const value = `${exchange.markerTone ?? exchange.marker ?? ""}`.toLowerCase();
  if (value.includes("green") || value.includes("engaged") || value === "g") return "engaged";
  if (value.includes("amber") || value.includes("drift") || value === "a") return "drift";
  if (
    value.includes("collapse") ||
    (value.includes("red") && !value.includes("deep")) ||
    value === "r"
  )
    return "collapse";
  if (value.includes("deep") || value.includes("exit") || value.includes("fake") || value === "rr")
    return "exit";
  return "engaged";
}

export function isFlaggedExchange(exchange: ForensicArtifactExchange): boolean {
  const cls = normalizeMarkerClass(exchange);
  return cls === "drift" || cls === "collapse" || cls === "exit";
}

export function markerDisplayLabel(exchange: ForensicArtifactExchange): string {
  const raw = exchange.marker?.trim();
  if (raw) {
    if (raw.length <= 4 && raw === raw.toLowerCase()) {
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    return raw;
  }
  const cls = normalizeMarkerClass(exchange);
  if (cls === "engaged") return "Engaged";
  if (cls === "drift") return "Drift";
  if (cls === "collapse") return "Collapse";
  return "Exit";
}

export function renderHighlightedLine(line: string, highlight?: string): ReactNode {
  if (!highlight?.trim()) return line;
  const h = highlight.trim();
  const idx = line.indexOf(h);
  if (idx < 0) return line;
  const before = line.slice(0, idx);
  const after = line.slice(idx + h.length);
  return (
    <>
      {before}
      <span className="hi">{h}</span>
      {after}
    </>
  );
}
