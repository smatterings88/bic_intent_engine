import { parseGhlTagStrategy } from "@/lib/ghl/tag-strategy";
import type {
  ForensicArtifact,
  ForensicArtifactExchange,
  ForensicWaveformBar,
  PageHeroMicroProof,
  TranscriptCaseFileExchange,
  ZenithCta,
} from "@/types/zenith-content";

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    if (typeof v === "string") {
      const t = v.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

function parseCta(raw: unknown): ZenithCta | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const label = typeof o.label === "string" ? o.label.trim() : "";
  const destination = typeof o.destination === "string" ? o.destination.trim() : "";
  if (!label || !destination) return undefined;
  return { label, destination };
}

function str(raw: unknown): string | undefined {
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function parseWaveform(raw: unknown): ForensicWaveformBar[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ForensicWaveformBar[] = [];
  for (const bar of raw) {
    if (!bar || typeof bar !== "object") continue;
    const b = bar as Record<string, unknown>;
    const tone = str(b.tone);
    const height = typeof b.height === "number" ? b.height : undefined;
    if (tone || height !== undefined) {
      out.push({ tone, height });
    }
  }
  return out.length ? out : undefined;
}

export function parseForensicArtifact(raw: unknown): ForensicArtifact | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const exchanges: ForensicArtifactExchange[] = [];
  if (Array.isArray(o.exchanges)) {
    for (const ex of o.exchanges) {
      if (!ex || typeof ex !== "object") continue;
      const e = ex as Record<string, unknown>;
      const line = str(e.line);
      if (!line) continue;
      exchanges.push({
        timestamp: str(e.timestamp),
        speaker: str(e.speaker),
        line,
        highlight: str(e.highlight),
        marker: str(e.marker),
        markerTone: str(e.markerTone),
        annotation: str(e.annotation),
      });
    }
  }
  const waveform = parseWaveform(o.waveform);
  const timestamps = parseStringArray(o.timestamps);
  const driftPositionPercent =
    typeof o.driftPositionPercent === "number" ? o.driftPositionPercent : undefined;
  if (
    !str(o.caseId) &&
    !exchanges.length &&
    !str(o.verdict) &&
    !waveform?.length &&
    !timestamps?.length
  ) {
    return undefined;
  }
  return {
    caseId: str(o.caseId),
    status: str(o.status),
    waveform,
    driftPositionPercent,
    driftLabel: str(o.driftLabel),
    timestamps: timestamps?.length ? timestamps : undefined,
    exchanges: exchanges.length ? exchanges : undefined,
    verdictLabel: str(o.verdictLabel),
    verdict: str(o.verdict),
    footer: str(o.footer),
  };
}

export function parseMicroProof(raw: unknown): PageHeroMicroProof | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const proof = {
    buyerLabel: str(o.buyerLabel),
    buyerLine: str(o.buyerLine),
    analysisLabel: str(o.analysisLabel),
    analysisLine: str(o.analysisLine),
  };
  if (!proof.buyerLine && !proof.analysisLine) return undefined;
  return proof;
}

export function parseMoments(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  const out: NonNullable<import("@/types/zenith-content").MomentListComponent["moments"]> = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const o = m as Record<string, unknown>;
    const title = str(o.title);
    const description = str(o.description);
    if (!title && !description) continue;
    out.push({
      number: str(o.number),
      timestamp: str(o.timestamp),
      title,
      description,
      snippet: str(o.snippet),
      signal: str(o.signal),
    });
  }
  return out.length ? out : undefined;
}

export function parseWhyMissBlocks(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  const out: Array<{ number?: string; title?: string; body?: string }> = [];
  for (const b of raw) {
    if (!b || typeof b !== "object") continue;
    const o = b as Record<string, unknown>;
    const title = str(o.title);
    const body = str(o.body);
    if (!title && !body) continue;
    out.push({ number: str(o.number), title, body });
  }
  return out.length ? out : undefined;
}

