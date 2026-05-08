"use client";
import { useState } from "react";
import { ChartCard } from "./ChartCard";
import { SectionHead } from "./SectionHead";
import type { TimelinePoint } from "@/lib/types";

type View = "all" | "confirmed" | "deaths";

export function TimelineSection({ data }: { data: TimelinePoint[] }) {
  const [view, setView] = useState<View>("all");
  return (
    <div className="card" style={{ padding: 24 }}>
      <SectionHead
        eyebrow="Last 24 weeks"
        title="Reported cases over time"
        sub="Provisional weekly counts of confirmed and suspected Hantavirus cases, with deaths overlaid."
        action={
          <div
            className="row gap-4"
            style={{
              background: "var(--bg-sunken)",
              padding: 3,
              borderRadius: 8,
              border: "1px solid var(--line)",
            }}
          >
            {(["all", "confirmed", "deaths"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="btn btn-sm"
                style={{
                  background: view === v ? "var(--bg-elev)" : "transparent",
                  borderColor: view === v ? "var(--line)" : "transparent",
                  textTransform: "capitalize",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />
      <ChartCard
        data={data}
        height={300}
        showSuspected={view === "all"}
        showDeaths={view !== "confirmed"}
      />
      <div
        className="row gap-16 wrap"
        style={{
          marginTop: 12,
          paddingTop: 14,
          borderTop: "1px solid var(--line)",
          fontSize: 12,
        }}
      >
        <span className="muted" style={{ fontSize: 11.5, fontFamily: "JetBrains Mono, monospace" }}>
          Source: aggregated from WHO, CDC, ECDC, PAHO, ministries
        </span>
      </div>
    </div>
  );
}
