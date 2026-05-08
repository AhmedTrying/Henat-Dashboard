// Map ISO 3166-1 alpha-2 (which the snapshot uses) to ISO 3166-1 numeric,
// which is what the world-atlas TopoJSON we ship in /public/maps uses for
// geo `id`. We only need to cover the country-list seed plus a small safety
// margin; unknown codes return undefined and are treated as "no data".

const ISO2_TO_NUMERIC: Record<string, string> = {
  AR: "032", // Argentina
  CL: "152", // Chile
  US: "840", // United States
  BR: "076", // Brazil
  PA: "591", // Panama
  MY: "458", // Malaysia
  SA: "682", // Saudi Arabia
  ID: "360", // Indonesia
  // Common neighbours / likely future additions — safe to keep, no behaviour
  // change unless the snapshot adds them.
  CA: "124",
  MX: "484",
  PE: "604",
  BO: "068",
  PY: "600",
  UY: "858",
  CO: "170",
  EC: "218",
  VE: "862",
  ES: "724",
  PT: "620",
  FR: "250",
  DE: "276",
  IT: "380",
  GB: "826",
  CN: "156",
  JP: "392",
  KR: "410",
  IN: "356",
  TH: "764",
  VN: "704",
  PH: "608",
  SG: "702",
  AU: "036",
  NZ: "554",
  ZA: "710",
  EG: "818",
  NG: "566",
  KE: "404",
};

export function iso2ToNumeric(code: string | undefined | null): string | undefined {
  if (!code) return undefined;
  return ISO2_TO_NUMERIC[code.toUpperCase()];
}

export function numericToIso2(numeric: string): string | undefined {
  const found = Object.entries(ISO2_TO_NUMERIC).find(([, v]) => v === numeric);
  return found?.[0];
}
