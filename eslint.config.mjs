// Flat ESLint config (ESLint 9). Uses `eslint-config-next` via FlatCompat
// because Next.js still ships its config in legacy form.
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "scripts/prep-typecheck.mjs",
      // Auto-managed by Next.js; rewriting it on every build is expected.
      "next-env.d.ts",
      // Tooling configs — these are intentionally `export default {…}` style.
      "eslint.config.mjs",
      "next.config.mjs",
      "postcss.config.mjs",
      "tailwind.config.ts",
      // Legacy design-export prototype files — kept for reference, not part
      // of the Next.js app and must not produce lint noise.
      "page-home.jsx",
      "page-dashboard.jsx",
      "page-developers.jsx",
      "components-chrome.jsx",
      "components-data.jsx",
      "data.jsx",
      "tweaks-panel.jsx",
      "Hantavirus Dashboard.html",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Don't fail builds on formatting-only concerns — those belong in a
      // separate formatter pass, not the lint gate.
      "@next/next/no-html-link-for-pages": "off",
      // App Router renders `<head>` directly; the legacy `_document.js` rule
      // about custom fonts doesn't apply.
      "@next/next/no-page-custom-font": "off",
    },
  },
];
