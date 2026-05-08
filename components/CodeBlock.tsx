"use client";
import { useState, type ReactNode } from "react";

type Lang = "json" | "js" | "py" | "curl" | "bash" | "ts";

export function CodeBlock({
  code,
  lang = "bash",
  showLineNumbers = true,
}: {
  code: string;
  lang?: Lang;
  showLineNumbers?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="codeblock" style={{ position: "relative" }}>
      <div
        className="row between"
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--line)",
          background: "var(--bg-elev)",
        }}
      >
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
          {lang}
        </span>
        <button
          className="btn btn-sm btn-ghost"
          onClick={copy}
          style={{ height: 24, padding: "0 8px", fontSize: 11.5 }}
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: 14 }}>
        {lines.map((ln, i) => (
          <div
            key={i}
            style={
              showLineNumbers
                ? { display: "grid", gridTemplateColumns: "28px 1fr", gap: 12 }
                : undefined
            }
          >
            {showLineNumbers ? (
              <span style={{ color: "var(--ink-4)", textAlign: "right", userSelect: "none" }}>
                {i + 1}
              </span>
            ) : null}
            <span>{highlight(ln, lang)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function highlight(line: string, lang: Lang): ReactNode {
  if (lang === "json") {
    const parts: ReactNode[] = [];
    const re = /("[^"]*")(\s*:)?|(\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let idx = 0;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(<span key={idx++}>{line.slice(last, m.index)}</span>);
      if (m[1]) {
        const isKey = !!m[2];
        parts.push(
          <span key={idx++} className={isKey ? "code-tk-key" : "code-tk-str"}>
            {m[1]}
          </span>,
        );
        if (isKey) parts.push(<span key={idx++}>{m[2]}</span>);
      } else if (m[3]) {
        parts.push(<span key={idx++} className="code-tk-num">{m[3]}</span>);
      } else if (m[4]) {
        parts.push(<span key={idx++} className="code-tk-num">{m[4]}</span>);
      }
      last = re.lastIndex;
    }
    if (last < line.length) parts.push(<span key={idx++}>{line.slice(last)}</span>);
    return parts;
  }
  if (lang === "py") {
    return line
      .split(/(#[^\n]*$|"[^"]*"|\b(?:import|from|print|requests|get|json)\b)/g)
      .map((part, i) => {
        if (/^#/.test(part)) return <span key={i} className="code-tk-com">{part}</span>;
        if (/^"/.test(part)) return <span key={i} className="code-tk-str">{part}</span>;
        if (/^(import|from)$/.test(part)) return <span key={i} className="code-tk-key">{part}</span>;
        if (/^(print|get|json|requests)$/.test(part)) return <span key={i} className="code-tk-fn">{part}</span>;
        return <span key={i}>{part}</span>;
      });
  }
  if (lang === "js" || lang === "ts") {
    return line
      .split(/(\/\/[^\n]*$|"[^"]*"|`[^`]*`|\b(?:const|let|var|await|fetch|console|log|async|return|function|import|from|export)\b)/g)
      .map((part, i) => {
        if (/^\/\//.test(part)) return <span key={i} className="code-tk-com">{part}</span>;
        if (/^["`]/.test(part)) return <span key={i} className="code-tk-str">{part}</span>;
        if (/^(const|let|var|await|async|return|function|import|from|export)$/.test(part))
          return <span key={i} className="code-tk-key">{part}</span>;
        if (/^(fetch|console|log)$/.test(part))
          return <span key={i} className="code-tk-fn">{part}</span>;
        return <span key={i}>{part}</span>;
      });
  }
  return line.split(/("[^"]*"|\bcurl\b|\b-[A-Za-z]+\b|https?:\/\/\S+)/g).map((part, i) => {
    if (/^curl$/.test(part)) return <span key={i} className="code-tk-key">{part}</span>;
    if (/^-/.test(part)) return <span key={i} className="code-tk-fn">{part}</span>;
    if (/^"/.test(part)) return <span key={i} className="code-tk-str">{part}</span>;
    if (/^https?:/.test(part)) return <span key={i} className="code-tk-str">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}
