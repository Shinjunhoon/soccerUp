// app/hooks/useAuthErrorHandling.ts
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // AuthContext 훅 임포트

interface AuthErrorHandling {
  isSessionExpiredModalOpen: boolean;
  handleSessionExpiredConfirm: () => Promise<void>;
  triggerSessionExpiredModal: () => void;
}

/**
 * 인증 오류(AuthError) 발생 시 세션 만료 모달을 띄우고,
 * 사용자가 확인 버튼을 누르면 로그아웃 및 로그인 페이지로 리다이렉트하는
 * 로직을 캡슐화한 커스텀 훅입니다.
 */
export const useAuthErrorHandling = (): AuthErrorHandling => {
  const router = useRouter();
  const { logout } = useAuth(); // AuthContext에서 logout 함수 가져오기

  const [isSessionExpiredModalOpen, setSessionExpiredModalOpen] = useState(false);

  // 세션 만료 모달에서 '확인' 버튼 클릭 시 호출될 함수
  const handleSessionExpiredConfirm = useCallback(async () => {
    setSessionExpiredModalOpen(false); // 모달 닫기
    await logout(); // 로그아웃 처리
    router.push('/login'); // 로그인 페이지로 리다이렉트
  }, [logout, router]);

  // 세션 만료 모달을 띄우는 함수
  const triggerSessionExpiredModal = useCallback(() => {
    setSessionExpiredModalOpen(true);
  }, []);

  return {
    isSessionExpiredModalOpen,
    handleSessionExpiredConfirm,
    triggerSessionExpiredModal,
  };
};
