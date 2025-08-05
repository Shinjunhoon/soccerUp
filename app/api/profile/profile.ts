// services/profile/profile.ts

// API의 기본 URL은 이제 Next.js의 프록시 경로를 사용합니다.
// 개발 환경에서는 이 경로가 next.config.js에 의해 실제 백엔드로 프록시됩니다.
// production 환경에서는 Vercel 앱의 자체 도메인으로 요청이 갑니다.
// 즉, 백엔드로 직접 요청을 보내는 대신, Next.js 자체로 요청을 보내는 것처럼 보이게 합니다.
const API_BASE_URL = '/api'; // 모든 백엔드 API 요청은 이제 '/api'로 시작합니다.

// --- 데이터 모델 인터페이스 정의 ---

// 백엔드 `TeamResponseJoinUrl` DTO에 해당하는 인터페이스
export interface Team {
  id: number;
  name: string;
  inviteLink: string;
  createdAt: string; // ISO 8601 형식 문자열
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

// 백엔드 에러 응답 인터페이스
export interface ApiErrorResponse {
  success: boolean;
  status: number;
  message?: string; // 백엔드 응답에 따라 message 또는 errorMsg 둘 중 하나만 있을 수 있음
  errorMsg?: string;
  errorCode?: string;
  path?: string;
  timestamp?: string;
}

// ⭐ 백엔드 `searchUser` API의 `data` 객체 응답 구조 ⭐
// 이 인터페이스는 백엔드 `UserGetResponseDTO`의 JSON 직렬화 결과와 정확히 일치해야 합니다.
interface BackendUserProfileResponseData {
    id: number;
    userId: string | null; // 백엔드 응답의 userId
    password: null; // 백엔드 응답의 password (보안상 프론트엔드 UserProfile에는 매핑하지 않음)
    name: string; // 백엔드 응답의 name
    email: string;
    age: number;
    region: string; // 백엔드 응답의 region
    teamResponseJoinUrlList?: Team[]; // 백엔드 응답의 팀 목록 필드
}

// ⭐ AuthError 클래스 정의: 인증 관련 오류를 나타내기 위함 ⭐
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}


// --- 헬퍼 함수 ---

/**
 * JWT 토큰을 가져오는 헬퍼 함수 (클라이언트 환경에서만 localStorage 사용).
 */
function getAuthTokenForClientOnlyCall(): string | undefined {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || undefined;
  }
  return undefined;
}

/**
 * API 응답이 실패했을 때 에러를 처리하는 헬퍼 함수.
 * 백엔드에서 제공하는 message 또는 errorMsg 필드를 사용하여 사용자에게 친화적인 메시지를 전달합니다.
 * ⭐ 이제 logoutCallback과 redirectCallback은 handleApiError에서 직접 호출되지 않습니다. ⭐
 * ⭐ 인증 오류 시 AuthError만 던집니다. ⭐
 */
