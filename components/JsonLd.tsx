// Renders a JSON-LD <script> in the document. Server component — safe to
// place inside `app/layout.tsx` or any page. Use the helpers in `lib/seo.ts`
// to build the payload.

export function JsonLd({ data }: { data: object | null | undefined }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      // Inject as a string. JSON.stringify already handles quoting; we
      // additionally close-tag-escape just in case a value contains "</script".
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
