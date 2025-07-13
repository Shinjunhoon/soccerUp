// app/create-squad/page.jsx
'use client'; // 이 컴포넌트는 useState를 사용하므로 클라이언트 측 렌더링이 필요합니다.

import React from 'react';
import CreateFootballSquad from '../components/CreateFootballSquad'

const CreateSquadPage = () => {
  return (
    // CreateFootballSquad 컴포넌트를 여기에 렌더링합니다.
    <CreateFootballSquad />
  );
};

export default CreateSquadPage;