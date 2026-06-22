import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow debugging from LAN IPs (e.g. Android Studio device/emulator).
  allowedDevOrigins: ["10.10.9.118"],
};

export default nextConfig;
