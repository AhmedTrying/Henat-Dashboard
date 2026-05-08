// Ensures the file referenced from next-env.d.ts exists before tsc runs.
// Next.js auto-edits next-env.d.ts to add a `<reference path="./.next/types/routes.d.ts" />`
// line; on a clean checkout (no .next yet), tsc would normally just warn,
// but defensively stubbing the file keeps `npm run typecheck` deterministic
// in CI and across Next versions.

import { mkdirSync, existsSync, writeFileSync } from "node:fs";

mkdirSync(".next/types", { recursive: true });
const stub = ".next/types/routes.d.ts";
if (!existsSync(stub)) {
  writeFileSync(stub, "// auto-generated stub for typecheck; replaced by `next dev` / `next build`\nexport {};\n");
}
