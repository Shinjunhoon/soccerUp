// lib/api.ts
// 이 파일 자체에는 'use client'를 붙이지 않습니다.
// 모든 API 호출 함수와 관련 인터페이스를 통합합니다.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://13.49.74.224:8080';

// ======================================================
// 데이터 모델 인터페이스 정의
// ======================================================

export interface Team {
  id: number;
  name: string;
  inviteLink: string;
  createdAt: string;
}

export interface Player {
  id: string; // 또는 number, 백엔드 응답에 따라 다름
  name: string;
  position: 'FW' | 'MF' | 'DF' | 'GK'; // 명확한 포지션 값만 허용
  backNumber?: number; // 선택 사항
  rating?: number;     // 선택 사항
}

export interface SquadPositionRequestDto {
    fieldPositionCode: string; // 예: 'gk', 'cb1'
    teamMemberId: number | null; // 백엔드 TeamMember의 ID
}

export interface SquadRequestDto {
    teamId: number; // 백엔드 Team의 ID (selectedTeamId는 string이므로 number로 변환 필요)
    formationType: string; // 예: '4-3-3'
    positionRequestDtoList: SquadPositionRequestDto[]; // 포지션 목록
}

export interface SquadPositionResponse {
    id: number; // SquadPosition 엔티티의 ID (백엔드에서 자동 생성)
    fieldPositionCode: string; // 예: 'gk', 'cb1'
    teamMemberId: number | null;
    playerName: string | null; // 백엔드에서 조인하여 제공
}

export interface SquadResponse {
    id: number; // Squad 엔티티의 ID
    teamId: number;
    formationType: string;
    isDefault: boolean;
    createdAt: string; // LocalDateTime은 ISO 8601 문자열로 직렬화될 것임
    updatedAt: string; // LocalDateTime은 ISO 8601 문자열로 직렬화될 것임
    positions: SquadPositionResponse[]; // SquadPositionResponse 배열
}

export interface JoinRequest {
    id: number;
    name: string;
    position: 'FW' | 'MF' | 'DF' | 'GK';
    province: string;
    cityCode: string;
    skillLevel: string;
    teamIntro: string;
    requestStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface TeamMember {
  id: number; // 백엔드 응답의 id (사용자 ID)
  username: string; // 백엔드 응답의 username
  position: 'FW' | 'MF' | 'DF' | 'GK'; // 백엔드 응답의 position
}

// ⭐ 사용자 프로필 인터페이스 정의 ⭐
// 백엔드 응답의 'data' 객체와 매핑됩니다.
export interface UserProfile {
  id: number;
  username: string; // 백엔드의 'name' 또는 'userId' 필드를 여기에 매핑
  email: string;
  age?: number; // 선택 사항
  position?: 'FW' | 'MF' | 'DF' | 'GK' | 'ETC'; // 백엔드 응답에 있다면 추가
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO'; // 백엔드 응답에 있다면 추가
  createdTeams?: Team[]; // 백엔드의 'teamResponseJoinUrlList' 필드를 여기에 매핑
  region?: string; // 백엔드 응답에 있다면 추가
}

// ⭐ 백엔드 에러 응답 인터페이스 ⭐
export interface ApiErrorResponse {
  success: boolean;
  status: number;
  message?: string; // 백엔드 응답에 따라 message 또는 errorMsg 둘 중 하나만 있을 수 있음
  errorMsg?: string;
  errorCode?: string;
  path?: string;
  timestamp?: string;
}

// ⭐ AuthError 클래스 정의: 인증 관련 오류를 나타내기 위함 (export 추가) ⭐
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}


/**
 * JWT 토큰을 가져오는 헬퍼 함수 (클라이언트 환경에서만 localStorage 사용).
 */
function getAuthTokenForClientOnlyCall(): string | undefined {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || undefined;
  }
  return undefined;
}

// ⭐ API 에러 처리 헬퍼 함수 ⭐
/**
 * API 응답이 실패했을 때 에러를 처리하는 헬퍼 함수.
 * 백엔드에서 제공하는 message 또는 errorMsg 필드를 사용하여 사용자에게 친화적인 메시지를 전달합니다.
 * @param response - Fetch API 응답 객체.
 * @returns Promise<never> - 항상 에러를 throw하므로 반환 타입은 never.
 */
