/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // `next build` and `next dev` share .next by default, so building while the
  // dev server runs corrupts its cache ("Cannot find module './123.js'").
  // `npm run build` sets NEXT_DIST_DIR so the two never collide. The static
  // export still lands in out/ either way.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Emit /path/index.html so the static export works on any static host.
  trailingSlash: true,
};

module.exports = nextConfig;
