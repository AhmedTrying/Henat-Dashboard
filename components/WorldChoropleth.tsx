"use client";

// Homepage choropleth. Country data comes from the latest snapshot — see
// lib/snapshot.ts. This is a presentation-only component; no fetching.

import { useMemo, useState, type CSSProperties } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
} from "react-simple-maps";
import { fmtInt } from "@/lib/format";
import { iso2ToNumeric } from "@/lib/iso";
import type { CountryRecord } from "@/lib/types";

type Metric = "confirmed_cases" | "suspected_cases" | "deaths";

const METRICS: { key: Metric; label: string; hint: string }[] = [
  { key: "confirmed_cases", label: "Confirmed", hint: "Lab-confirmed cases" },
  { key: "suspected_cases", label: "Suspected", hint: "Awaiting confirmation" },
  { key: "deaths", label: "Deaths", hint: "Provisional deaths" },
];

// Calm 5-step ramp anchored on the existing accent (teal-leaning blue), with
// a slightly warmer top step for "deaths". We deliberately avoid a panic-red.
const RAMP_DEFAULT = [
  "var(--bg-sunken)",
  "oklch(0.92 0.04 215)",
  "oklch(0.78 0.07 215)",
  "oklch(0.62 0.085 215)",
  "oklch(0.46 0.09 215)",
];

const RAMP_DEATHS = [
  "var(--bg-sunken)",
  "oklch(0.92 0.04 50)",
  "oklch(0.82 0.07 45)",
  "oklch(0.66 0.10 40)",
  "oklch(0.50 0.12 35)",
];

const NO_DATA_FILL = "var(--bg-elev)";
const STROKE = "var(--line-strong)";

interface Bucket {
  cap: number;
  label: string;
  color: string;
}

function buildBuckets(values: number[], ramp: string[]): Bucket[] {
  const positives = values.filter((v) => v > 0);
  if (positives.length === 0) {
    return ramp.slice(1).map((c, i) => ({ cap: i + 1, label: "0", color: c }));
  }
  const max = Math.max(...positives);
  // 4 quartile-ish buckets above zero: 1..⌈max/8⌉, …, …, ⌈max/2⌉..max
  const stops = [
    Math.max(1, Math.ceil(max / 16)),
    Math.max(2, Math.ceil(max / 8)),
    Math.max(4, Math.ceil(max / 4)),
    Math.max(6, Math.ceil(max / 2)),
    max,
  ];
  // Dedupe + ensure strictly ascending.
  const seen = new Set<number>();
  const cleaned: number[] = [];
  for (const s of stops) {
    if (!seen.has(s) && (cleaned.length === 0 || s > cleaned[cleaned.length - 1])) {
      cleaned.push(s);
      seen.add(s);
    }
  }
  while (cleaned.length < 4) {
    cleaned.push((cleaned[cleaned.length - 1] ?? 0) + 1);
  }
  return [
    { cap: cleaned[0], label: `1–${cleaned[0]}`, color: ramp[1] },
    { cap: cleaned[1], label: `${cleaned[0] + 1}–${cleaned[1]}`, color: ramp[2] },
    { cap: cleaned[2], label: `${cleaned[1] + 1}–${cleaned[2]}`, color: ramp[3] },
    { cap: cleaned[3], label: `${cleaned[2] + 1}+`, color: ramp[4] },
  ];
}

function colorFor(value: number, buckets: Bucket[]): string {
  if (value <= 0) return NO_DATA_FILL;
  for (const b of buckets) {
    if (value <= b.cap) return b.color;
  }
  return buckets[buckets.length - 1].color;
}

interface GeoFeature {
  rsmKey: string;
  id: string;
  properties: { name?: string };
}

interface HoverState {
  name: string;
  numeric: string;
  iso2?: string;
  value: number;
  hasData: boolean;
}

