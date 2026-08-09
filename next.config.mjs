/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVED ignoreBuildErrors (was: true) — this was masking real
  // TypeScript errors on every production build. Cannot be verified from
  // this environment (no network access to install dependencies / run
  // `tsc`), so the next `npm run build` may now surface pre-existing type
  // errors that need fixing before this can ship.
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
