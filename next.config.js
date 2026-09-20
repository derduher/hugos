/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // `next build` and `next dev` share .next by default, so building while the
  // dev server runs corrupts its cache ("Cannot find module './123.js'").
  // `npm run build` sets NEXT_DIST_DIR so the two never collide. With
  // `output: "export"` the exported site lands in distDir itself, so a
  // `npm run build` publishes to .next-build/ — that is the directory the
  // deploy workflow uploads.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Emit /path/index.html so the static export works on any static host.
  trailingSlash: true,
  // Served from a subpath of nimblerendition.com, which hosts several apps out
  // of one bucket. basePath rewrites both the `next/link` hrefs and the
  // /_next/ asset URLs; keep it in step with the S3 prefix in
  // .github/workflows/deploy.yml.
  basePath: "/hugos",
};

module.exports = nextConfig;
