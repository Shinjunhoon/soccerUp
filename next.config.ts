// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 여기에 다른 설정이 있다면 그대로 유지하세요.

  // 백엔드 API 요청을 프록시하기 위한 rewrites 설정 추가
  async rewrites() {
    return [
      {
        // Next.js 앱에서 '/api/'로 시작하는 모든 요청을 가로챕니다.
        source: '/api/:path*',
        // 🚨 여기를 http:// 에서 https:// 로 변경합니다.
        // Vercel이 백엔드로 요청을 보낼 때 HTTPS를 사용하도록 시도합니다.
        destination: `http://13.49.74.224:8080/:path*`, // 🚨 중요: 여기를 https로 변경!
      },
    ];
  },
};

export default nextConfig;