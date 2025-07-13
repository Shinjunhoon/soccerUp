// app/my-squads/page.jsx
'use client';

import React from 'react';
import SoccerSquadBuilder from '../components/SoccerSquadBuilder';

const MySquadsPage = () => {
  // ⭐ 임시로 사용할 팀 ID. 실제 앱에서는 로그인된 사용자 정보나
  //    URL 파라미터 등에서 동적으로 가져와야 합니다.
  const currentTeamId = "team123"; // SoccerSquadBuilder의 getTeamMembersByTeamId 예시와 맞춤

  return (
    <SoccerSquadBuilder teamId={currentTeamId} />
  );
};

export default MySquadsPage;