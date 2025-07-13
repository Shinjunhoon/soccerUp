// app/components/TeamRosterViewer.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // useRouter 임포트
import toast from 'react-hot-toast'; // toast 임포트

import {
  getTeams,
  getPlayersByTeamId,
  getJoinRequestsByTeamId,
  Team,
  Player,
  JoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  getTeamMembersByTeamId,
  TeamMember,
  AuthError // AuthError 임포트
} from '../services/TeamRosterViewer/TeamRosterViewer'

import { useAuth } from '../context/AuthContext'; // useAuth 임포트
import { useAuthErrorHandling } from '../context/useAuthErrorHandling'
import SessionExpiredModal from '../components/SessionExpiredModal'; // SessionExpiredModal 임포트


// UI 표시를 위한 매핑 객체들
const positionLabels: { [key: string]: string } = {
  'FW': '공격수',
  'MF': '미드필더',
  'DF': '수비수',
  'GK': '골키퍼',
  'All': '전체 선수',
  'ETC': '기타 포지션'
};

const provinceLabels: { [key: string]: string } = {
  'SEOUL': '서울', 'BUSAN': '부산', 'DAEGU': '대구', 'INCHEON': '인천', 'GWANGJU': '광주',
  'DAEJEON': '대전', 'ULSAN': '울산', 'SEJONG': '세종', 'GYEONGGI': '경기', 'GANGWON': '강원',
  'CHUNGCHEONGBUK': '충청북도', 'CHUNGCHEONGNAM': '충청남도', 'JEOLLABUK': '전라북도',
  'JEOLLANAM': '전라남도', 'GYEONGSANGBUK': '경상북도', 'GYEONGSANGNAM': '경상남도', 'JEJU': '제주',
};

const cityCodeLabels: { [key: string]: string } = {
  'GANGNAM': '강남구', 'JUNGGU': '중구', 'SUWON': '수원시', 'BUNDANG': '분당구',
  'SONGPA': '송파구', 'JONGNO': '종로구', 'MAPO': '마포구',
};

const skillLevelLabels: { [key: string]: string } = {
  'BEGINNER': '초급', 'INTERMEDIATE': '중급', 'ADVANCED': '고급', 'PRO': '프로',
};

// 컴포넌트 props 인터페이스
interface TeamRosterViewerProps {
  initialSelectedTeamId?: string;
  isAuthenticated?: boolean; // 이 prop은 이제 useAuth 훅으로 대체되므로 사실상 필요 없음
}

