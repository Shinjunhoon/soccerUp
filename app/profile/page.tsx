// app/profile/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaUserCircle, FaCopy } from 'react-icons/fa';
import Link from 'next/link';

// services/profile/profile.ts에서 AuthError와 API 함수들을 임포트합니다.
import { getUserProfile, UserProfile, Team, AuthError } from '../services/profile/profile';
// ⭐ SessionExpiredModal 컴포넌트를 새로 분리된 파일에서 임포트합니다. ⭐
import SessionExpiredModal from '../components/SessionExpiredModal'


// ⭐ 초대 링크 모달 컴포넌트 (기존 유지)
interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteLink: string;
}

const InviteLinkModal: React.FC<InviteLinkModalProps> = ({ isOpen, onClose, inviteLink }) => {
  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('초대 링크가 클립보드에 복사되었습니다!');
      onClose(); // 복사 후 모달 닫기
    } catch (err) {
      console.error('초대 링크 복사 실패:', err);
      toast.error('초대 링크 복사에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">팀 초대 링크</h2>
        <div className="bg-gray-700 p-3 rounded-md flex items-center justify-between mb-4">
          <span className="text-blue-400 text-sm truncate mr-2" title={inviteLink}>
            {inviteLink}
          </span>
          <button
            onClick={handleCopyLink}
            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm flex items-center"
          >
            <FaCopy className="mr-1" /> 복사
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          닫기
        </button>
      </div>
    </div>
  );
};


