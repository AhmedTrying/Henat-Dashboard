/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // We run ESLint as a separate CI step (`npm run lint`) using flat config,
  // which Next 15.5's build-time linter doesn't auto-detect — it would otherwise
  // print "The Next.js plugin was not detected in your ESLint configuration."
  // on every build. Lint coverage is unaffected; CI gate is the same.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