const TeamRosterViewer = ({
  initialSelectedTeamId = '',
}: TeamRosterViewerProps) => {
  const router = useRouter(); // useRouter 훅 사용
  const { isAuthenticated, isLoading } = useAuth(); // AuthContext에서 인증 상태 가져오기
  // ⭐ useAuthErrorHandling 훅 사용 ⭐
  const { isSessionExpiredModalOpen, handleSessionExpiredConfirm, triggerSessionExpiredModal } = useAuthErrorHandling();

  // 상태 변수들
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialSelectedTeamId);
  const [players, setPlayers] = useState<Player[]>([]); // 선수 (상세) 목록
  const [selectedPosition, setSelectedPosition] = useState<string>('All');
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  // ⭐ 누락된 상태 변수 추가 ⭐
  const [loadingTeams, setLoadingTeams] = useState<boolean>(false);

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState<boolean>(false);
  const [loadingJoinRequests, setLoadingJoinRequests] = useState<boolean>(false);
  const [joinRequestsError, setJoinRequestsError] = useState<string | null>(null);
  // processingRequest는 JoinRequest.id와 동일한 타입(number)을 가집니다.
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<JoinRequest | null>(null);

  // 새로운 상태: 팀 멤버 목록
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState<boolean>(false);

  // ⭐ 전반적인 오류 메시지 상태 ⭐
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 초기 로딩 시 인증되지 않은 경우 로그인 페이지로 리다이렉트
  const redirectToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('로그인이 필요합니다. 팀 로스터 페이지에 접근할 수 없습니다.');
      redirectToLogin();
    }
  }, [isLoading, isAuthenticated, redirectToLogin]);


  // 컴포넌트 마운트 시 팀 목록을 불러오는 useEffect
  useEffect(() => {
    const fetchTeams = async () => {
      // 인증되지 않았거나 로딩 중이면 API 호출을 건너뜁니다.
      if (!isAuthenticated) {
        setTeams([]);
        setLoadingTeams(false); // 로딩 상태를 false로 설정
        return;
      }
      setLoadingTeams(true);
      setGeneralError(null); // 새로운 요청 시작 전 오류 메시지 초기화
      try {
        const fetchedTeams = await getTeams(); // ⭐ API 호출 ⭐
        setTeams(fetchedTeams);
        if (fetchedTeams.length > 0 && (!selectedTeamId || !fetchedTeams.some(team => String(team.id) === selectedTeamId))) {
          setSelectedTeamId(String(fetchedTeams[0].id));
        } else if (fetchedTeams.length === 0) {
          setSelectedTeamId('');
        }
      } catch (error: any) { // ⭐ AuthError 처리 ⭐
        console.error("팀 목록을 불러오는 중 오류 발생:", error);
        if (error instanceof AuthError) {
          triggerSessionExpiredModal();
        } else {
          setGeneralError(error.message);
          toast.error(`팀 목록을 불러오는 데 실패했습니다: ${error.message}`);
        }
        setTeams([]);
        setSelectedTeamId('');
      } finally {
        setLoadingTeams(false);
      }
    };

    // 컴포넌트가 마운트되고 인증된 경우에만 팀 목록을 불러옵니다.
    if (isAuthenticated) {
      fetchTeams();
    }
  }, [isAuthenticated, selectedTeamId, triggerSessionExpiredModal]); // isAuthenticated를 의존성 배열에 추가


  // 선택된 팀 이름 계산 (메모이제이션)
  const selectedTeamName = useMemo(() => {
    const team = teams.find(t => t.id === Number(selectedTeamId));
    return team ? team.name : "팀을 선택해주세요";
  }, [selectedTeamId, teams]);

  // 특정 팀의 선수 데이터를 가져오는 함수
  const fetchPlayersForTeam = useCallback(async (teamId: string) => {
    if (!teamId || !isAuthenticated) { // ⭐ isAuthenticated 확인 추가
      setPlayers([]);
      setLoadingPlayers(false);
      return;
    }
    setLoadingPlayers(true);
    setGeneralError(null); // 새로운 요청 시작 전 오류 메시지 초기화
    try {
      const data = await getPlayersByTeamId(teamId);
      setPlayers(data);
    } catch (error: any) { // ⭐ AuthError 처리 ⭐
      console.error("선수 데이터를 가져오는 중 오류 발생:", error);
      if (error instanceof AuthError) {
        triggerSessionExpiredModal();
      } else {
        setPlayers([]);
        setGeneralError(error.message);
        toast.error(`선수 목록을 불러오는 데 실패했습니다: ${error.message}`);
      }
    } finally {
      setLoadingPlayers(false);
    }
  }, [isAuthenticated, triggerSessionExpiredModal]); // isAuthenticated와 triggerSessionExpiredModal 의존성 추가

  // 특정 팀의 멤버 데이터를 가져오는 함수
  const fetchTeamMembersForTeam = useCallback(async (teamId: string) => {
    if (!teamId || !isAuthenticated) { // ⭐ isAuthenticated 확인 추가
      setTeamMembers([]);
      setLoadingTeamMembers(false);
      return;
    }
    setLoadingTeamMembers(true);
    setGeneralError(null); // 새로운 요청 시작 전 오류 메시지 초기화
    try {
      const data = await getTeamMembersByTeamId(teamId); // 새로운 API 함수 호출
      setTeamMembers(data);
    } catch (error: any) { // ⭐ AuthError 처리 ⭐
      console.error("팀 멤버 데이터를 가져오는 중 오류 발생:", error);
      if (error instanceof AuthError) {
        triggerSessionExpiredModal();
      } else {
        setTeamMembers([]);
        setGeneralError(error.message);
        toast.error(`팀 멤버 목록을 불러오는 데 실패했습니다: ${error.message}`);
      }
    } finally {
      setLoadingTeamMembers(false);
    }
  }, [isAuthenticated, triggerSessionExpiredModal]); // isAuthenticated와 triggerSessionExpiredModal 의존성 추가


  // 선택된 팀 ID 변경 시 선수 데이터와 팀 멤버 데이터 모두 불러오기
  useEffect(() => {
    if (selectedTeamId && isAuthenticated) { // ⭐ isAuthenticated 확인 추가
      fetchPlayersForTeam(selectedTeamId); // 기존 선수 목록
      fetchTeamMembersForTeam(selectedTeamId); // 새로운 팀 멤버 목록
    } else {
      setPlayers([]);
      setTeamMembers([]); // 팀 선택 안 되면 멤버 목록도 초기화
    }
  }, [selectedTeamId, isAuthenticated, fetchPlayersForTeam, fetchTeamMembersForTeam]); // isAuthenticated 의존성 추가


  // 사용 가능한 모든 포지션 목록 (메모이제이션)
  const allPositions = useMemo(() => {
    const positions = new Set(players.map(player => player.position));
    return ['All', ...Array.from(positions).sort()];
  }, [players]);

  // 선택된 포지션에 따라 필터링된 선수 목록 (메모이제이션)
  const filteredPlayers = useMemo(() => {
    if (selectedPosition === 'All') {
      return players;
    }
    return players.filter(player => player.position === selectedPosition);
  }, [players, selectedPosition]);


  // 가입 요청 확인 버튼 클릭 핸들러
  const handleCheckJoinRequests = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.'); // alert 대신 toast 사용
      return;
    }
    if (!selectedTeamId) {
      toast.error('팀을 먼저 선택해주세요.'); // alert 대신 toast 사용
      return;
    }

    setLoadingJoinRequests(true);
    setJoinRequestsError(null); // 개별 모달 오류 메시지 초기화
    setGeneralError(null); // 전반적인 오류 메시지 초기화
    try {
      const requests = await getJoinRequestsByTeamId(selectedTeamId);
      setJoinRequests(requests);
      setShowJoinRequestsModal(true);
    } catch (error: any) { // ⭐ AuthError 처리 ⭐
      console.error("가입 요청 데이터를 가져오는 중 오류 발생:", error);
      if (error instanceof AuthError) {
        triggerSessionExpiredModal();
      } else {
        setJoinRequestsError(error.message || '가입 요청을 불러오는 데 실패했습니다.'); // 모달 내부에 표시될 오류
        toast.error(`가입 요청을 불러오는 데 실패했습니다: ${error.message || '알 수 없는 오류'}`);
      }
    } finally {
      setLoadingJoinRequests(false);
    }
  };

  // 모달 및 요청 처리 핸들러
  const handleCloseJoinRequestsModal = () => {
    setShowJoinRequestsModal(false);
    setJoinRequests([]);
    setJoinRequestsError(null);
    setSelectedRequestDetails(null);
  };

  const handleViewDetails = (request: JoinRequest) => {
    setSelectedRequestDetails(request);
  };

  const handleCloseDetailsView = () => {
    setSelectedRequestDetails(null);
  };

  // JoinRequest.id가 number이므로, userIdToAccept도 number로 처리합니다.
  const handleAcceptRequest = useCallback(async (userIdToAccept: number) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.'); // alert 대신 toast 사용
      return;
    }
    if (!selectedTeamId) {
      toast.error('팀을 먼저 선택해주세요.'); // alert 대신 toast 사용
      return;
    }
    if (processingRequest === userIdToAccept) return;

    setProcessingRequest(userIdToAccept);
    setGeneralError(null); // 새로운 요청 시작 전 오류 메시지 초기화
    try {
        await acceptJoinRequest(Number(selectedTeamId), userIdToAccept);

        alert('가입 요청을 수락했습니다!'); // ✅ 이 부분은 성공 알림이므로 alert 그대로 둬도 좋습니다.
        // request.id가 number이므로 필터링 조건도 number로 맞춰야 합니다.
        setJoinRequests(prevRequests => prevRequests.filter(req => req.id !== userIdToAccept));
        setSelectedRequestDetails(null);
        fetchPlayersForTeam(selectedTeamId); // 선수 목록 새로고침 (수락 후 업데이트된 선수 목록을 보여줄 수 있도록)
        fetchTeamMembersForTeam(selectedTeamId); // 팀 멤버 목록도 새로고침
    } catch (error: any) { // ⭐ AuthError 처리 ⭐
        console.error("가입 요청 수락 중 오류 발생:", error);
        if (error instanceof AuthError) {
          triggerSessionExpiredModal();
        } else {
          setGeneralError(error.message || '알 수 없는 오류가 발생했습니다.');
          toast.error(`가입 요청 수락에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
        }
    } finally {
        setProcessingRequest(null);
    }
  }, [isAuthenticated, selectedTeamId, processingRequest, fetchPlayersForTeam, fetchTeamMembersForTeam, triggerSessionExpiredModal]);

  // JoinRequest.id가 number이므로, userIdToReject도 number로 처리합니다.
  const handleRejectRequest = useCallback(async (userIdToReject: number) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.'); // alert 대신 toast 사용
      return;
    }
    if (!selectedTeamId) {
      toast.error('팀을 먼저 선택해주세요.'); // alert 대신 toast 사용
      return;
    }
    if (processingRequest === userIdToReject) return;

    setProcessingRequest(userIdToReject);
    setGeneralError(null); // 새로운 요청 시작 전 오류 메시지 초기화
    try {
      await rejectJoinRequest(userIdToReject);
      alert('가입 요청을 거절했습니다.'); // ✅ 이 부분은 성공 알림이므로 alert 그대로 둬도 좋습니다.
      // request.id가 number이므로 필터링 조건도 number로 맞춰야 합니다.
      setJoinRequests(prevRequests => prevRequests.filter(req => req.id !== userIdToReject));
      setSelectedRequestDetails(null);
    } catch (error: any) { // ⭐ AuthError 처리 ⭐
      console.error("가입 요청 거절 중 오류 발생:", error);
      if (error instanceof AuthError) {
        triggerSessionExpiredModal();
      } else {
        setGeneralError(error.message || '알 수 없는 오류가 발생했습니다.');
        toast.error(`가입 요청 거절에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
      }
    } finally {
      setProcessingRequest(null);
    }
  }, [isAuthenticated, selectedTeamId, processingRequest, triggerSessionExpiredModal]);


  // ✅ 팀 멤버를 포지션별로 그룹화
  const groupedTeamMembers = useMemo(() => {
    const groups: { [key: string]: TeamMember[] } = {
      FW: [],
      MF: [],
      DF: [],
      GK: [],
      ETC: [], // 기타 포지션도 고려
    };

    teamMembers.forEach(member => {
      if (groups[member.position]) {
        groups[member.position].push(member);
      } else {
        // 정의된 포지션 외의 값에 대한 처리 (혹은 API에서 정확히 정해진 포지션만 오도록 보장해야 함)
        groups.ETC.push(member);
      }
    });

    // 각 그룹 내에서 알파벳 순으로 정렬 (username 기준)
    for (const position in groups) {
      groups[position].sort((a, b) => a.username.localeCompare(b.username));
    }

    return groups;
  }, [teamMembers]);

  // 포지션 표시 순서 정의
  const orderedPositions: Array<'FW' | 'MF' | 'DF' | 'GK' | 'ETC'> = ['FW', 'MF', 'DF', 'GK', 'ETC'];

  // ⭐ 세션 만료 모달 렌더링 ⭐
  // 이 부분은 컴포넌트의 최상단에 위치하여 다른 렌더링 조건에 영향을 받지 않도록 합니다.
  if (isSessionExpiredModalOpen) {
    return (
      <SessionExpiredModal
        isOpen={isSessionExpiredModalOpen}
        onClose={handleSessionExpiredConfirm} // 모달 닫기 버튼 클릭 시에도 확인과 동일하게 동작
        onConfirm={handleSessionExpiredConfirm}
      />
    );
  }

  // 로딩 상태 처리 (인증 로딩 또는 페이지 자체 로딩)
  if (isLoading || loadingTeams || loadingPlayers || loadingTeamMembers) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-xl">데이터를 불러오는 중...</p>
          {isLoading && <p>인증 정보 로딩 중...</p>}
          {loadingTeams && <p>팀 목록 로딩 중...</p>}
          {loadingPlayers && <p>선수 목록 로딩 중...</p>}
          {loadingTeamMembers && <p>팀 멤버 로딩 중...</p>}
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (이미 useEffect에서 리다이렉트되었을 것이므로 여기서는 null 반환)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-sans text-white">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-white mb-2 drop-shadow-xl tracking-tight leading-tight">
            {selectedTeamName} 선수단
          </h1>
          <p className="text-gray-400 text-xl font-light italic mb-6">우리 팀의 자랑스러운 선수들을 소개합니다!</p>
        </div>

        {/* ⭐ 일반 오류 메시지 표시 영역 ⭐ */}
        {generalError && (
          <div className="bg-red-800 border border-red-700 text-white px-4 py-3 rounded-lg relative mb-6 animate-fade-in">
            <strong className="font-bold">오류 발생!</strong>
            <span className="block sm:inline ml-2">{generalError}</span>
            <button
              onClick={() => setGeneralError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-300 hover:text-white"
            >
              <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.348a1.2 1.2 0 0 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 0 1 1.697 1.697L11.697 10l2.652 2.651a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}

        {/* 팀 선택 드롭다운, 포지션 필터 및 가입 요청 확인 버튼 섹션 */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-end gap-4">
          <div className="flex flex-col items-start w-full sm:w-auto">
            <label htmlFor="team-select" className="text-gray-300 text-lg font-semibold mb-1 ml-1 tracking-wide">
              팀 선택
            </label>
            <select
              id="team-select"
              className="bg-gray-700 border border-gray-600 text-white text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5 shadow-lg appearance-none cursor-pointer hover:border-gray-500 transition-colors duration-200"
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                setSelectedPosition('All');
              }}
            >
              {teams.length > 0 ? (
                teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))
              ) : (
                <option value="">참여 중인 팀이 없습니다.</option>
              )}
            </select>
          </div>

          <div className="flex flex-col items-start w-full sm:w-auto">
            <label htmlFor="position-filter" className="text-gray-300 text-lg font-semibold mb-1 ml-1 tracking-wide">
              포지션
            </label>
            <select
              id="position-filter"
              className="bg-gray-700 border border-gray-600 text-white text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5 shadow-lg appearance-none cursor-pointer hover:border-gray-500 transition-colors duration-200"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              {allPositions.map(pos => (
                <option key={pos} value={pos}>
                  {positionLabels[pos] || pos}
                </option>
              ))}
            </select>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleCheckJoinRequests}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 w-full sm:w-auto text-base"
              disabled={loadingJoinRequests}
            >
              {loadingJoinRequests ? '요청 로딩 중...' : '팀 가입 요청 확인'}
            </button>
          )}
        </div>

        {/* ✅ 새로운 섹션: 현재 팀 멤버 목록 (포지션별 분류) */}
        <h2 className="text-3xl font-bold text-white mb-8 border-b-2 border-gray-600 pb-2 text-left mt-10">
          현재 팀 멤버
        </h2>
        {loadingTeamMembers ? (
          <div className="col-span-full text-center py-8 bg-gray-800 rounded-lg shadow-lg mb-8">
            <p className="text-gray-400 text-xl font-medium">팀 멤버 데이터를 불러오는 중...</p>
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-gray-800 rounded-lg shadow-lg mb-8">
            <p className="text-gray-400 text-lg font-medium">현재 팀에 멤버가 없습니다.</p>
            <p className="text-gray-500 mt-2 text-base">팀 가입 요청을 수락하거나, 새로운 멤버를 초대해보세요!</p>
          </div>
        ) : (
          <div className="space-y-8"> {/* 포지션별 섹션 간의 간격 */}
            {orderedPositions.map(position => {
              const membersInPosition = groupedTeamMembers[position];
              if (membersInPosition && membersInPosition.length > 0) {
                return (
                  <div key={position}>
                    <h3 className="text-2xl font-bold text-gray-200 mb-4 border-b border-gray-700 pb-2">
                      {positionLabels[position]}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {membersInPosition.map((member) => (
                        <div key={member.id} className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700 flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white mr-3 flex-shrink-0">
                            {member.username.charAt(0).toUpperCase()} {/* 이름의 첫 글자 */}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{member.username}</h3>
                            <p className="text-gray-400 text-sm">{positionLabels[member.position] || member.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null; // 해당 포지션에 멤버가 없으면 렌더링하지 않음
            })}
          </div>
        )}

        {/* 기존 선수 목록 섹션 제목 - 이 부분을 삭제합니다. */}
        {/*
        <h2 className="text-3xl font-bold text-white mb-8 border-b-2 border-gray-600 pb-2 text-left mt-10">
          선수 목록
        </h2>
        */}

        {/* 선수 목록 또는 로딩/없음 메시지 */}
        {loadingPlayers ? (
          <div className="col-span-full text-center py-12 bg-gray-800 rounded-lg shadow-lg">
            <p className="text-gray-400 text-xl font-medium">선수 데이터를 불러오는 중...</p>
            <div className="mt-4 animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500 mx-auto"></div>
          </div>
        ) : filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-gray-800 rounded-lg p-5 shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-white mr-4 flex-shrink-0">
                      {player.backNumber || '?'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{player.name}</h3>
                      <p className="text-gray-400 text-sm font-medium">{positionLabels[player.position] || player.position}</p>
                    </div>
                  </div>
                  {player.rating && (
                    <div className="flex justify-end items-baseline text-yellow-400">
                      <span className="text-2xl font-extrabold">{player.rating}</span>
                      <span className="text-xs ml-1 opacity-80">OVR</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null /* 선수 목록이 비어있을 때 메시지 대신 아무것도 렌더링하지 않습니다. */
          }
        {/* 푸터 또는 추가 정보 섹션 */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 My Team Manager. All rights reserved.</p>
        </div>
      </div>

      {/* 팀 가입 요청 모달 (필드 이름 변경 적용) */}
      {showJoinRequestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transform scale-95 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
              <h2 className="text-3xl font-bold text-white">팀 가입 요청 ({selectedTeamName})</h2>
              <button
                onClick={handleCloseJoinRequestsModal}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-4xl leading-none"
              >
                &times;
              </button>
            </div>

            {loadingJoinRequests ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg mb-4">가입 요청 불러오는 중...</p>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500 mx-auto"></div>
              </div>
            ) : joinRequestsError ? ( // ✅ 모달 내부 오류 표시
              <div className="text-center py-8">
                <p className="text-red-400 text-lg mb-4">오류: {joinRequestsError}</p>
                <p className="text-gray-500">잠시 후 다시 시도해주세요.</p>
              </div>
            ) : joinRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">현재 가입 요청이 없습니다.</p>
                <p className="text-gray-500 mt-2">새로운 팀원을 기다려 보세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <div key={request.id} className="bg-gray-700 p-4 rounded-md flex justify-between items-center shadow-md">
                    <div>
                      <p className="text-xl font-semibold text-white">{request.name}</p> {/* ✅ request.name */}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md text-sm font-semibold transition duration-200"
                      >
                        상세보기
                      </button>
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white py-2 px-4 rounded-md text-sm font-semibold transition duration-200"
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? '수락 중...' : '수락'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-rose-700 hover:bg-rose-600 text-white py-2 px-4 rounded-md text-sm font-semibold transition duration-200"
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? '거절 중...' : '거절'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-right border-t border-gray-700 pt-4">
              <button
                onClick={handleCloseJoinRequestsModal}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg transition duration-200"
              >
                닫기
              </button>
            </div>
          </div>

          {/* 가입 요청 상세 보기 모달/영역 (필드 이름 변경 적용) */}
          {selectedRequestDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transform scale-95 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                        <h3 className="text-3xl font-bold text-white">{selectedRequestDetails.name}님의 상세 요청</h3> {/* ✅ request.name */}
                        <button
                            onClick={handleCloseDetailsView}
                            className="text-gray-400 hover:text-white transition-colors duration-200 text-4xl leading-none"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="space-y-4 text-lg">
                        {selectedRequestDetails.province && <p><strong className="text-gray-300">거주지역:</strong> {provinceLabels[selectedRequestDetails.province] || selectedRequestDetails.province}</p>} {/* ✅ request.province */}
                        {selectedRequestDetails.cityCode && <p><strong className="text-gray-300">세부 지역:</strong> {cityCodeLabels[selectedRequestDetails.cityCode] || selectedRequestDetails.cityCode}</p>}
                        {selectedRequestDetails.position && <p><strong className="text-gray-300">선호 포지션:</strong> {positionLabels[selectedRequestDetails.position] || selectedRequestDetails.position}</p>} {/* ✅ request.position */}
                        {selectedRequestDetails.skillLevel && <p><strong className="text-gray-300">경험 수준:</strong> {skillLevelLabels[selectedRequestDetails.skillLevel] || selectedRequestDetails.skillLevel}</p>} {/* ✅ request.skillLevel */}

                        {selectedRequestDetails.teamIntro && (
                            <div>
                                <strong className="text-gray-300">자기소개:</strong>
                                <p className="bg-gray-700 p-3 rounded-md text-gray-200 whitespace-pre-wrap mt-1">{selectedRequestDetails.teamIntro}</p> {/* ✅ request.teamIntro */}
                            </div>
                        )}
                        <p><strong className="text-gray-300">상태:</strong> {selectedRequestDetails.requestStatus === 'PENDING' ? '대기 중' : selectedRequestDetails.requestStatus}</p> {/* ✅ request.requestStatus */}
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-700 pt-4">
                        <button
                            onClick={() => selectedRequestDetails && handleAcceptRequest(selectedRequestDetails.id)}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            disabled={selectedRequestDetails && processingRequest === selectedRequestDetails.id}
                        >
                            {selectedRequestDetails && processingRequest === selectedRequestDetails.id ? '수락 중...' : '수락'}
                        </button>
                        <button
                            onClick={() => selectedRequestDetails && handleRejectRequest(selectedRequestDetails.id)}
                            className="bg-rose-700 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            disabled={selectedRequestDetails && processingRequest === selectedRequestDetails.id}
                        >
                            {selectedRequestDetails && processingRequest === selectedRequestDetails.id ? '거절 중...' : '거절'}
                        </button>
                        <button
                            onClick={handleCloseDetailsView}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg transition duration-200"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamRosterViewer;