async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiErrorResponse | null = null;
  try {
    errorData = await response.json();
  } catch (e) {
    console.error('API 응답 JSON 파싱 실패:', e);
    throw new Error(`API 응답 처리 중 오류 발생: ${response.status} ${response.statusText || '알 수 없는 오류'}`);
  }

  // 백엔드에서 'errorMsg' 또는 'message' 필드를 우선적으로 사용
  // 백엔드에서 제공하는 메시지를 가장 우선시합니다.
  const backendMessage = errorData?.errorMsg || errorData?.message;
  // Fallback: 백엔드 메시지가 없으면 HTTP 상태 텍스트 사용, 그것도 없으면 기본 메시지
  const finalMessage = backendMessage || response.statusText || '알 수 없는 오류가 발생했습니다.';

  console.error(`API Error (${response.status}): ${finalMessage}`, errorData); // 상세 로그 출력

  switch (response.status) {
    case 401:
    case 403: // ⭐ 401 또는 403 에러 발생 시 AuthError 던지기 ⭐
      throw new AuthError(`세션이 만료되었거나 권한이 없습니다. ${finalMessage}`);
    case 400:
      throw new Error(`요청에 문제가 발생했습니다. ${finalMessage}`);
    case 404:
      throw new Error(`요청하신 데이터를 찾을 수 없습니다. ${finalMessage}`);
    case 500:
      throw new Error(`서버에 문제가 발생했습니다. ${finalMessage}`);
    default:
      throw new Error(`API 호출 중 오류 발생 (${response.status}): ${finalMessage}`);
  }
}

// ======================================================
// API 함수 통합 (수정된 스쿼드 관련 함수 포함)
// ======================================================

export async function getTeams(): Promise<Team[]> {
  const token = getAuthTokenForClientOnlyCall();
  if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); } // 인증 토큰 자체가 없을 때
  const headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  const res = await fetch(`${API_BASE_URL}/searchTeam`, { headers: headers, cache: 'no-store' });

  if (!res.ok) {
    await handleApiError(res); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
  }

  const result = await res.json();
  // 백엔드 응답의 'success' (또는 'result' 필드가 "success")를 확인
  if (result.result === "success") {
    return result.data as Team[];
  } else {
    // 백엔드에서 success: false이면서 message가 오는 경우
    throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
  }
}

export async function getPlayersByTeamId(teamId: string): Promise<Player[]> {
  if (!teamId) return [];
  const token = getAuthTokenForClientOnlyCall();
  if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
  const headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  const res = await fetch(`${API_BASE_URL}/players/${teamId}`, { headers: headers, cache: 'no-store' });

  if (!res.ok) {
    // 특정 API에서 404를 데이터 없음으로 처리하는 경우:
    if (res.status === 404) {
      console.warn(`No players found for teamId: ${teamId}. Returning empty array.`);
      return [];
    }
    await handleApiError(res); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
  }

  const result = await res.json();
  if (result.result === "success") {
    return result.data as Player[];
  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
  }
}

export async function getJoinRequestsByTeamId(teamId: string): Promise<JoinRequest[]> {
    if (!teamId) return [];
    const token = getAuthTokenForClientOnlyCall();
    if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
    const headers: HeadersInit = { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${token}` };
    const body = new URLSearchParams();
    body.append('teamId', teamId);
    const res = await fetch(`${API_BASE_URL}/searchRequester`, { method: 'POST', headers: headers, body: body, cache: 'no-store' });

    if (!res.ok) {
        // 특정 API에서 404를 데이터 없음으로 처리하는 경우:
        if (res.status === 404) {
            console.warn(`No join requests found for teamId: ${teamId}. Returning empty array.`);
            return [];
        }
        await handleApiError(res); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
    }
    const result = await res.json();
    if (result.result === "success") {
        return result.data as JoinRequest[];
    } else {
        throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
    }
}

export async function acceptJoinRequest(teamId: number, userId: number): Promise<any> {
    console.log(`API 호출: 팀 ID ${teamId}에 사용자 ID ${userId} 수락`);
    const token = getAuthTokenForClientOnlyCall();
    if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
    const requestBody = { teamId: teamId, userId: userId };
    const response = await fetch(`${API_BASE_URL}/acceptedTeam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        await handleApiError(response); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
    }
    // 백엔드 응답이 success 필드를 가진다고 가정
    const result = await response.json();
    if (result.result === "success") {
      return result.data; // 또는 필요한 경우 특정 타입으로 캐스팅
    } else {
      // 백엔드에서 success: false이면서 message가 오는 경우
      throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
    }
}

