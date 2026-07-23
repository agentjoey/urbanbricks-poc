import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* C3-image: serve modern formats. AVIF first (preferred where the
       Accept header allows it), WebP as the universal fallback; the
       optimizer falls back to the source format for browsers with neither.
       Next 16 default is ['image/webp'] — AVIF must be opted in. */
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
