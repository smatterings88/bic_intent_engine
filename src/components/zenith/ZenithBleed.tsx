import type { ReactNode } from "react";

/** Full-viewport width breakout from a centered page shell. */
export function ZenithBleed({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen ${className}`.trim()}
    >
      {children}
    </div>
  );
}
