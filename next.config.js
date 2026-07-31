/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Emit /path/index.html so the static export works on any static host.
  trailingSlash: true,
};

module.exports = nextConfig;
