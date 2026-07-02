import type { NextConfig } from "next";

const supabaseHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  // Allow debugging from LAN IPs (e.g. Android Studio device/emulator).
  allowedDevOrigins: ["10.10.9.118"],
  images: supabaseHostname
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/platform-media/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
