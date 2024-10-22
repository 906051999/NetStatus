/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // 对所有路由应用这些头部
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/uapis/:path*',
        destination: 'https://uapis.cn/api/:path*',
      },
      {
        source: '/api/ip-sb/:path*',
        destination: 'https://api.ip.sb/:path*',
      },
      {
        source: '/api/52vmy/:path*',
        destination: 'https://api.52vmy.cn/api/:path*',
      },
      {
        source: '/api/cloudflare/:path*',
        destination: 'https://www.cloudflare.com/:path*',
      },
    ];
  },
};

export default nextConfig;
