// app/TeamRosterViewer/page.tsx
'use client'; // 이 페이지를 클라이언트 컴포넌트로 지정합니다.

import React, { useState, useEffect } from 'react';
import TeamRosterViewerClient from '../components/TeamRosterViewer'
// ✅ lib/api에서 필요한 것만 임포트합니다.
// getTeams는 이 페이지에서 직접 사용하지 않으므로 제거합니다.
import { useRouter } from 'next/navigation'; // Next.js 라우터 훅 임포트 (로그인 리디렉션용)

export default function TeamRosterPage() {
  // 인증 상태와 페이지 전체 로딩, 에러 상태만 관리합니다.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  
  const router = useRouter(); // 라우터 훅 초기화

  // 컴포넌트가 마운트될 때 (클라이언트 측에서) 인증 상태만 확인하는 useEffect
  useEffect(() => {
    const checkAuth = () => { // 함수 이름 변경: 데이터 fetching 로직이 제거되었으므로
      setLoading(true); // 로딩 시작
      setError(null);   // 에러 초기화

      const token = localStorage.getItem('accessToken'); // localStorage에서 JWT 토큰 확인
      if (!token) {
        setIsAuthenticated(false);
        // 토큰이 없으면 로그인 페이지로 리디렉션
        alert('로그인이 필요합니다.');
        router.push('/login'); 
        setLoading(false); // 리디렉션 후 로딩 종료
        return; // 리디렉션 후 함수 종료
      } else {
        setIsAuthenticated(true);
        setLoading(false); // 인증 확인 완료 후 로딩 종료
      }
    };

    checkAuth(); // 인증 확인 함수 호출
  }, [router]); // router 의존성 배열에 추가

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 font-sans text-white text-center flex flex-col justify-center items-center">
        <h1 className="text-4xl text-blue-400 mb-4">페이지 로딩 중...</h1>
        <div className="mt-4 animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="text-gray-400 mt-4">인증 확인 중입니다.</p>
      </div>
    );
  }

  // 에러 발생 시 표시할 UI (현재 `checkAuth`에서는 이런 에러가 발생하지 않지만, 나중에 추가될 수 있는 로직을 위해 유지)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 font-sans text-white text-center flex flex-col justify-center items-center">
        <h1 className="text-4xl text-red-500 mb-4">오류 발생!</h1>
        <p className="text-gray-400">{error}</p>
        <p className="text-gray-500 mt-4">문제가 계속되면 관리자에게 문의해주세요.</p>
      </div>
    );
  }

  // 인증되지 않았다면 (그리고 리디렉션이 완료되지 않았다면) 아무것도 렌더링하지 않습니다.
  // 대부분의 경우, 이 조건에 걸리면 이미 `router.push`로 리디렉션되었을 것입니다.
  if (!isAuthenticated) {
    return null; 
  }

  // 인증되면 TeamRosterViewerClient 컴포넌트 렌더링
  return (
    <TeamRosterViewerClient
      // ✅ initialTeams와 initialPlayers는 더 이상 TeamRosterViewerClient에 전달하지 않습니다.
      //    TeamRosterViewerClient 내부에서 API를 호출하여 이 데이터를 가져옵니다.
      // initialSelectedTeamId도 TeamRosterViewerClient가 알아서 첫 팀을 선택하므로 여기서는 빈 문자열을 전달합니다.
      initialSelectedTeamId={''} 
      isAuthenticated={isAuthenticated} 
    />
  );
}