export function parseForensicDownloadForm(raw: unknown) {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const destination = str(o.destination);
  if (!destination) return undefined;
  const ghlTagStrategy = parseGhlTagStrategy(o.ghlTagStrategy);
  const legacyGhlTags = ghlTagStrategy ? [] : parseStringArray(o.ghlTags);
  return {
    destination,
    ctaText: str(o.ctaText),
    fields: parseStringArray(o.fields),
    ghlTags: legacyGhlTags.length ? legacyGhlTags : undefined,
    ghlTagStrategy,
    thankYouPageUrl: str(o.thankYouPageUrl) ?? (str(o.redirect) ? str(o.redirect) : undefined),
    redirect: str(o.redirect),
    source: str(o.source),
    variant: str(o.variant) ?? "lead-magnet-capture",
    thankYouMessage: str(o.thankYouMessage),
  };
}

export function parseCaseFileExchanges(raw: unknown): TranscriptCaseFileExchange[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: TranscriptCaseFileExchange[] = [];
  for (const ex of raw) {
    if (!ex || typeof ex !== "object") continue;
    const e = ex as Record<string, unknown>;
    const markerRaw = e.marker;
    let marker: TranscriptCaseFileExchange["marker"];
    if (markerRaw && typeof markerRaw === "object") {
      const m = markerRaw as Record<string, unknown>;
      marker = {
        type: str(m.type),
        label: str(m.label),
        description: str(m.description),
        note: str(m.note),
      };
    }
    out.push({
      timestamp: str(e.timestamp),
      salesperson: str(e.salesperson),
      buyer: str(e.buyer),
      marker,
    });
  }
  return out.length ? out : undefined;
}

export function parseSummaryRows(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const label = str(r.label);
      const value = str(r.value);
      if (!label || !value) return null;
      return { label, value, highlight: r.highlight === true };
    })
    .filter(Boolean);
}

export function parseStatBlock(raw: unknown) {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  return {
    premise: str(o.premise),
    number: str(o.number),
    consequence: str(o.consequence),
  };
}

export function parseVerdictRows(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const label = str(r.label);
      const value = str(r.value);
      if (!label || !value) return null;
      return { label, value };
    })
    .filter(Boolean);
}

export function parseEvidenceSignals(
  raw: unknown,
): Array<{ number?: string; label: string; description?: string }> | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: Array<{ number?: string; label: string; description?: string }> = [];
  for (const s of raw) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const label = str(o.label);
    if (!label) continue;
    out.push({
      number: str(o.number),
      label,
      description: str(o.description),
    });
  }
  return out.length ? out : undefined;
}

export function parseBeforeAfterCol(raw: unknown) {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  return { label: str(o.label), style: str(o.style) };
}

export function parseBeforeAfterRows(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  const flat: Array<{ a: string; b: string }> = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const a = str(r.a);
    const b = str(r.b);
    if (a && b) flat.push({ a, b });
  }
  return flat.length ? flat : undefined;
}

export function parseLayerDiagram(raw: unknown) {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const rec = o.recordingLayer;
  const interp = o.interpretationLayer;
  const parseLayer = (layer: unknown) => {
    if (!layer || typeof layer !== "object") return undefined;
    const l = layer as Record<string, unknown>;
    return {
      icon: str(l.icon),
      label: str(l.label),
      tools: str(l.tools),
      outputs: str(l.outputs),
    };
  };
  return {
    recordingLayer: parseLayer(rec),
    interpretationLayer: parseLayer(interp),
    caption: str(o.caption),
  };
}

export function parseToolStrip(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((t) => {
      if (!t || typeof t !== "object") return null;
      const o = t as Record<string, unknown>;
      const name = str(o.name);
      if (!name) return null;
      return { name, detail: str(o.detail) };
    })
    .filter(Boolean);
}

export function parseArtifactBoxRows(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const key = str(r.key);
      const value = str(r.value);
      if (!key || !value) return null;
      return { key, value, style: str(r.style) };
    })
    .filter(Boolean);
}

export function parseSherpaNameplate(raw: unknown) {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const scope = Array.isArray(o.scope)
    ? o.scope.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean)
    : undefined;
  return {
    name: str(o.name),
    descriptor: str(o.descriptor),
    scope: scope?.length ? scope : undefined,
  };
}

export function parseSherpaOps(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((op) => {
      if (!op || typeof op !== "object") return null;
      const o = op as Record<string, unknown>;
      const label = str(o.label);
      const value = str(o.value);
      if (!label || !value) return null;
      return { label, value };
    })
    .filter(Boolean);
}

export { parseCta, str };
