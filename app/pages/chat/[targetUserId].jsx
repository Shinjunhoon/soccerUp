// pages/chat/[targetUserId].jsx

import { useRouter } from 'next/router';
import ChatWindow from '../../components/ChatWindow'; // 위에서 만든 컴포넌트 임포트

function ChatPage() {
  const router = useRouter();
  // URL 경로에서 'targetUserId' 파라미터 가져오기
  // 예: /chat/userB 로 접속하면 targetUserId는 'userB'가 됩니다.
  const { targetUserId } = router.query; 

  // --- 중요: 실제 애플리케이션에서는 이 부분을 로그인한 사용자 ID로 교체해야 합니다. ---
  // 예를 들어, 인증 컨텍스트(AuthContext)나 Redux/Zustand 스토어 등에서 가져올 수 있습니다.
  const currentUserId = 'userA'; // 현재 로그인한 사용자 ID (임시값)
  // --- ------------------------------------------------------------------- ---

  // targetUserId가 아직 로드되지 않았을 경우 (초기 렌더링 시 발생 가능)
  if (!targetUserId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">채팅 상대를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <ChatWindow currentUserId={currentUserId} targetUserId={targetUserId} />
    </div>
  );
}

export default ChatPage;