const ProfilePage = () => {
  const { isAuthenticated, isLoading, userName, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); // 초대 링크 모달 상태명 변경
  const [currentInviteLink, setCurrentInviteLink] = useState('');
  // ⭐ 세션 만료 모달 상태 추가 ⭐
  const [isSessionExpiredModalOpen, setSessionExpiredModalOpen] = useState(false);

  // router.push를 useCallback으로 감싸서 의존성 배열에 안정적으로 전달
  const redirectToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  // ⭐ 세션 만료 모달에서 '확인' 버튼 클릭 시 호출될 함수 ⭐
  // ⭐ 이제 이 함수에서 logout()을 호출합니다. ⭐
  const handleSessionExpiredConfirm = useCallback(async () => {
    setSessionExpiredModalOpen(false); // 모달 닫기
    await logout(); // ⭐ 모달 확인 시 로그아웃 처리 ⭐
    redirectToLogin(); // 로그인 페이지로 리다이렉트
  }, [logout, redirectToLogin]); // logout과 redirectToLogin을 의존성 배열에 추가

  // ⭐ 초대 링크 모달 닫기 함수 (이름 변경) - 순서 변경 및 useCallback 유지 ⭐
  const closeInviteLinkModal = useCallback(() => {
    setIsInviteModalOpen(false);
    setCurrentInviteLink('');
  }, []); // 의존성 배열 비워두기


  useEffect(() => {
    // AuthContext 로딩이 완료되고 사용자가 인증되지 않았다면 로그인 페이지로 리다이렉트
    // 이 부분은 초기 로딩 시 인증되지 않은 경우를 처리합니다.
    if (!isLoading && !isAuthenticated) {
      toast.error('로그인이 필요합니다. 프로필 페이지에 접근할 수 없습니다.');
      redirectToLogin();
    } else if (isAuthenticated) {
      const fetchProfileData = async () => {
        setLoadingProfile(true);
        setError(null);
        try {
          // ⭐ getUserProfile 호출 시 logout 함수를 전달하지 않습니다. ⭐
          // handleApiError에서 직접 logout을 호출하지 않으므로, 이 시점에서 isAuthenticated는 유지됩니다.
          const data = await getUserProfile(); // ⭐ logout 인자 제거 ⭐
          setProfileData(data);
          toast.success(`환영합니다, ${data.username}님의 프로필 페이지입니다.`);
        } catch (err: any) {
          console.error("프로필 데이터를 불러오는 중 오류 발생:", err);
          // ⭐ AuthError를 감지하여 세션 만료 모달을 띄웁니다. ⭐
          if (err instanceof AuthError) {
            setSessionExpiredModalOpen(true); // 세션 만료 모달 열기
            // 이 경우 toast.error는 모달이 메시지를 보여주므로 생략할 수 있습니다.
          } else {
            // 그 외 일반적인 API 오류는 기존처럼 처리
            setError(err.message || '프로필 데이터를 불러오는 데 실패했습니다.');
            toast.error('프로필 데이터를 불러오는 데 실패했습니다.');
          }
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfileData();
    }
  }, [isAuthenticated, isLoading, router, userName, logout, redirectToLogin]);

  // ⭐ 세션 만료 모달을 최상위에서 조건부 렌더링하여 다른 반환 값에 영향을 받지 않도록 합니다. ⭐
  if (isSessionExpiredModalOpen) {
    return (
      <SessionExpiredModal
        isOpen={isSessionExpiredModalOpen}
        onClose={() => setSessionExpiredModalOpen(false)} // 모달 닫기 함수
        onConfirm={handleSessionExpiredConfirm} // 확인 버튼 클릭 시 로그인 페이지로 이동
      />
    );
  }

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-xl">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 이 조건은 이제 초기 로딩 시 인증되지 않은 경우에만 도달합니다.
    // 세션 만료로 인한 isAuthenticated=false는 위에서 모달 렌더링으로 처리됩니다.
    return null;
  }

  const positionLabels: { [key: string]: string } = {
    'FW': '공격수', 'MF': '미드필더', 'DF': '수비수', 'GK': '골키퍼', 'ETC': '기타 포지션'
  };
  const skillLevelLabels: { [key: string]: string } = {
    'BEGINNER': '초급', 'INTERMEDIATE': '중급', 'ADVANCED': '고급', 'PRO': '프로',
  };

  const handleViewTeam = (teamId: number) => {
    router.push(`/TeamRosterViewer?teamId=${teamId}`);
    toast.success(`${profileData?.username}님이 생성한 팀 정보를 조회합니다.`);
  };

  // ⭐ 초대 링크 모달 열기 함수 (이름 변경)
  const openInviteLinkModal = (inviteLink: string) => {
    setCurrentInviteLink(inviteLink);
    setIsInviteModalOpen(true);
  };


  const handleLogout = async () => {
    try {
      await logout();
      toast.success('성공적으로 로그아웃되었습니다.');
      redirectToLogin(); // 로그아웃 후 로그인 페이지로 리다이렉트
    } catch (err) {
      console.error("로그아웃 중 오류 발생:", err);
      toast.error('로그아웃에 실패했습니다.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-6 text-center">나의 프로필</h1>

        {error && (
          <div className="bg-red-800 border border-red-700 text-white px-4 py-3 rounded-lg relative mb-6">
            <strong className="font-bold">오류 발생!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {profileData ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FaUserCircle size={80} className="text-gray-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white">{profileData.username}</h2>
            </div>

            <div className="bg-gray-700 p-5 rounded-lg shadow-inner space-y-3">
              <p className="text-xl"><strong className="text-gray-300">이메일:</strong> <span className="font-semibold">{profileData.email}</span></p>
              {profileData.age && (
                <p className="text-xl"><strong className="text-gray-300">나이:</strong> <span className="font-semibold">{profileData.age}세</span></p>
              )}
              {profileData.position && (
                <p className="text-xl"><strong className="text-gray-300">선호 포지션:</strong> <span className="font-semibold">{positionLabels[profileData.position] || profileData.position}</span></p>
              )}
              {profileData.skillLevel && (
                <p className="text-xl"><strong className="text-gray-300">경험 수준:</strong> <span className="font-semibold">{skillLevelLabels[profileData.skillLevel] || profileData.skillLevel}</span></p>
              )}
              {profileData.region && (
                <p className="text-xl"><strong className="text-gray-300">활동 지역:</strong> <span className="font-semibold">{profileData.region}</span></p>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-blue-300 mb-4 border-b border-gray-700 pb-2">내가 생성한 팀</h3>
              {profileData.createdTeams && profileData.createdTeams.length > 0 ? (
                <div className="space-y-3">
                  {profileData.createdTeams.map(team => (
                    <div key={team.id} className="bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center flex-wrap gap-2">
                      <span className="text-lg font-medium">{team.name}</span>
                      <div className="flex items-center space-x-2">

                        {team.inviteLink && (
                          <button
                            onClick={() => openInviteLinkModal(team.inviteLink)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                          >
                            초대 링크
                          </button>
                        )}

                        <button
                          onClick={() => handleViewTeam(team.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                          >
                            조회
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-400">
                    <p>아직 생성한 팀이 없습니다.</p>
                    <Link href="/create-team" className="text-blue-400 hover:underline mt-2 inline-block">
                      새 팀 생성하기
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">프로필 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>

        {/* ⭐ 초대 링크 모달 렌더링 ⭐ */}
        <InviteLinkModal
          isOpen={isInviteModalOpen}
          onClose={closeInviteLinkModal}
          inviteLink={currentInviteLink}
        />

        {/* ⭐ 세션 만료 모달 렌더링 ⭐ */}
        <SessionExpiredModal
          isOpen={isSessionExpiredModalOpen}
          onClose={() => setSessionExpiredModalOpen(false)}
          onConfirm={handleSessionExpiredConfirm}
        />
      </div>
    );
  };

export default ProfilePage;
