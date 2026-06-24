import type { ZenithContentType } from "@/types/zenith-content";

export const ZENITH_THEME = {
  colors: {
    navy: "#1e3560",
    deepNavy: "#0B1220",
    softNavy: "#243B63",
    darkerNavy: "#111827",
    white: "#FFFFFF",
    offWhite: "#F8F5EF",
    cream: "#FAF7F2",
    lightGray: "#F3F4F6",
    border: "#E5E7EB",
    text: "#111827",
    mutedText: "#667085",
    amber: "#D89A2B",
    green: "#2F8F5B",
    red: "#B94A48",
    blue: "#2563EB",
    slate: "#475467",
  },
  maxWidths: {
    content: "max-w-3xl",
    wide: "max-w-5xl",
    full: "max-w-7xl",
  },
} as const;

export type ZenithShellId = "article" | "landing" | "lead-magnet" | "webinar" | "cta" | "research";

export type ZenithPageTheme = {
  pageClassName: string;
  shell: ZenithShellId;
  accent: "navy" | "gold" | "blue" | "white" | "slate";
  heroTreatment: "editorial" | "conversion" | "guide" | "event" | "action" | "clinical";
};

export function getZenithPageTheme(contentType: ZenithContentType): ZenithPageTheme {
  switch (contentType) {
    case "article":
      return {
        pageClassName: "bg-[#FAF7F2] text-slate-950",
        shell: "article",
        accent: "navy",
        heroTreatment: "editorial",
      };
    case "landing_page":
    case "thank_you_page":
      return {
        pageClassName: "bg-[#FAF7F2] text-slate-950",
        shell: "landing",
        accent: "navy",
        heroTreatment: "conversion",
      };
    case "lead_magnet_page":
      return {
        pageClassName: "bg-[#F8F5EF] text-slate-950",
        shell: "lead-magnet",
        accent: "gold",
        heroTreatment: "guide",
      };
    case "webinar_page":
      return {
        pageClassName: "bg-[#0B1220] text-white",
        shell: "webinar",
        accent: "blue",
        heroTreatment: "event",
      };
    case "cta_page":
      return {
        pageClassName: "bg-[#0B1220] text-white",
        shell: "cta",
        accent: "white",
        heroTreatment: "action",
      };
    case "research_page":
      return {
        pageClassName: "bg-white text-slate-950",
        shell: "research",
        accent: "slate",
        heroTreatment: "clinical",
      };
    default:
      return {
        pageClassName: "bg-[#FAF7F2] text-slate-950",
        shell: "article",
        accent: "navy",
        heroTreatment: "editorial",
      };
  }
}

export function getVerdictTheme(verdict?: string): {
  label: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
} {
  const v = verdict?.toLowerCase().trim() ?? "";
  if (v === "deal-alive") {
    return {
      label: verdict ?? "",
      borderClass: "border-l-[#2F8F5B]",
      bgClass: "bg-emerald-50/90",
      textClass: "text-emerald-900",
    };
  }
  if (v === "deal-shifted") {
    return {
      label: verdict ?? "",
      borderClass: "border-l-[#D89A2B]",
      bgClass: "bg-amber-50/90",
      textClass: "text-amber-950",
    };
  }
  if (v === "deal-dead") {
    return {
      label: verdict ?? "",
      borderClass: "border-l-[#B94A48]",
      bgClass: "bg-red-50/90",
      textClass: "text-red-950",
    };
  }
  return {
    label: verdict || "Signal",
    borderClass: "border-l-slate-500",
    bgClass: "bg-slate-50",
    textClass: "text-slate-800",
  };
}

export type InlineCtaVisual = "urgency" | "outcome" | "full-block";

export function getInlineCtaTheme(variant?: string): {
  visual: InlineCtaVisual;
  wrapperClass: string;
} {
  const v = variant?.toLowerCase().trim() ?? "";
  if (v === "full-block") {
    return {
      visual: "full-block",
      wrapperClass:
        "w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#1e3560] text-white py-10 px-4 sm:px-6",
    };
  }
  if (v === "outcome") {
    return {
      visual: "outcome",
      wrapperClass:
        "mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white/80 px-6 py-8 text-center shadow-sm",
    };
  }
  return {
    visual: "urgency",
    wrapperClass:
      "mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white/90 px-6 py-8 shadow-sm",
  };
}
