// app/layout.tsx
import './globals.css'; // 글로벌 스타일시트 임포트
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/AuthContext'; // AuthProvider 임포트
import Header from './components/Header'; // Header 컴포넌트 임포트
import { Toaster } from 'react-hot-toast'; // ⭐ Toaster 컴포넌트 임포트 ⭐

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '⚽ 나의 스쿼드 메이커',
  description: '나만의 축구 스쿼드를 만들고 관리하세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      {/* 구글 소유권 확인 메타 태그가 여기에 추가되었습니다. */}
      <head>
        <meta name="google-site-verification" content="N726bMBSRpKowCq10x_q-fJoOuERg5El7JXxm3tgD7o" />
      </head>
      <body className={inter.className}>
        <AuthProvider> {/* 애플리케이션을 AuthProvider로 감쌉니다 */}
          <Header /> {/* Header 컴포넌트가 이제 인증 컨텍스트에 접근할 수 있습니다 */}
          <main>{children}</main>
          <Toaster /> {/* ⭐ 이 줄을 추가해야 합니다 ⭐ */}
        </AuthProvider>
      </body>
    </html>
  );
}
