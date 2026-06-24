"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Footer } from "@/components/site/Footer";

type ZenithSiteLayoutContextValue = {
  hideGlobalFooter: boolean;
  setHideGlobalFooter: (hide: boolean) => void;
};

const ZenithSiteLayoutContext = createContext<ZenithSiteLayoutContextValue | null>(null);

export function isGlobalSiteFooterVisible(hideGlobalFooter: boolean): boolean {
  return !hideGlobalFooter;
}

export function ZenithSiteLayoutProvider({
  children,
  initialHideGlobalFooter = false,
}: {
  children: ReactNode;
  /** Resolved on the server from the published Zenith page for this pathname. */
  initialHideGlobalFooter?: boolean;
}) {
  const [hideGlobalFooter, setHideGlobalFooterState] = useState(initialHideGlobalFooter);
  const setHideGlobalFooter = useCallback((hide: boolean) => {
    setHideGlobalFooterState(hide);
  }, []);

  useLayoutEffect(() => {
    setHideGlobalFooterState(initialHideGlobalFooter);
  }, [initialHideGlobalFooter]);

  const value = useMemo(
    () => ({ hideGlobalFooter, setHideGlobalFooter }),
    [hideGlobalFooter, setHideGlobalFooter],
  );

  return (
    <ZenithSiteLayoutContext.Provider value={value}>{children}</ZenithSiteLayoutContext.Provider>
  );
}

function useZenithSiteLayout(): ZenithSiteLayoutContextValue {
  const ctx = useContext(ZenithSiteLayoutContext);
  if (!ctx) {
    throw new Error("useZenithSiteLayout must be used within ZenithSiteLayoutProvider");
  }
  return ctx;
}

export function SiteFooterGate() {
  const { hideGlobalFooter } = useZenithSiteLayout();
  if (!isGlobalSiteFooterVisible(hideGlobalFooter)) {
    return null;
  }
  return <Footer />;
}

/** Client fallback when server pathname resolution is unavailable (e.g. client navigations). */
export function ZenithSiteLayoutRegistrar({ hideGlobalFooter }: { hideGlobalFooter: boolean }) {
  const { setHideGlobalFooter } = useZenithSiteLayout();

  useLayoutEffect(() => {
    setHideGlobalFooter(hideGlobalFooter);
    return () => setHideGlobalFooter(false);
  }, [hideGlobalFooter, setHideGlobalFooter]);

  return null;
}
