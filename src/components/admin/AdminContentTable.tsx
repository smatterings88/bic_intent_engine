import type { ReactNode } from "react";

export function AdminContentTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-border/80 bg-card/40 shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border/80 bg-muted/50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80">{children}</tbody>
      </table>
    </div>
  );
}
