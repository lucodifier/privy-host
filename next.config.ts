import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma e o binding nativo do Argon2id precisam rodar no servidor sem bundling.
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2"],
};

export default nextConfig;
