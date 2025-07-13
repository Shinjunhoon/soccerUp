import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // 일반적으로 Next.js 프로젝트에 포함되는 설정입니다.
  // 여기에 다른 설정이 있다면 그대로 유지하세요.

  // 백엔드 API 요청을 프록시하기 위한 rewrites 설정 추가
  async rewrites() {
    return [
      {
        // Next.js 앱에서 '/api/'로 시작하는 모든 요청을 가로챕니다.
        source: '/api/:path*',
        // 가로챈 요청을 실제 백엔드 서버의 주소로 보냅니다.
        // :path*는 '/api/' 뒤의 모든 경로를 그대로 전달합니다.
        destination: `http://13.49.74.224:8080/:path*`,
      },
    ];
  },
};

export default nextConfig;