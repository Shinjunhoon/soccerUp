// SoccerSquadBuilder.tsx
'use client'; 

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // useRouter 임포트
import toast from 'react-hot-toast'; // toast 임포트

import { 
  TeamMember, 
  getTeamMembersByTeamId,
  Team,       
  getTeams,
  getSquadByTeamIdAndFormationType,
  saveOrUpdateSquad,           
  SquadResponse,      
  SquadRequestDto,    
  SquadPositionRequestDto,
  AuthError // AuthError 임포트
} from '../services/TeamRosterViewer/TeamRosterViewer'; // 경로 확인

import { useAuth } from '../context/AuthContext'; // useAuth 임포트
import { useAuthErrorHandling } from '../context/useAuthErrorHandling'
import SessionExpiredModal from '../components/SessionExpiredModal'; // SessionExpiredModal 임포트


// 필드 선수 정보를 위한 로컬 인터페이스 정의
interface FieldPlayer {
  id: string; 
  position: 'GK' | 'LB' | 'CB' | 'RB' | 'CM' | 'LM' | 'RM' | 'LW' | 'ST' | 'RW' | 'LWB' | 'RWB' | 'CDM' | 'CAM' | 'CF' | 'LF' | 'RF' | 'LCB' | 'RCB' | 'LCM' | 'RCM' | 'SW' | 'SS' | 'CF'; 
  x: number;
  y: number;
  name: string; 
  playerId: number | null; 
}

// 벤치 및 선택된 선수 정보를 위한 로컬 인터페이스 정의
interface SquadPlayer extends TeamMember {
  // TeamMember에 position (FW, MF, DF, GK)이 정의되어 있다고 가정합니다.
}

const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  // 배열 비교
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // 객체 비교
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
};

// TacticalFormations 인터페이스 정의
interface TacticalFormations {
  [key: string]: string[]; // 모든 문자열 키에 대해 string[] 타입을 허용
  '공격력 중시': string[];
  '수비 안정': string[];
  '균형 지향': string[];
  '중원 장악': string[];
}

