import type { SourceTier } from "./types";

export interface TrustedSource {
  code: string;
  name: string;
  tier: SourceTier;
  url: string;
  country_code?: string;
  enabled: boolean;
}

export const TRUSTED_SOURCES: TrustedSource[] = [
  { code: "WHO",  name: "World Health Organization",            tier: "global",   url: "https://www.who.int/emergencies/disease-outbreak-news", enabled: true },
  { code: "CDC",  name: "U.S. Centers for Disease Control",     tier: "national", url: "https://www.cdc.gov/hantavirus/",                       country_code: "US", enabled: true },
  { code: "ECDC", name: "European Centre for Disease Prevention", tier: "regional", url: "https://www.ecdc.europa.eu/en/hantavirus-infection",  enabled: true },
  { code: "PAHO", name: "Pan American Health Organization",     tier: "regional", url: "https://www.paho.org/en",                               enabled: true },
  { code: "MS-AR", name: "Ministerio de Salud, Argentina",      tier: "national", url: "https://www.argentina.gob.ar/salud",                     country_code: "AR", enabled: true },
  { code: "MINSAL", name: "Ministerio de Salud, Chile",         tier: "national", url: "https://www.minsal.cl/",                                country_code: "CL", enabled: true },
  { code: "MS-BR", name: "Ministério da Saúde, Brasil",         tier: "national", url: "https://www.gov.br/saude/pt-br",                        country_code: "BR", enabled: true },
  { code: "MINSA-PA", name: "Ministerio de Salud, Panamá",      tier: "national", url: "https://www.minsa.gob.pa/",                             country_code: "PA", enabled: true },
  { code: "KKM", name: "Ministry of Health, Malaysia",          tier: "national", url: "https://www.moh.gov.my/",                               country_code: "MY", enabled: true },
  { code: "MoH-SA", name: "Ministry of Health, Saudi Arabia",   tier: "national", url: "https://www.moh.gov.sa/",                               country_code: "SA", enabled: true },
  { code: "Kemenkes", name: "Kementerian Kesehatan, Indonesia", tier: "national", url: "https://www.kemkes.go.id/",                             country_code: "ID", enabled: true },
];

export function isTrustedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return TRUSTED_SOURCES.some((s) => {
      if (!s.enabled) return false;
      try {
        return new URL(s.url).hostname === u.hostname;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}
