"use client";
import { useState } from "react";
import { CodeBlock } from "./CodeBlock";

type Tab = { id: string; label: string; lang: "curl" | "js" | "py" | "json" | "ts"; code: string };

export function CodeTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const cur = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="col gap-12">
      <div
        className="row gap-4"
        style={{
          background: "var(--bg-sunken)",
          padding: 3,
          borderRadius: 8,
          border: "1px solid var(--line)",
          alignSelf: "flex-start",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="btn btn-sm"
            style={{
              background: active === t.id ? "var(--bg-elev)" : "transparent",
              borderColor: active === t.id ? "var(--line)" : "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {cur ? <CodeBlock code={cur.code} lang={cur.lang} /> : null}
    </div>
  );
}
