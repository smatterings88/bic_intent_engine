import type { ZenithPage } from "@/types/zenith-content";

export type ZenithRenderMode = "public" | "preview" | "admin";

export type ZenithComponentRenderContext = {
  page: ZenithPage;
  isArticle?: boolean;
};
