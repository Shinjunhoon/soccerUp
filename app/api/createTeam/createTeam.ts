// lib/api.js 파일 전체 내용 (수정된 부분만 강조)

/**
 * 새로운 팀을 생성하는 API 함수.
 * 실제 백엔드 API와 통신하여 팀을 생성하고 서버 응답을 처리합니다.
 * JWT 토큰을 Authorization 헤더에 포함하여 보냅니다.
 *
 * @param {object} teamData - 생성할 팀의 상세 정보 객체.
 * {
 * teamName: string,
 * region: string, // 예: "GYEONGGI-ICHON" 또는 "SEOUL"
 * averageAge: string, // 예: "TWENTIES" (백엔드 Enum 이름과 일치)
 * teamType: string,   // 예: "CLUB" (백엔드 Enum 이름과 일치)
 * skillLevel: string, // 예: "INTERMEDIATE" (백엔드 Enum 이름과 일치)
 * teamIntro: string (optional)
 * }
 * @returns {Promise<object>} 생성된 팀 정보를 담은 Promise 객체. (서버의 TeamResponseJoinUrl 형식)
 * @throws {Error} API 호출 실패 시 에러 발생.
 */
// ⭐ userId 인자를 제거했습니다. 서버에서 JWT 토큰을 통해 사용자 ID를 추출합니다.
export const createTeam = async (teamData: object): Promise<object> => {
  const token = localStorage.getItem('accessToken'); 

  if (!token) {
    console.error('Authentication token is missing. Please log in.');
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  try {
    // ⭐ 중요 수정: Next.js rewrites 설정을 사용하도록 엔드포인트 변경
    const response = await fetch(`/api/creatTeam`, { // 🚨 '/api' 접두사를 사용하도록 변경
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Bearer 토큰을 Authorization 헤더에 포함
      },
      body: JSON.stringify(teamData), // 팀 데이터를 JSON 본문으로 전송
    });

    if (!response.ok) {
      let errorMessage = '팀 생성에 실패했습니다.';
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = `서버 응답 오류: ${response.status} ${response.statusText}`;
      }
      
      if (response.status === 401) {
        errorMessage = '인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.';
      }
      
      console.error(`API Error: ${errorMessage}`, response);
      throw new Error(errorMessage);
    }

    const apiResponseEntity = await response.json(); 
    
    // ⭐ 가장 중요한 수정: 서버 응답의 'data' 필드에 실제 팀 정보가 들어있으므로, 'data' 필드를 반환합니다.
    if (apiResponseEntity && apiResponseEntity.data) {
        return apiResponseEntity.data; 
    } else {
        console.error("Server returned an empty or invalid 'data' field in ApiResponseEntity for team creation.", apiResponseEntity);
        throw new Error('서버 응답에서 유효한 팀 데이터를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error("Error creating team:", error);
    throw error; 
  }
};