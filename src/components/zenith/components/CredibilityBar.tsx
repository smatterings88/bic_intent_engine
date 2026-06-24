import type { ReactNode } from "react";

import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { CredibilityBarComponent } from "@/types/zenith-content";

function renderWithEmphasis(text: string, emphasis?: string[]): ReactNode {
  if (!text.trim()) return null;
  const phrases = (emphasis ?? []).map((p) => p.trim()).filter(Boolean);
  if (!phrases.length) return text;

  type Part = { text: string; bold: boolean };
  let parts: Part[] = [{ text, bold: false }];

  for (const phrase of phrases) {
    const next: Part[] = [];
    for (const part of parts) {
      if (part.bold) {
        next.push(part);
        continue;
      }
      let rest = part.text;
      while (rest.length) {
        const idx = rest.indexOf(phrase);
        if (idx < 0) {
          next.push({ text: rest, bold: false });
          break;
        }
        if (idx > 0) next.push({ text: rest.slice(0, idx), bold: false });
        next.push({ text: phrase, bold: true });
        rest = rest.slice(idx + phrase.length);
      }
    }
    parts = next;
  }

  return parts.map((p, i) =>
    p.bold ? (
      <strong key={`${i}-${p.text.slice(0, 12)}`}>{p.text}</strong>
    ) : (
      <span key={`${i}-${p.text.slice(0, 12)}`}>{p.text}</span>
    ),
  );
}

export function CredibilityBar({ component }: { component: CredibilityBarComponent }) {
  if (!component.text?.trim()) return null;
  return (
    <ZenithBleed>
      <section className="cred-bar" aria-label="Credibility">
        <div className="cred-bar-inner">
          <p className="cred-bar-text">{renderWithEmphasis(component.text, component.emphasis)}</p>
        </div>
      </section>
    </ZenithBleed>
  );
}
