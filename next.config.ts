import type { NextConfig } from "next";

// p5's default entry (lib/p5.min.js) is a heavily minified UMD bundle that
// Turbopack's dev-mode module wrapping mis-scopes (duplicate top-level var
// declarations). Aliasing to the unminified build avoids that collision.
const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      p5: "p5/lib/p5.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      p5: require.resolve("p5/lib/p5.js"),
    };
    return config;
  },
  // Unity WebGL builds ship Brotli payloads as .unityweb with Unity's JS
  // decompression fallback. Without these headers every visit decompresses
  // ~14 MB in JavaScript before the bench can start. Declaring the encoding
  // lets the browser decompress natively (the loader detects that and skips
  // its fallback), and the wasm type lets it compile while still downloading.
  async headers() {
    const unityweb = (suffix: string, type: string) => ({
      source: `/unity/:build/Build/:file${suffix}.unityweb`,
      headers: [
        { key: "Content-Encoding", value: "br" },
        { key: "Content-Type", value: type },
      ],
    });

    return [
      unityweb(".wasm", "application/wasm"),
      unityweb(".framework.js", "application/javascript"),
      unityweb(".data", "application/octet-stream"),
    ];
  },
};

export default nextConfig;