async function handleApiError(
  response: Response,
): Promise<never> { // 더 이상 콜백을 받지 않습니다.
  let errorData: ApiErrorResponse | null = null;
  try {
    errorData = await response.json();
  } catch (e) {
    console.error('API 응답 JSON 파싱 실패:', e);
    throw new Error(`API 응답 처리 중 오류 발생: ${response.status} ${response.statusText || '알 수 없는 오류'}`);
  }

  // 백엔드에서 제공하는 메시지를 가장 우선시합니다.
  const backendMessage = errorData?.errorMsg || errorData?.message;
  const finalMessage = backendMessage || response.statusText || '알 수 없는 오류가 발생했습니다.';

  console.error(`API Error (${response.status}): ${finalMessage}`, errorData);

  switch (response.status) {
    case 401:
    case 403: // 401 또는 403 에러 발생 시 AuthError 던지기
      // ⭐ logoutCallback과 redirectCallback 호출 로직 제거 ⭐
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

// --- API 호출 함수 (handleApiError 호출 방식 변경) ---

// 이제 각 API 함수는 logoutCallback과 redirectCallback을 전달하지 않습니다.

export async function getTeams(): Promise<Team[]> {
  const token = getAuthTokenForClientOnlyCall();
  if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
  const headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  // API_BASE_URL 사용 (이제 '/api')
  const res = await fetch(`${API_BASE_URL}/searchTeam`, { headers: headers, cache: 'no-store' });

  if (!res.ok) {
    await handleApiError(res);
  }

  const result = await res.json();
  if (result.result === "success") {
    return result.data as Team[];
  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`);
  }
}

export async function getPlayersByTeamId(teamId: string): Promise<Player[]> {
  if (!teamId) return [];
  const token = getAuthTokenForClientOnlyCall();
  if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
  const headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  // API_BASE_URL 사용 (이제 '/api')
  const res = await fetch(`${API_BASE_URL}/players/${teamId}`, { headers: headers, cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(`No players found for teamId: ${teamId}. Returning empty array.`);
      return [];
    }
    await handleApiError(res);
  }

  const result = await res.json();
  if (result.result === "success") {
    return result.data as Player[];
  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`);
  }
}

export async function getJoinRequestsByTeamId(teamId: string): Promise<JoinRequest[]> {
    if (!teamId) return [];
    const token = getAuthTokenForClientOnlyCall();
    if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
    const headers: HeadersInit = { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${token}` };
    const body = new URLSearchParams();
    body.append('teamId', teamId);
    // API_BASE_URL 사용 (이제 '/api')
    const res = await fetch(`${API_BASE_URL}/searchRequester`, { method: 'POST', headers: headers, body: body, cache: 'no-store' });

    if (!res.ok) {
        if (res.status === 404) {
            console.warn(`No join requests found for teamId: ${teamId}. Returning empty array.`);
            return [];
        }
        await handleApiError(res);
    }
    const result = await res.json();
    if (result.result === "success") {
        return result.data as JoinRequest[];
    } else {
        throw new Error(`${result.msg || '알 수 없는 오류'}`);
    }
}

export async function acceptJoinRequest(teamId: number, userId: number): Promise<any> {
    console.log(`API 호출: 팀 ID ${teamId}에 사용자 ID ${userId} 수락`);
    const token = getAuthTokenForClientOnlyCall();
    if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
    const requestBody = { teamId: teamId, userId: userId };
    // API_BASE_URL 사용 (이제 '/api')
    const response = await fetch(`${API_BASE_URL}/acceptedTeam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        await handleApiError(response);
    }
    const result = await response.json();
    if (result.result === "success") {
      return result.data;
    } else {
      throw new Error(`${result.msg || '알 수 없는 오류'}`);
    }
}

export async function rejectJoinRequest(userId: number): Promise<any> {
    console.log(`API 호출: 가입 요청 ${userId} 거절`);
    const token = getAuthTokenForClientOnlyCall();
    if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
    // API_BASE_URL 사용 (이제 '/api')
    const response = await fetch(`${API_BASE_URL}/rejectedTeam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId: userId })
    });

    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    if (result.result === "success") {
      return result.data;
    } else {
      throw new Error(`${result.msg || '알 수 없는 오류'}`);
    }
}

export async function getTeamMembersByTeamId(teamId: string): Promise<TeamMember[]> {
  if (!teamId) return [];
  const token = getAuthTokenForClientOnlyCall();
  if (!token) { throw new Error('인증 토큰이 없습니다. 로그인해주세요.'); }
  const headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  // API_BASE_URL 사용 (이제 '/api')
  const res = await fetch(`${API_BASE_URL}/teamMember/${teamId}`, { headers: headers, cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(`No team members found for teamId: ${teamId}. Returning empty array.`);
      return [];
    }
    await handleApiError(res);
  }
  const result = await res.json();
  if (result.result === "success") {
    return result.data as TeamMember[];
  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`);
  }
}

/**
 * 특정 팀의 모든 스쿼드 목록을 가져옵니다.
 */
