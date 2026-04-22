/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', '@libsql/client'],
  },
};

module.exports = nextConfig;
