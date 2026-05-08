// Lightweight schema.org JSON-LD builders. These are placeholders in the
// sense that they accept real inputs but never invent fake content — the
// FAQ helper, for example, returns null when no items are supplied, so the
// page emits no FAQ schema at all rather than fabricated Q&A pairs.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_NAME = "Hantavirus Dashboard";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function breadcrumbLd(items: BreadcrumbItem[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.href.startsWith("http") ? it.href : `${SITE_URL}${it.href}`,
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

// Returns null when no items are supplied — never emits fabricated Q&A.
export function faqLd(items: FaqItem[] | undefined) {
  if (!items || items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export interface DatasetMeta {
  name: string;
  description: string;
  path: string;
  license?: string;
  publisherName?: string;
  publisherUrl?: string;
  keywords?: string[];
  variableMeasured?: string[];
  modifiedIso?: string;
}

export function datasetLd(meta: DatasetMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: meta.name,
    description: meta.description,
    url: `${SITE_URL}${meta.path}`,
    license: meta.license ?? "https://creativecommons.org/licenses/by/4.0/",
    keywords: meta.keywords,
    variableMeasured: meta.variableMeasured,
    dateModified: meta.modifiedIso,
    publisher: meta.publisherName
      ? {
          "@type": "Organization",
          name: meta.publisherName,
          url: meta.publisherUrl ?? SITE_URL,
        }
      : undefined,
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${SITE_URL}/api/v1/hantavirus/export/latest.json`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: `${SITE_URL}/api/v1/hantavirus/export/latest.csv`,
      },
    ],
  };
}
