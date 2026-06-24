import React, { type ReactNode } from "react";
import parse, { type DOMNode, Element } from "html-react-parser";

import type { ZenithPage, ZenithSlotConfig } from "@/types/zenith-content";

function isEmptySlotDiv(node: Element): boolean {
  if (node.name !== "div" || !node.attribs["data-sbi-slot"]) {
    return false;
  }
  const children = node.children ?? [];
  if (children.length === 0) return true;
  return children.every((child) => {
    if (child.type === "text") {
      return !(child.data ?? "").trim();
    }
    return false;
  });
}

export function renderSanitizedHtmlWithSlots(
  html: string,
  renderSlot: (slotId: string) => ReactNode,
): ReactNode {
  return parse(html, {
    replace(domNode: DOMNode) {
      if (!(domNode instanceof Element) || !isEmptySlotDiv(domNode)) {
        return undefined;
      }
      const slotId = domNode.attribs["data-sbi-slot"]?.trim();
      if (!slotId) return undefined;
      return <>{renderSlot(slotId)}</>;
    },
  });
}

export type SlotRendererContext = {
  page: ZenithPage;
  slots: ZenithSlotConfig[];
  renderLeadForm: (slotId: string, config: ZenithSlotConfig) => ReactNode;
  renderCta: (slotId: string, config: ZenithSlotConfig) => ReactNode;
  renderMissing: (slotId: string) => ReactNode;
  renderInvalid: (slotId: string) => ReactNode;
};

export function createSlotRenderer(ctx: SlotRendererContext) {
  const slotMap = new Map(ctx.slots.map((s) => [s.slot, s]));

  return (slotId: string): ReactNode => {
    const config = slotMap.get(slotId);
    if (!config) {
      return ctx.renderMissing(slotId);
    }
    if (config.type === "lead-form") {
      return ctx.renderLeadForm(slotId, config);
    }
    if (config.type === "cta") {
      return ctx.renderCta(slotId, config);
    }
    return null;
  };
}
