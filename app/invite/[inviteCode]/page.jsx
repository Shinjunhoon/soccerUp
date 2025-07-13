// app/invite/[inviteCode]/page.jsx
import TeamJoinRequest from '../../components/TeamJoinRequest'

// Next.js 13+ App Router에서 동적 세그먼트 파라미터를 받는 방식
// ⭐ InvitePage 함수를 async로 선언합니다.
export default async function InvitePage({ params }) {
  // ⭐ params를 비구조화하기 전에 await 합니다.
  const { inviteCode } = await params; // URL에서 inviteCode를 추출

  return (
    // 추출한 inviteCode를 TeamJoinRequest 컴포넌트에 prop으로 전달
    <TeamJoinRequest inviteCode={inviteCode} />
  );
}