const SoccerSquadBuilder = () => { 
  const router = useRouter(); // useRouter 훅 사용
  const { isAuthenticated, isLoading } = useAuth(); // AuthContext에서 인증 상태 가져오기
  // ⭐ useAuthErrorHandling 훅 사용 ⭐
  const { isSessionExpiredModalOpen, handleSessionExpiredConfirm, triggerSessionExpiredModal } = useAuthErrorHandling();

  // useMemo를 사용하여 formations 객체가 렌더링마다 새로 생성되지 않도록 합니다.
  const formations = useMemo(() => ({
    '4-3-3': [
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lb', position: 'LB', x: 20, y: 70, name: '', playerId: null },
      { id: 'cb1', position: 'CB', x: 40, y: 75, name: '', playerId: null },
      { id: 'cb2', position: 'CB', x: 60, y: 75, name: '', playerId: null },
      { id: 'rb', position: 'RB', x: 80, y: 70, name: '', playerId: null },
      { id: 'cm1', position: 'CM', x: 30, y: 50, name: '', playerId: null },
      { id: 'cm2', position: 'CM', x: 50, y: 55, name: '', playerId: null },
      { id: 'cm3', position: 'CM', x: 70, y: 50, name: '', playerId: null },
      { id: 'lw', position: 'LW', x: 25, y: 25, name: '', playerId: null },
      { id: 'st', position: 'ST', x: 50, y: 20, name: '', playerId: null },
      { id: 'rw', position: 'RW', x: 75, y: 25, name: '', playerId: null },
    ],
    '4-4-2': [
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lb', position: 'LB', x: 20, y: 70, name: '', playerId: null },
      { id: 'cb1', position: 'CB', x: 40, y: 75, name: '', playerId: null },
      { id: 'cb2', position: 'CB', x: 60, y: 75, name: '', playerId: null },
      { id: 'rb', position: 'RB', x: 80, y: 70, name: '', playerId: null },
      { id: 'lm', position: 'LM', x: 20, y: 45, name: '', playerId: null },
      { id: 'cm1', position: 'CM', x: 40, y: 50, name: '', playerId: null },
      { id: 'cm2', position: 'CM', x: 60, y: 50, name: '', playerId: null },
      { id: 'rm', position: 'RM', x: 80, y: 45, name: '', playerId: null },
      { id: 'st1', position: 'ST', x: 40, y: 20, name: '', playerId: null },
      { id: 'st2', position: 'ST', x: 60, y: 20, name: '', playerId: null },
    ],
    '4-2-3-1': [
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lb', position: 'LB', x: 20, y: 70, name: '', playerId: null },
      { id: 'cb1', position: 'CB', x: 40, y: 75, name: '', playerId: null },
      { id: 'cb2', position: 'CB', x: 60, y: 75, name: '', playerId: null },
      { id: 'rb', position: 'RB', x: 80, y: 70, name: '', playerId: null },
      { id: 'cdm1', position: 'CDM', x: 40, y: 55, name: '', playerId: null }, // Defensive Midfielder
      { id: 'cdm2', position: 'CDM', x: 60, y: 55, name: '', playerId: null },
      { id: 'cam', position: 'CAM', x: 50, y: 35, name: '', playerId: null }, // Attacking Midfielder
      { id: 'lw', position: 'LW', x: 25, y: 30, name: '', playerId: null },
      { id: 'rw', position: 'RW', x: 75, y: 30, name: '', playerId: null },
      { id: 'st', position: 'ST', x: 50, y: 15, name: '', playerId: null },
    ],
    '3-4-3': [
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lcb', position: 'LCB', x: 30, y: 75, name: '', playerId: null }, // Left Center Back
      { id: 'cb', position: 'CB', x: 50, y: 80, name: '', playerId: null },
      { id: 'rcb', position: 'RCB', x: 70, y: 75, name: '', playerId: null }, // Right Center Back
      { id: 'lm', position: 'LM', x: 20, y: 50, name: '', playerId: null },
      { id: 'cm1', position: 'CM', x: 40, y: 55, name: '', playerId: null },
      { id: 'cm2', position: 'CM', x: 60, y: 55, name: '', playerId: null },
      { id: 'rm', position: 'RM', x: 80, y: 50, name: '', playerId: null },
      { id: 'lw', position: 'LW', x: 25, y: 25, name: '', playerId: null },
      { id: 'st', position: 'ST', x: 50, y: 20, name: '', playerId: null },
      { id: 'rw', position: 'RW', x: 75, y: 25, name: '', playerId: null },
    ],
    '4-1-2-3': [ // Deeper defensive midfielder, two central midfielders, and three forwards
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lb', position: 'LB', x: 20, y: 70, name: '', playerId: null },
      { id: 'cb1', position: 'CB', x: 40, y: 75, name: '', playerId: null },
      { id: 'cb2', position: 'CB', x: 60, y: 75, name: '', playerId: null },
      { id: 'rb', position: 'RB', x: 80, y: 70, name: '', playerId: null },
      { id: 'cdm', position: 'CDM', x: 50, y: 60, name: '', playerId: null },
      { id: 'cm1', position: 'CM', x: 35, y: 45, name: '', playerId: null },
      { id: 'cm2', position: 'CM', x: 65, y: 45, name: '', playerId: null },
      { id: 'lw', position: 'LW', x: 25, y: 25, name: '', playerId: null },
      { id: 'st', position: 'ST', x: 50, y: 18, name: '', playerId: null },
      { id: 'rw', position: 'RW', x: 75, y: 25, name: '', playerId: null },
    ],
    '3-5-2': [
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lcb', position: 'LCB', x: 30, y: 75, name: '', playerId: null },
      { id: 'cb', position: 'CB', x: 50, y: 80, name: '', playerId: null },
      { id: 'rcb', position: 'RCB', x: 70, y: 75, name: '', playerId: null },
      { id: 'lwb', position: 'LWB', x: 15, y: 55, name: '', playerId: null }, // Left Wing Back
      { id: 'cm1', position: 'CM', x: 35, y: 50, name: '', playerId: null },
      { id: 'cm2', position: 'CM', x: 50, y: 45, name: '', playerId: null },
      { id: 'cm3', position: 'CM', x: 65, y: 50, name: '', playerId: null },
      { id: 'rwb', position: 'RWB', x: 85, y: 55, name: '', playerId: null }, // Right Wing Back
      { id: 'st1', position: 'ST', x: 40, y: 20, name: '', playerId: null },
      { id: 'st2', position: 'ST', x: 60, y: 20, name: '', playerId: null },
    ],
    '5-3-2': [ // 5백, 3미들, 2톱
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lcb1', position: 'LCB', x: 25, y: 78, name: '', playerId: null },
      { id: 'lcb2', position: 'LCB', x: 40, y: 80, name: '', playerId: null },
      { id: 'cb', position: 'CB', x: 50, y: 82, name: '', playerId: null },
      { id: 'rcb1', position: 'RCB', x: 60, y: 80, name: '', playerId: null },
      { id: 'rcb2', position: 'RCB', x: 75, y: 78, name: '', playerId: null },
      { id: 'cm1', position: 'CM', x: 35, y: 50, name: '', playerId: null },
      { id: 'cm2', position: 'CM', x: 50, y: 55, name: '', playerId: null },
      { id: 'cm3', position: 'CM', x: 65, y: 50, name: '', playerId: null },
      { id: 'st1', position: 'ST', x: 40, y: 20, name: '', playerId: null },
      { id: 'st2', position: 'ST', x: 60, y: 20, name: '', playerId: null },
    ],
    '4-5-1': [
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lb', position: 'LB', x: 20, y: 70, name: '', playerId: null },
      { id: 'cb1', position: 'CB', x: 40, y: 75, name: '', playerId: null },
      { id: 'cb2', position: 'CB', x: 60, y: 75, name: '', playerId: null },
      { id: 'rb', position: 'RB', x: 80, y: 70, name: '', playerId: null },
      { id: 'lm', position: 'LM', x: 20, y: 45, name: '', playerId: null },
      { id: 'cm1', position: 'CM', x: 35, y: 50, name: '', playerId: null },
      { id: 'cm2', position: 'CM', x: 50, y: 55, name: '', playerId: null },
      { id: 'cm3', position: 'CM', x: 65, y: 50, name: '', playerId: null },
      { id: 'rm', position: 'RM', x: 80, y: 45, name: '', playerId: null },
      { id: 'st', position: 'ST', x: 50, y: 20, name: '', playerId: null }, // Single Striker
    ],
    '4-1-4-1': [
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lb', position: 'LB', x: 20, y: 70, name: '', playerId: null },
      { id: 'cb1', position: 'CB', x: 40, y: 75, name: '', playerId: null },
      { id: 'cb2', position: 'CB', x: 60, y: 75, name: '', playerId: null },
      { id: 'rb', position: 'RB', x: 80, y: 70, name: '', playerId: null },
      { id: 'cdm', position: 'CDM', x: 50, y: 60, name: '', playerId: null }, // Defensive Midfielder
      { id: 'lm', position: 'LM', x: 20, y: 40, name: '', playerId: null },
      { id: 'cam1', position: 'CAM', x: 40, y: 45, name: '', playerId: null }, // Central Attacking Midfielder
      { id: 'cam2', position: 'CAM', x: 60, y: 45, name: '', playerId: null },
      { id: 'rm', position: 'RM', x: 80, y: 40, name: '', playerId: null },
      { id: 'st', position: 'ST', x: 50, y: 15, name: '', playerId: null },
    ],
  }), []) as { [key: string]: FieldPlayer[] };

  // 전술적 분류를 위한 새로운 객체 정의 (인터페이스 적용)
  const tacticalFormations: TacticalFormations = useMemo(() => ({
    '공격력 중시': ['4-3-3', '3-4-3'],
    '수비 안정': ['4-2-3-1', '5-3-2'],
    '균형 지향': ['4-4-2', '4-1-4-1'],
    '중원 장악': ['3-5-2', '4-2-3-1'], // 4-2-3-1은 중원 장악에도 해당될 수 있음
  }), []);

  const [currentTacticalCategory, setCurrentTacticalCategory] = useState<string>('공격력 중시'); // 기본 전술 카테고리
  const [currentFormation, setCurrentFormation] = useState<string>('4-3-3');
  const [fieldPlayers, setFieldPlayers] = useState<FieldPlayer[]>(
    formations['4-3-3'].map(p => ({ ...p, name: '', playerId: null }))
  );
  
  // fieldPlayers의 현재 값을 useEffect 종속성으로 만들지 않고 저장하기 위해 ref를 사용합니다.
  const fieldPlayersRef = useRef<FieldPlayer[]>(fieldPlayers);
  // fieldPlayers 상태가 변경될 때마다 ref를 업데이트합니다.
  useEffect(() => {
    fieldPlayersRef.current = fieldPlayers;
  }, [fieldPlayers]);


  const [selectedPlayer, setSelectedPlayer] = useState<SquadPlayer | null>(null);
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);

  const [benchPlayers, setBenchPlayers] = useState<SquadPlayer[]>([]);
  const [loadingBenchPlayers, setLoadingBenchPlayers] = useState(true);
  const [benchPlayersError, setBenchPlayersError] = useState<string | null>(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(''); 
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const [currentSquadId, setCurrentSquadId] = useState<number | null>(null); 
  const [loadingSquad, setLoadingSquad] = useState<boolean>(false);
  const [squadError, setSquadError] = useState<string | null>(null);

  const prevSelectedTeamIdRef = useRef<string | undefined>(undefined);
  const prevCurrentFormationRef = useRef<string | undefined>(undefined);

  // 초기 로딩 시 인증되지 않은 경우 로그인 페이지로 리다이렉트
  const redirectToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('로그인이 필요합니다. 스쿼드 빌더 페이지에 접근할 수 없습니다.');
      redirectToLogin();
    }
  }, [isLoading, isAuthenticated, redirectToLogin]);


  // useEffect: 컴포넌트 마운트 시 팀 목록을 불러옵니다.
  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      setTeamsError(null);
      try {
        const fetchedTeams = await getTeams(); // ⭐ API 호출 ⭐
        setTeams(fetchedTeams);
        if (fetchedTeams.length > 0) {
          // 첫 번째 팀을 기본값으로 설정
          setSelectedTeamId(String(fetchedTeams[0].id)); 
        } else {
          setSelectedTeamId('');
        }
      } catch (error: any) { // ⭐ AuthError 처리 ⭐
        console.error("팀 목록을 불러오는 중 오류 발생:", error);
        if (error instanceof AuthError) {
          triggerSessionExpiredModal();
        } else {
          setTeamsError(`팀 목록을 불러오는 데 실패했습니다: ${error.message}`);
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
  }, [isAuthenticated, triggerSessionExpiredModal]); // isAuthenticated를 의존성 배열에 추가


  // ⭐ 전술 카테고리 변경 시, 해당 카테고리의 첫 번째 포메이션으로 currentFormation 업데이트
  // 이 useEffect는 currentTacticalCategory가 변경될 때만 실행되어야 합니다.
  // currentFormation이 종속성 배열에 있으면, 사용자가 포메이션 드롭다운을 변경할 때도 불필요하게 재실행됩니다.
  useEffect(() => {
    // 디버깅을 위해 현재 종속성 배열의 내용과 크기를 콘솔에 출력합니다.
    console.log("useEffect (line 265) Dependency Array Content:", [currentTacticalCategory, tacticalFormations]);

    const formationsInCurrentCategory = tacticalFormations[currentTacticalCategory];
    if (formationsInCurrentCategory && formationsInCurrentCategory.length > 0) {
      const defaultFormationForCategory = formationsInCurrentCategory[0];
      // currentFormation이 이미 해당 카테고리의 기본값이거나,
      // 사용자가 수동으로 다른 포메이션을 선택한 경우에는 업데이트하지 않습니다.
      // 하지만, 카테고리가 변경되면 무조건 새 카테고리의 기본 포메이션으로 설정합니다.
      // 이 로직은 currentFormation이 이 useEffect의 종속성이 아닐 때만 제대로 작동합니다.
      setCurrentFormation(defaultFormationForCategory);
    }
  }, [currentTacticalCategory, tacticalFormations]); // currentFormation을 종속성에서 제거


  // useEffect: selectedTeamId, currentFormation, 또는 formations 객체 (이제 useMemo로 안정화됨)가 변경될 때만 실행됩니다.
  useEffect(() => {
    console.groupCollapsed("%c--- useEffect Triggered ---", "color: blue; font-weight: bold;");
    console.log("Current selectedTeamId:", selectedTeamId, "(Prev:", prevSelectedTeamIdRef.current, ")");
    console.log("Current currentFormation:", currentFormation, "(Prev:", prevCurrentFormationRef.current, ")");
    
    // 이 시점의 fieldPlayers 상태는 useEffect의 의존성이 아니므로
    // 최신 상태를 반영하기 위해 ref를 사용합니다.
    console.log("Current fieldPlayers (from ref):", fieldPlayersRef.current);
    console.log("formations (Reference):", formations);
    console.groupEnd();

    prevSelectedTeamIdRef.current = selectedTeamId;
    prevCurrentFormationRef.current = currentFormation;

    const fetchTeamMembersAndSquad = async () => {
      console.log("%c>>> fetchTeamMembersAndSquad 함수 실행 시작 <<<", "color: green;");

      if (!selectedTeamId) { 
        console.log("selectedTeamId가 없어 스쿼드 로드 건너뛰고 상태 초기화.");
        setBenchPlayers([]);
        setLoadingBenchPlayers(false);
        const emptyField = formations[currentFormation].map(p => ({ ...p, name: '', playerId: null }));
        if (!deepEqual(fieldPlayersRef.current, emptyField)) { 
          console.log("%cfieldPlayers 업데이트: selectedTeamId 없음으로 인한 초기화", "color: orange;");
          setFieldPlayers(emptyField); 
        } else {
          console.log("fieldPlayers가 이미 비어있어 업데이트 건너뜀 (selectedTeamId 없음).");
        }
        setCurrentSquadId(null);
        setLoadingSquad(false);
        setBenchPlayersError(null);
        setSquadError(null);
        console.log("%c<<< fetchTeamMembersAndSquad 함수 실행 종료 (selectedTeamId 없음) >>>", "color: green;");
        return;
      }

      // 1. 벤치 선수 목록 불러오기
      setLoadingBenchPlayers(true);
      setBenchPlayersError(null);
      console.log(`팀 멤버 로드 시작 (Team ID: ${selectedTeamId})`);
      try {
        const fetchedMembers = await getTeamMembersByTeamId(selectedTeamId); // ⭐ API 호출 ⭐
        const membersAsSquadPlayers: SquadPlayer[] = fetchedMembers.map(member => ({
          ...member,
        }));
        setBenchPlayers(membersAsSquadPlayers);
        console.log("팀 멤버 로드 성공:", fetchedMembers.length, "명");
      } catch (error: any) { // ⭐ AuthError 처리 ⭐
        console.error("팀 멤버 데이터를 불러오는 중 오류 발생:", error);
        if (error instanceof AuthError) {
          triggerSessionExpiredModal();
        } else {
          setBenchPlayersError(`팀 멤버 목록을 불러오는 데 실패했습니다: ${error.message}`);
          toast.error(`팀 멤버 목록을 불러오는 데 실패했습니다: ${error.message}`);
        }
        setBenchPlayers([]);
      } finally {
        setLoadingBenchPlayers(false);
      }

      // 2. 해당 팀의 현재 포메이션 스쿼드 불러오기
      setLoadingSquad(true);
      setSquadError(null);
      console.log(`스쿼드 데이터 로드 시작 (Team ID: ${selectedTeamId}, Formation: ${currentFormation})`);
      try {
        const squad = await getSquadByTeamIdAndFormationType(Number(selectedTeamId), currentFormation); // ⭐ API 호출 ⭐

        if (squad) {
          console.log("스쿼드 데이터 로드 성공:", squad);
          setCurrentSquadId(squad.id); 
          
          const currentFormationPositions = formations[currentFormation] || formations['4-3-3'];

          const newFieldPlayers: FieldPlayer[] = currentFormationPositions.map(pos => {
            const assignedPlayer = squad.positions.find(sp => sp.fieldPositionCode === pos.id);
            if (assignedPlayer) {
              return {
                ...pos,
                name: assignedPlayer.playerName || '', 
                // 여기서 타입 일관성 확보: playerId를 Number로 명시적 변환
                playerId: assignedPlayer.teamMemberId ? Number(assignedPlayer.teamMemberId) : null,
              };
            }
            return { ...pos, name: '', playerId: null }; 
          });

          if (!deepEqual(fieldPlayersRef.current, newFieldPlayers)) { 
            console.log("%c--- fieldPlayers 업데이트 예정: 새 스쿼드 데이터 적용 ---", "color: orange; font-weight: bold;");
            
            fieldPlayersRef.current.forEach((prevPlayer, index) => { 
              const newPlayer = newFieldPlayers[index];
              if (newPlayer && !deepEqual(prevPlayer, newPlayer)) { 
                console.log(`%c[DIFF] Position ID: ${prevPlayer.id}`, "color: red; font-weight: bold;");
                console.log("  Prev Player:", prevPlayer);
                console.log("  New Player :", newPlayer);
                Object.keys(prevPlayer).forEach(key => {
                  const prevVal = (prevPlayer as any)[key];
                  const newVal = (newPlayer as any)[key];
                  if (!deepEqual(prevVal, newVal)) {
                    console.log(`    - Key '${key}': Prev =`, prevVal, ", New =", newVal);
                  }
                });
              }
            });
            console.log("%c----------------------------------------------------", "color: orange; font-weight: bold;");

            setFieldPlayers(newFieldPlayers);
          } else {
            console.log("fieldPlayers 내용이 동일하여 업데이트 건너뜀 (스쿼드 존재).");
          }
        } else {
          console.log(`현재 팀(${selectedTeamId})에 ${currentFormation} 포메이션의 기존 스쿼드가 없습니다. 빈 필드로 초기화합니다.`);
          const emptyField = formations[currentFormation].map(p => ({ ...p, name: '', playerId: null }));
          if (!deepEqual(fieldPlayersRef.current, emptyField)) { 
            console.log("%cfieldPlayers 업데이트: 빈 필드로 초기화 (스쿼드 없음)", "color: orange;");
            setFieldPlayers(emptyField); 
          } else {
            console.log("fieldPlayers가 이미 비어있어 업데이트 건너뜠습니다 (스쿼드 없음).");
          }
          setCurrentSquadId(null); 
        }
      } catch (error: any) { // ⭐ AuthError 처리 ⭐
        console.error(`스쿼드 데이터를 불러오는 중 오류 발생 (팀 ID: ${selectedTeamId}, 포메이션: ${currentFormation}):`, error);
        if (error instanceof AuthError) {
          triggerSessionExpiredModal();
        } else {
          setSquadError(`스쿼드 데이터를 불러오는 데 실패했습니다: ${error.message}`);
          toast.error(`스쿼드 데이터를 불러오는 데 실패했습니다: ${error.message}`);
        }
        const emptyField = formations[currentFormation].map(p => ({ ...p, name: '', playerId: null }));
        if (!deepEqual(fieldPlayersRef.current, emptyField)) { 
          console.log("%cfieldPlayers 업데이트: 오류 발생으로 빈 필드 초기화", "color: orange;");
          setFieldPlayers(emptyField); 
        } else {
          console.log("fieldPlayers가 이미 비어있어 업데이트 건너뜠습니다 (오류 발생).");
        }
        setCurrentSquadId(null); 
      } finally {
        setLoadingSquad(false);
        console.log("%c<<< fetchTeamMembersAndSquad 함수 실행 종료 >>>", "color: green;");
      }
    };

    // 인증된 경우에만 API 호출을 시도합니다.
    if (isAuthenticated) {
      fetchTeamMembersAndSquad(); 
    }
  }, [selectedTeamId, currentFormation, formations, isAuthenticated, triggerSessionExpiredModal]); // isAuthenticated와 triggerSessionExpiredModal 의존성 추가


  // 필드 선수 클릭 핸들러
  const handleFieldPlayerClick = useCallback((fieldPositionId: string) => {
    console.log(`%c필드 포지션 클릭: ${fieldPositionId}`, "color: purple;");
    const targetPosition = fieldPlayers.find(p => p.id === fieldPositionId);

    if (!targetPosition) return;

    if (selectedPlayer) {
      console.log(`%c선택된 선수(${selectedPlayer.username})를 ${fieldPositionId}에 배치 시도.`, "color: purple;");
      const updatedFieldPlayers = fieldPlayers.map(player => 
        player.id === fieldPositionId 
          ? { 
              ...player, 
              name: selectedPlayer.username,
              playerId: selectedPlayer.id,   
            }
          : player
      );
      if (!deepEqual(fieldPlayers, updatedFieldPlayers)) {
          console.log("%cfieldPlayers 업데이트: 선수 배치", "color: orange;");
          setFieldPlayers(updatedFieldPlayers);
      } else {
          console.log("fieldPlayers 내용이 동일하여 업데이트 건너뜠습니다 (선수 배치).");
      }
      setSelectedPlayer(null); 
    } else {
      if (targetPosition.name && targetPosition.playerId !== null) {
        console.log(`%c${fieldPositionId}에 있는 선수(${targetPosition.name}) 선택 해제 시도.`, "color: purple;");
        const originalPlayerInBench = benchPlayers.find(bp => bp.id === targetPosition.playerId);

        // 필드에서 제거할 선수를 다시 벤치 선수로 '선택' 상태로 만듭니다.
        setSelectedPlayer({ 
          id: targetPosition.playerId, 
          username: targetPosition.name, 
          position: originalPlayerInBench ? originalPlayerInBench.position : 'FW', 
        });

        // 필드에서 선수 제거
        const updatedFieldPlayers = fieldPlayers.map(player => 
            player.id === fieldPositionId 
                ? { ...player, name: '', playerId: null } 
                : player
        );
        if (!deepEqual(fieldPlayers, updatedFieldPlayers)) {
          console.log("%cfieldPlayers 업데이트: 필드 선수 제거", "color: orange;");
          setFieldPlayers(updatedFieldPlayers);
        } else {
            console.log("fieldPlayers 내용이 동일하여 업데이트 건너뜠습니다 (선수 제거).");
        }
      } else {
        console.log(`%c${fieldPositionId}에 선수가 없어 선택 해제 불가.`, "color: purple;");
      }
    }
  }, [selectedPlayer, fieldPlayers, benchPlayers]);

  // 포메이션 변경 핸들러
  const handleFormationChange = useCallback((formation: string) => {
    console.log(`%c포메이션 변경 감지: ${currentFormation} -> ${formation}`, "color: purple;");
    setCurrentFormation(formation);
    // 새로운 포메이션에 맞는 초기 필드 선수 목록을 가져오기 (해당 포메이션이 없으면 4-3-3 기본)
    const initialFieldPlayers = (formations[formation] || formations['4-3-3']).map(p => ({ ...p, name: '', playerId: null }));
    // deepEqual 체크 제거: 포메이션 변경 시에는 항상 필드 초기화
    console.log("%cfieldPlayers 업데이트: 포메이션 변경으로 인한 초기화", "color: orange;");
    setFieldPlayers(initialFieldPlayers);
    setSelectedPlayer(null); 
    setCurrentSquadId(null); 
  }, [currentFormation, formations]); 

  // 벤치 선수 클릭 핸들러
  const handleBenchPlayerClick = useCallback((player: SquadPlayer) => {
    console.log(`%c벤치 선수 클릭: ${player.username}`, "color: purple;");
    if (selectedPlayer && selectedPlayer.id === player.id) {
      setSelectedPlayer(null); 
    } else {
      setSelectedPlayer(player); 
    }
  }, [selectedPlayer]);

  // 드래그 시작 핸들러
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, fieldPositionId: string) => {
    console.log(`%c드래그 시작: ${fieldPositionId}`, "color: purple;");
    const playerOnField = fieldPlayers.find(p => p.id === fieldPositionId);
    if (playerOnField && playerOnField.name) {
      setDraggedPlayer(fieldPositionId);
      e.dataTransfer.effectAllowed = "move"; 
    } else {
      e.preventDefault(); 
    }
  }, [fieldPlayers]);

  // 드래그 오버 핸들러 (드롭을 허용하기 위해 preventDefault 필수)
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  }, []);

  // 드롭 핸들러
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetFieldPositionId: string) => {
    e.preventDefault();
    console.log(`%c드롭 감지: ${draggedPlayer} -> ${targetFieldPositionId}`, "color: purple;");
    
    if (draggedPlayer && draggedPlayer !== targetFieldPositionId) {
      const draggedPlayerIndex = fieldPlayers.findIndex(p => p.id === draggedPlayer);
      const targetPlayerIndex = fieldPlayers.findIndex(p => p.id === targetFieldPositionId);
      
      if (draggedPlayerIndex === -1 || targetPlayerIndex === -1) {
        console.log("드래그 또는 타겟 선수를 찾을 수 없음.");
        return;
      }

      const updatedPlayers = [...fieldPlayers]; 
      
      const tempPlayerInfo = { 
        name: updatedPlayers[draggedPlayerIndex].name,
        playerId: updatedPlayers[draggedPlayerIndex].playerId,
      };

      updatedPlayers[draggedPlayerIndex].name = updatedPlayers[targetPlayerIndex].name;
      updatedPlayers[draggedPlayerIndex].playerId = updatedPlayers[targetPlayerIndex].playerId;

      updatedPlayers[targetPlayerIndex].name = tempPlayerInfo.name;
      updatedPlayers[targetPlayerIndex].playerId = tempPlayerInfo.playerId;

      if (!deepEqual(fieldPlayers, updatedPlayers)) {
        console.log("%cfieldPlayers 업데이트: 선수 위치 교환", "color: orange;");
        setFieldPlayers(updatedPlayers);
      } else {
        console.log("fieldPlayers 내용이 동일하여 업데이트 건너뜠습니다 (위치 교환).");
      }
    }
    
    setDraggedPlayer(null); 
  }, [draggedPlayer, fieldPlayers]);

  // 스쿼드 저장 핸들러
  const handleSaveSquad = useCallback(async () => {
    console.log("%c스쿼드 저장 버튼 클릭.", "color: purple;");
    if (!selectedTeamId) {
      toast.error("팀을 먼저 선택해주세요!"); // alert 대신 toast 사용
      return;
    }

    const positionRequestDtoList: SquadPositionRequestDto[] = fieldPlayers
      .filter(fp => fp.playerId !== null) 
      .map(fp => ({
        fieldPositionCode: fp.id, 
        teamMemberId: fp.playerId as number, 
      }));

    const squadData: SquadRequestDto = {
      teamId: Number(selectedTeamId), 
      formationType: currentFormation, 
      positionRequestDtoList: positionRequestDtoList,
    };

    try {
      console.log("%c스쿼드 저장/업데이트 API 호출 시작:", "color: brown;", squadData);
      const resultSquad = await saveOrUpdateSquad(squadData); // ⭐ API 호출 ⭐
      
      setCurrentSquadId(resultSquad.id); 
      // ⭐ 스쿼드 저장 성공 시 토스트 메시지 표시 ⭐
      toast.success('스쿼드가 성공적으로 저장/업데이트되었습니다!'); 
      console.log("스쿼드 저장/업데이트 성공. 백엔드 응답:", resultSquad);
    } catch (error: any) { // ⭐ AuthError 처리 ⭐
      console.error("스쿼드 저장/업데이트 중 오류 발생:", error);
      if (error instanceof AuthError) {
        triggerSessionExpiredModal();
      } else {
        toast.error(`스쿼드 저장/업데이트에 실패했습니다: ${error.message}`); // alert 대신 toast 사용
      }
    }
  }, [selectedTeamId, currentFormation, fieldPlayers, triggerSessionExpiredModal]); // triggerSessionExpiredModal 의존성 추가


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
  if (isLoading || loadingTeams || loadingBenchPlayers || loadingSquad) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-xl">데이터를 불러오는 중...</p>
          {loadingTeams && <p>팀 목록 로딩 중...</p>}
          {loadingBenchPlayers && <p>벤치 선수 로딩 중...</p>}
          {loadingSquad && <p>스쿼드 로딩 중...</p>}
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (이미 useEffect에서 리다이렉트되었을 것이므로 여기서는 null 반환)
  if (!isAuthenticated) {
    return null;
  }


  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">스쿼드 빌더</h1>
          
          {/* 팀 선택 드롭다운 */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <label htmlFor="team-select" className="text-gray-300 text-lg font-semibold">
              팀 선택:
            </label>
            {teamsError ? (
              <p className="text-red-400">{teamsError}</p>
            ) : teams.length === 0 ? (
              <p className="text-gray-400">참여 중인 팀이 없습니다.</p>
            ) : (
              <select
                id="team-select"
                className="bg-gray-700 border border-gray-600 text-white text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5 shadow-lg appearance-none cursor-pointer hover:border-gray-500 transition-colors duration-200"
                value={selectedTeamId}
                onChange={(e) => {
                  console.log(`%c팀 변경 이벤트: ${selectedTeamId} -> ${e.target.value}`, "color: purple;");
                  setSelectedTeamId(e.target.value);
                  
                  // 현재 선택된 포메이션의 초기 필드 선수 목록으로 초기화
                  const initialFieldPlayers = (formations[currentFormation] || formations['4-3-3']).map(p => ({ ...p, name: '', playerId: null }));
                  if (!deepEqual(fieldPlayers, initialFieldPlayers)) {
                    console.log("%cfieldPlayers 업데이트: 팀 변경으로 인한 초기화", "color: orange;");
                    setFieldPlayers(initialFieldPlayers);
                  } else {
                    console.log("fieldPlayers가 이미 초기 상태이므로 업데이트 건너뜠습니다 (팀 변경).");
                  }
                  setSelectedPlayer(null); 
                  setCurrentSquadId(null); 
                }}
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 전술 카테고리 및 포메이션 선택 드롭다운 */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <label htmlFor="tactical-category-select" className="text-gray-300 text-lg font-semibold">
              전술 유형:
            </label>
            <select
              id="tactical-category-select"
              className="bg-gray-700 border border-gray-600 text-white text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5 shadow-lg appearance-none cursor-pointer hover:border-gray-500 transition-colors duration-200"
              value={currentTacticalCategory}
              onChange={(e) => setCurrentTacticalCategory(e.target.value)}
            >
              {Object.keys(tacticalFormations).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label htmlFor="formation-select" className="text-gray-300 text-lg font-semibold">
              포메이션 선택:
            </label>
            <select
              id="formation-select"
              className="bg-gray-700 border border-gray-600 text-white text-base rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5 shadow-lg appearance-none cursor-pointer hover:border-gray-500 transition-colors duration-200"
              value={currentFormation}
              onChange={(e) => handleFormationChange(e.target.value)}
            >
              {/* 현재 선택된 전술 카테고리에 해당하는 포메이션만 표시 */}
              {tacticalFormations[currentTacticalCategory]?.map(formation => (
                <option key={formation} value={formation}>
                  {formation}
                </option>
              )) || (
                // 카테고리에 포메이션이 없을 경우를 대비 (비어있는 경우)
                <option value="">포메이션 없음</option>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 축구 필드 */}
          <div className="lg:col-span-3">
            <div className="relative w-full h-[600px] bg-green-600 rounded-lg overflow-hidden shadow-2xl">
              {/* 필드 라인 등 기존 요소 유지 */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-16 border-2 border-b-white border-white"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-16 border-2 border-t-white border-white"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-b-white border-white"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-t-white border-white"></div>
                {/* 골대 */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-300 rounded-b-lg"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-300 rounded-t-lg"></div>
              </div>

              {/* 선수 위치 */}
              {loadingSquad ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 text-white text-lg">
                  스쿼드 불러오는 중...
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white ml-3"></div>
                </div>
              ) : squadError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-70 text-white text-lg">
                  스쿼드 로드 오류: {squadError}
                </div>
              ) : (
                fieldPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                      selectedPlayer?.id === player.playerId ? 'scale-110 z-20' : 'z-10' 
                    } ${
                      draggedPlayer === player.id ? 'opacity-50' : ''
                    }`}
                    style={{ 
                      left: `${player.x}%`, 
                      top: `${player.y}%` 
                    }}
                    onClick={() => handleFieldPlayerClick(player.id)}
                    draggable={player.name ? true : false} 
                    onDragStart={(e) => handleDragStart(e, player.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, player.id)}
                  >
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg ${
                      player.name 
                        ? (selectedPlayer?.id === player.playerId 
                            ? 'bg-yellow-400 border-yellow-600 text-black' 
                            : 'bg-blue-600 border-blue-800 text-white') 
                        : 'bg-gray-400 border-gray-600 text-gray-800' 
                    }`}>
                      {player.name ? player.name[0] : '?'} 
                    </div>
                    <div className="text-xs text-white text-center mt-1 font-semibold">
                      {player.position} 
                    </div>
                    {player.name && (
                      <div className="text-xs text-white text-center bg-black bg-opacity-50 rounded px-1 mt-1">
                        {player.name} 
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* 스쿼드 저장 버튼 (이전 UI 유지) */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSaveSquad}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
              >
                스쿼드 저장
              </button>
            </div>
            {squadError && <p className="text-red-400 text-center mt-4">{squadError}</p>}
          </div>

          {/* 벤치 선수 목록 */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-gray-600 pb-2 text-left">벤치 선수</h2>
            {!selectedTeamId ? (
              <div className="text-center py-4 text-gray-400">
                먼저 팀을 선택해주세요.
              </div>
            ) : loadingBenchPlayers ? (
              <div className="text-center py-4">
                <p className="text-gray-400">선수 불러오는 중...</p>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto mt-2"></div>
              </div>
            ) : benchPlayersError ? (
              <div className="text-center py-4 text-red-400">
                {benchPlayersError}
              </div>
            ) : benchPlayers.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                선택된 팀에 벤치 선수가 없습니다.
              </div>
            ) : (
              <>
                {selectedPlayer && (
                  <div className="mb-4 p-3 bg-blue-600 rounded-lg">
                    <div className="text-white text-sm">선택된 선수:</div>
                    <div className="text-white font-semibold">
                      {selectedPlayer.username} ({selectedPlayer.position}) 
                    </div>
                  </div>
                )}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {benchPlayers.map((player) => {
                    // 이미 필드에 있는 선수인지 확인
                    const isPlayerOnField = fieldPlayers.some(fp => fp.playerId === player.id);

                    return (
                      <div
                        key={player.id} 
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedPlayer?.id === player.id
                            ? 'bg-blue-600 text-white'
                            : isPlayerOnField
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-70' // 필드에 있으면 회색
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => !isPlayerOnField && handleBenchPlayerClick(player)}
                        title={isPlayerOnField ? '이 선수는 이미 필드에 있습니다.' : '클릭하여 선택'}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{player.username}</div> 
                            <div className="text-sm opacity-75">{player.position}</div> 
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            {/* 액션 버튼 */}
            <div className="mt-6 space-y-3">
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                선택 해제
              </button>
            </div>
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-3">사용법</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-3">1</div>
              <span>벤치에서 선수를 클릭하여 선택</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-3">2</div>
              <span>필드의 포지션을 클릭하여 선수 배치</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-3">3</div>
              <span>필드 선수를 드래그하여 위치 변경</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoccerSquadBuilder;
