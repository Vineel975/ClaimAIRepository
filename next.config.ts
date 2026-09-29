import type { NextConfig } from "next";

// Static export: the demo has no server-side logic, so it deploys as plain
// files to Vercel, Netlify or Azure Static Web Apps with no runtime to manage.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