export async function rejectJoinRequest(userId: number): Promise<any> {
    console.log(`API 호출: 가입 요청 ${userId} 거절`);
    const token = getAuthTokenForClientOnlyCall();
    if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
    const response = await fetch(`${API_BASE_URL}/rejectedTeam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId: userId })
    });

    if (!response.ok) {
      await handleApiError(response); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
    }
    const result = await response.json();
    if (result.result === "success") {
      return result.data;
    } else {
      throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
    }
}

export async function getTeamMembersByTeamId(teamId: string): Promise<TeamMember[]> {
  if (!teamId) return [];
  const token = getAuthTokenForClientOnlyCall();
  if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
  const headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  const res = await fetch(`${API_BASE_URL}/teamMember/${teamId}`, { headers: headers, cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(`No team members found for teamId: ${teamId}. Returning empty array.`);
      return [];
    }
    await handleApiError(res); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
  }
  const result = await res.json();
  if (result.result === "success") {
    return result.data as TeamMember[];
  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
  }
}

/**
 * (선택 사항) 특정 팀의 모든 스쿼드 목록을 가져옵니다.
 * 이 함수는 스쿼드 빌더의 주 로딩 로직에서는 직접 사용되지 않습니다.
 * 대신, `getSquadByTeamIdAndFormationType`이 사용됩니다.
 * 예: GET /api/squads/team/{teamId}
 * @param {string} teamId - 팀 ID
 * @returns {Promise<SquadResponse[]>} 스쿼드 배열
 */
export const getSquadsByTeamId = async (teamId: string): Promise<SquadResponse[]> => {
    const token = getAuthTokenForClientOnlyCall();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
    }

    const response = await fetch(`${API_BASE_URL}/team/${teamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store' // 추가
    });

    // 404 Not Found일 경우 빈 배열 반환
    if (response.status === 404) {
      console.warn(`팀 ${teamId}에 저장된 스쿼드가 없습니다 (404 Not Found). 빈 배열을 반환합니다.`);
      return [];
    }

    if (!response.ok) {
      await handleApiError(response); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
    }

    const result = await response.json();
    if (result.result === "success") {
      return result.data as SquadResponse[];
    } else {
      throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
    }
  };

/**
 * 특정 팀의 특정 포메이션 스쿼드를 조회합니다.
 * 백엔드 API: GET /api/squads/team/{teamId}/byFormation?formationType={formationType}
 * @param {number} teamId - 팀 ID
 * @param {string} formationType - 조회할 포메이션 타입 (예: "4-3-3")
 * @returns {Promise<SquadResponse | null>} 스쿼드 데이터 또는 스쿼드가 없을 경우 null 반환
 * @throws {Error} API 호출 실패 시 에러 발생.
 */
export const getSquadByTeamIdAndFormationType = async (teamId: number, formationType: string): Promise<SquadResponse | null> => {
  const token = getAuthTokenForClientOnlyCall();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  const res = await fetch(`${API_BASE_URL}/team/${teamId}/byFormation?formationType=${formationType}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store'
  });

  if (res.status === 404) {
    // 백엔드에서 스쿼드가 없을 경우 404를 반환하므로, null을 반환하여 프론트에서 빈 상태로 처리하도록 유도
    console.log(`팀 ${teamId}의 ${formationType} 스쿼드를 찾을 수 없습니다 (404).`);
    return null;
  }

  if (!res.ok) {
    await handleApiError(res); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
  }

  const result = await res.json();
  if (result.result === "success") {
    return result.data as SquadResponse;
  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
  }
};

/**
 * 스쿼드를 저장하거나 업데이트합니다.
 * 백엔드 API: POST /api/squads/saveOrUpdate
 * (기존 saveSquad 및 updateSquad 기능 통합)
 * @param {SquadRequestDto} squadData - 저장/업데이트할 스쿼드 데이터 (teamId, formationType, positionRequestDtoList 포함)
 * @returns {Promise<SquadResponse>} 생성 또는 업데이트된 스쿼드 응답
 * @throws {Error} API 호출 실패 시 에러 발생.
 */
export const saveOrUpdateSquad = async (squadData: SquadRequestDto): Promise<SquadResponse> => {
  const token = getAuthTokenForClientOnlyCall();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  const response = await fetch(`${API_BASE_URL}/saveOrUpdate`, { // 통합된 엔드포인트
    method: 'POST', // POST는 생성과 업데이트 모두에 적합
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(squadData),
  });

  if (!response.ok) {
    await handleApiError(response); // ⭐ 에러 처리 헬퍼 함수 호출 ⭐
  }

  const result = await response.json();
  if (result.result === "success") {
    return result.data as SquadResponse;
  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`); // ✨수정: 순수한 메시지만 던집니다.
  }
};

// 기존 saveSquad 및 updateSquad 함수는 이제 더 이상 필요하지 않습니다. (삭제 또는 주석 처리 권장)
/*
export const saveSquad = async (squadData: SquadRequestDto): Promise<SquadResponse> => {
  // 이 함수는 saveOrUpdateSquad로 대체되었습니다.
  throw new Error('saveSquad 함수는 더 이상 사용되지 않습니다. saveOrUpdateSquad를 사용해주세요.');
};

export const updateSquad = async (squadId: number, squadData: SquadRequestDto): Promise<SquadResponse> => {
  // 이 함수는 saveOrUpdateSquad로 대체되었습니다.
  throw new Error('updateSquad 함수는 더 이상 사용되지 않습니다. saveOrUpdateSquad를 사용해주세요.');
};
*/
