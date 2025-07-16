// app/page.tsx
// 이 파일은 기본적으로 서버 컴포넌트로 작동합니다.
// 여기에 직접 useRouter를 사용하지 않습니다.
import HomePageContent from './components/HomePageContent'

export default function HomePage() {
  return (
    <HomePageContent /> // 클라이언트 로직을 담당하는 컴포넌트를 렌더링합니다.
  );
}