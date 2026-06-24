import type { ResearchCalloutComponent } from "@/types/zenith-content";

export function ResearchCalloutArtifactBox({ component }: { component: ResearchCalloutComponent }) {
  if (!component.rows?.length) return null;
  return (
    <aside className="rc-artifact-box" aria-label="Case metadata">
      {component.rows.map((row) => (
        <div key={row.key} className="rcab-row">
          <span className="rcab-key">{row.key}</span>
          <span className={`rcab-val${row.style === "green" ? " green" : ""}`}>{row.value}</span>
        </div>
      ))}
    </aside>
  );
}