export const getSquadsByTeamId = async (teamId: string): Promise<SquadResponse[]> => {
    const token = getAuthTokenForClientOnlyCall();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
    }

    // API_BASE_URL 사용 (이제 '/api')
    const response = await fetch(`${API_BASE_URL}/team/${teamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (response.status === 404) {
      console.warn(`팀 ${teamId}에 저장된 스쿼드가 없습니다 (404 Not Found). 빈 배열을 반환합니다.`);
      return [];
    }

    if (!response.ok) {
      await handleApiError(response);
    }

    const result = await response.json();
    if (result.result === "success") {
      return result.data as SquadResponse[];
    } else {
      throw new Error(`${result.msg || '알 수 없는 오류'}`);
    }
  };

/**
 * 특정 팀의 특정 포메이션 스쿼드를 조회합니다.
 */
export const getSquadByTeamIdAndFormationType = async (teamId: number, formationType: string): Promise<SquadResponse | null> => {
  const token = getAuthTokenForClientOnlyCall();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  // API_BASE_URL 사용 (이제 '/api')
  const res = await fetch(`${API_BASE_URL}/team/${teamId}/byFormation?formationType=${formationType}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store'
  });

  if (res.status === 404) {
    console.log(`팀 ${teamId}의 ${formationType} 스쿼드를 찾을 수 없습니다 (404).`);
    return null;
  }

  if (!res.ok) {
    await handleApiError(res);
  }

  const result = await res.json();
  if (result.result === "success") {
    return result.data as SquadResponse;
  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`);
  }
};

/**
 * 스쿼드를 저장하거나 업데이트합니다.
 */
export const saveOrUpdateSquad = async (squadData: SquadRequestDto): Promise<SquadResponse> => {
  const token = getAuthTokenForClientOnlyCall();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  // API_BASE_URL 사용 (이제 '/api')
  const response = await fetch(`${API_BASE_URL}/saveOrUpdate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(squadData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await response.json();
  if (result.result === "success") {
    return result.data as SquadResponse;
  } else {
      throw new Error(`${result.msg || '알 수 없는 오류'}`);
  }
};

/**
 * 현재 로그인된 사용자의 프로필 정보를 가져옵니다.
 */
export async function getUserProfile(): Promise<UserProfile> {
  const token = getAuthTokenForClientOnlyCall();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  // API_BASE_URL 사용 (이제 '/api')
  const res = await fetch(`${API_BASE_URL}/searchUser`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store' // 항상 최신 데이터를 가져오도록 설정
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  const result = await res.json();

  if (result.result === "success") {
    // 백엔드 응답 데이터의 정확한 타입을 지정합니다.
    const backendData: BackendUserProfileResponseData = result.data;

    // ⭐ 백엔드 응답 필드를 프론트엔드 `UserProfile` 인터페이스에 맞춰 변환합니다. ⭐
    const userProfile: UserProfile = {
      id: backendData.id,
      // 'name' 필드를 `username`으로 사용합니다. `userId`가 아닌 `name`을 사용하는 것이 일반적입니다.
      username: backendData.name || 'Unknown User', // `name`이 없을 경우 대비
      email: backendData.email,
      age: backendData.age,
      region: backendData.region, // 백엔드 응답에 있다면 포함
      // 'teamResponseJoinUrlList'를 `createdTeams`로 매핑합니다.
      createdTeams: backendData.teamResponseJoinUrlList || [], // 리스트가 없으면 빈 배열
      // 백엔드에서 position, skillLevel 등 다른 필드가 온다면 여기에 추가하세요.
      // position: backendData.position,
      // skillLevel: backendData.skillLevel,
    };
    return userProfile;

  } else {
    throw new Error(`${result.msg || '알 수 없는 오류'}`);
  }
}

// ⭐ 새로 추가될 팀 삭제 API 함수
export async function deleteTeam(teamId: number): Promise<void> {
  const token = getAuthTokenForClientOnlyCall();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  // API_BASE_URL 사용 (이제 '/api')
  const res = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await handleApiError(res);
  }
}