export function WorldChoropleth({ countries }: { countries: CountryRecord[] }) {
  const [metric, setMetric] = useState<Metric>("confirmed_cases");
  const [hover, setHover] = useState<HoverState | null>(null);

  const byNumeric = useMemo(() => {
    const m = new Map<string, CountryRecord>();
    for (const c of countries) {
      const n = iso2ToNumeric(c.country_code);
      if (n) m.set(n, c);
    }
    return m;
  }, [countries]);

  const ramp = metric === "deaths" ? RAMP_DEATHS : RAMP_DEFAULT;
  const values = countries.map((c) => c[metric]);
  const buckets = useMemo(() => buildBuckets(values, ramp), [values, ramp]);

  const reportedCount = countries.filter((c) => c[metric] > 0).length;

  return (
    <div className="col gap-16">
      {/* Toolbar: metric toggle + reported summary */}
      <div className="row between wrap" style={{ gap: 12 }}>
        <div
          className="row gap-4"
          role="tablist"
          aria-label="Select metric for map"
          style={{
            background: "var(--bg-sunken)",
            padding: 3,
            borderRadius: 8,
            border: "1px solid var(--line)",
          }}
        >
          {METRICS.map((m) => {
            const selected = metric === m.key;
            return (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`${m.label} — ${m.hint}`}
                onClick={() => setMetric(m.key)}
                className="btn btn-sm"
                style={{
                  background: selected ? "var(--bg-elev)" : "transparent",
                  borderColor: selected ? "var(--line)" : "transparent",
                  color: selected ? "var(--ink)" : "var(--ink-2)",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <span className="muted" style={{ fontSize: 12.5 }}>
          {reportedCount} of {countries.length} reporting countries shaded
        </span>
      </div>

      {/* Map */}
      <div
        className="choropleth-stage"
        role="img"
        aria-label={`World map shaded by ${METRICS.find((m) => m.key === metric)?.label} per country.`}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 165, center: [10, 8] }}
          width={980}
          height={460}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <Sphere id="rsm-sphere" stroke="var(--line)" strokeWidth={0.6} fill="transparent" />
          <Graticule stroke="var(--line)" strokeWidth={0.4} />
          <Geographies geography="/maps/world-110m.json">
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.map((geo) => {
                const rec = byNumeric.get(String(geo.id));
                const value = rec ? rec[metric] : 0;
                const fill = rec ? colorFor(value, buckets) : NO_DATA_FILL;
                const name = rec?.country ?? geo.properties?.name ?? "Unknown";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={STROKE}
                    strokeWidth={0.4}
                    onMouseEnter={() =>
                      setHover({
                        name,
                        numeric: String(geo.id),
                        iso2: rec?.country_code,
                        value,
                        hasData: !!rec,
                      })
                    }
                    onMouseLeave={() => setHover(null)}
                    onFocus={() =>
                      setHover({
                        name,
                        numeric: String(geo.id),
                        iso2: rec?.country_code,
                        value,
                        hasData: !!rec,
                      })
                    }
                    onBlur={() => setHover(null)}
                    tabIndex={rec ? 0 : -1}
                    aria-label={
                      rec
                        ? `${name}: ${fmtInt(value)} ${METRICS.find((m) => m.key === metric)?.label.toLowerCase()}`
                        : undefined
                    }
                    style={{
                      default: { outline: "none", cursor: rec ? "pointer" : "default" } as CSSProperties,
                      hover: {
                        outline: "none",
                        fill: rec ? "var(--accent-ink)" : NO_DATA_FILL,
                        stroke: STROKE,
                      } as CSSProperties,
                      pressed: { outline: "none" } as CSSProperties,
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Hover tooltip (overlayed top-left) */}
        <div className="choropleth-tooltip" aria-live="polite" aria-atomic="true">
          {hover ? (
            <div className="card choropleth-tooltip__card">
              <div className="row gap-8" style={{ alignItems: "baseline" }}>
                {hover.iso2 ? (
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      border: "1px solid var(--line)",
                      borderRadius: 4,
                      color: "var(--ink-3)",
                    }}
                  >
                    {hover.iso2}
                  </span>
                ) : null}
                <span style={{ fontWeight: 540, fontSize: 13.5 }}>{hover.name}</span>
              </div>
              {hover.hasData ? (
                <div
                  className="mono"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                    marginTop: 4,
                  }}
                >
                  {fmtInt(hover.value)}{" "}
                  <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>
                    {METRICS.find((m) => m.key === metric)?.label.toLowerCase()}
                  </span>
                </div>
              ) : (
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  No data
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Legend */}
      <div className="row between wrap" style={{ gap: 12 }}>
        <div className="row gap-12 wrap" aria-label="Legend">
          <span className="row gap-6">
            <span
              aria-hidden
              style={{
                width: 14,
                height: 10,
                background: NO_DATA_FILL,
                border: "1px solid var(--line)",
                borderRadius: 2,
                display: "inline-block",
              }}
            />
            <span className="muted" style={{ fontSize: 12 }}>
              No data
            </span>
          </span>
          {buckets.map((b, i) => (
            <span key={i} className="row gap-6">
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 10,
                  background: b.color,
                  border: "1px solid var(--line)",
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              <span className="muted" style={{ fontSize: 12 }}>
                {b.label}
              </span>
            </span>
          ))}
        </div>
        <span className="muted" style={{ fontSize: 11.5, fontFamily: "JetBrains Mono, monospace" }}>
          Source: aggregated from WHO, CDC, ECDC, PAHO, ministries
        </span>
      </div>
    </div>
  );
}
