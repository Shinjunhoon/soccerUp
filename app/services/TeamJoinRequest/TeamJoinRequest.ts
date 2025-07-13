// lib/api.ts
// 🚨 파일 확장자를 .ts로 변경해주세요!

// 모든 API 호출의 기본 URL
const BASE_URL = 'http://13.49.74.224:8080'; // 🚨 백엔드 주소를 확인해주세요.

// =========================================================
// ✅ 기존 인터페이스들 (재확인)
// 이전에 정의한 Team, Player 인터페이스가 있다면 여기에 포함시켜야 합니다.
// 누락될 경우 컴파일 에러 발생 가능
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

// =========================================================
// ✅ 여기에 JoinRequest 인터페이스를 추가합니다.
export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  requestDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  residence?: string;           // 이 필드들과 함께
  preferredPosition?: 'FW' | 'MF' | 'DF' | 'GK' | 'ETC';
  experienceLevel?: string;
  selfIntroduction?: string;

  message?: string; // <-- 이 필드가 정확히 있는지 확인
}


// =========================================================
// JWT 토큰을 가져오는 헬퍼 함수 (클라이언트 환경에서만 localStorage 사용).
// 이 함수는 클라이언트 컴포넌트에서 호출될 때만 의미가 있습니다.
// 서버 측에서는 (typeof window === 'undefined'일 때) 토큰을 가져오지 않습니다.
function getAuthTokenForClientOnlyCall(): string | undefined {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || undefined;
  }
  return undefined;
}


/**
 * 새로운 팀을 생성하는 API 함수.
 * JWT 토큰을 Authorization 헤더에 포함하여 보냅니다.
 *
 * @param {string} teamName - 생성할 팀의 이름.
 * @returns {Promise<Object>} 생성된 팀 정보를 담은 Promise 객체. (서버의 TeamResponseJoinUrl 형식)
 * @throws {Error} API 호출 실패 시 에러 발생.
 */
export const createTeam = async (teamName: string): Promise<object> => {
  const token = getAuthTokenForClientOnlyCall(); // localStorage 접근 헬퍼 함수 사용

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  try {
    const response = await fetch(`${BASE_URL}/creatTeam`, { // `creatTeam` 엔드포인트
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ teamName: teamName }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || '팀 생성에 실패했습니다.');
    }

    const apiResponse = await response.json();

    if (apiResponse && apiResponse.data) {
        // 반환되는 객체의 타입은 서버 응답에 따라 더 구체적으로 명시할 수 있습니다.
        // 예: return apiResponse.data as TeamResponseJoinUrl;
        return apiResponse.data;
    } else {
        throw new Error('서버 응답에서 유효한 팀 데이터를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};


/**
 * 초대 코드를 사용하여 팀 상세 정보를 조회하는 API 함수.
 *
 * @param {string} code - 팀 초대 코드 (UUID).
 * @returns {Promise<Object>} 팀 상세 정보 (예: { id: ..., name: ..., inviteLink: ..., createdAt: ... }).
 * @throws {Error} API 호출 실패 시 에러 발생.
 */
export const getTeamDetailsByInviteCode = async (code: string): Promise<object> => {
  if (!code) {
    throw new Error('초대 코드가 제공되지 않았습니다.');
  }

  try {
    const response = await fetch(`${BASE_URL}/invite/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAuthTokenForClientOnlyCall()}`, // 필요하다면 토큰 추가
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '팀 정보를 불러오는 데 실패했습니다.');
    }

    const apiResponse = await response.json();

    if (apiResponse && apiResponse.data) {
      // 반환되는 객체의 타입은 서버 응답에 따라 더 구체적으로 명시할 수 있습니다.
      // 예: return apiResponse.data as TeamDetails;
      return apiResponse.data;
    } else {
      throw new Error(apiResponse.message || '유효한 팀 데이터를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error("Error fetching team details by invite code:", error);
    throw error;
  }
};


/**
 * 팀 가입을 요청하는 API 함수.
 *
 * @param {object} joinRequestData - 가입 요청 데이터 (teamId, position, region, skillLevel, teamIntro, teamType).
 * @returns {Promise<void>} 성공 시 아무것도 반환하지 않음.
 * @throws {Error} API 호출 실패 시 에러 발생.
 */
export const joinTeam = async (
  joinRequestData: { // 이 인터페이스도 별도로 export하는 것이 좋습니다.
      teamId: number;
      position: string;
      region: string;
      skillLevel: string;
      teamIntro?: string; // 자기소개
      teamType?: string;  // 이 필드는 가입 요청에 일반적으로 사용되지 않을 수 있습니다.
  }
): Promise<void> => {
const jwtToken = getAuthTokenForClientOnlyCall();

if (!jwtToken) {
  throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
}

try {
  const response = await fetch(`${BASE_URL}/joinTeam`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      teamId: joinRequestData.teamId,
      position: joinRequestData.position,
      region: joinRequestData.region,
      skillLevel: joinRequestData.skillLevel,
      // 서버의 필드 이름이 teamIntro라면 selfIntroduction 대신 teamIntro 사용
      teamIntro: joinRequestData.teamIntro, // 백엔드의 필드명과 일치시켜야 함
      // teamType은 가입 요청에 흔히 사용되는 필드는 아니니 백엔드에서 필요하다면 유지
      teamType: joinRequestData.teamType, 
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || '팀 가입 요청에 실패했습니다.');
  }

  const apiResponse = await response.json();

  if (apiResponse && apiResponse.result === "success") {
      return; 
  } else if (apiResponse && apiResponse.msg) {
      throw new Error(apiResponse.msg);
  } else {
      throw new Error('팀 가입 요청 처리 후 예상치 못한 응답이 발생했습니다.');
  }

} catch (error) {
  console.error("Error joining team:", error);
  throw error;
}
};

// =========================================================
// ✅ getPlayersByTeamId 함수 (이전에 제공된 코드에 있다면 유지)
// export async function getPlayersByTeamId(teamId: string): Promise<Player[]> { /* ... */ }

// ✅ getJoinRequestsByTeamId 함수 (이전에 제공된 코드에 있다면 유지)
// export async function getJoinRequestsByTeamId(teamId: string): Promise<JoinRequest[]> { /* ... */ }