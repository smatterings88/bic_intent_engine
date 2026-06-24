import { ComparisonTableBeforeAfter } from "@/components/zenith/variants/ComparisonTableBeforeAfter";
import type { ComparisonTableComponent } from "@/types/zenith-content";

export function ComparisonTable({ component }: { component: ComparisonTableComponent }) {
  if (component.variant === "before-after") {
    return <ComparisonTableBeforeAfter component={component} />;
  }
  const cols = component.columns ?? [];
  const rows = component.rows ?? [];
  if (!cols.length && !rows.length) return null;
  return (
    <div className="my-10 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm text-slate-800">
        {component.caption ? (
          <caption className="caption-top px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {component.caption}
          </caption>
        ) : null}
        {cols.length ? (
          <thead className="bg-slate-100">
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-slate-200 odd:bg-white even:bg-slate-50/80">
              {row.map((cell, ci) => (
                <td key={ci} className="whitespace-nowrap px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
