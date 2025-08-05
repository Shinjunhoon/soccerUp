// app/services/login/login.ts

// 로그인 요청 시 필요한 데이터의 타입 정의
interface LoginPayload {
  userId: string;
  password: string;
}

// 수정된 로그인 API 응답 데이터의 타입 정의
// 백엔드 메시지와 더불어 JWT 토큰을 포함시킵니다.
interface LoginResponse {
  message: string;
  token?: string; // JWT 토큰을 저장할 필드 추가 (선택 사항이므로 ? 붙임)
  // user?: { id: string; userId: string; name: string; }; // 필요하다면 사용자 정보도 추가
}

/**
 * 로그인 API를 호출하는 함수
 * @param payload { userId, password } 형식의 사용자 로그인 데이터
 * @returns LoginResponse 타입의 응답
 * @throws Error API 호출 실패 또는 서버 에러 시 예외 발생
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // 백엔드 IP를 직접 사용하는 대신, Next.js rewrites를 통해 프록시될 '/api/login' 경로를 사용합니다.
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  // 응답 본문 (message 등)을 먼저 파싱합니다.
  const data: LoginResponse = await response.json();

  // 응답 헤더에서 JWT 토큰을 추출합니다.
  // 서버가 'Authorization' 헤더에 'Bearer 토큰값' 형식으로 보낸다고 가정합니다.
  const authHeader = response.headers.get('Authorization');
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // 'Bearer ' (7글자) 이후의 문자열을 토큰으로 추출
  }

  if (!response.ok) {
    const errorMessage = data.message || '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.';
    throw new Error(errorMessage);
  }

  // 성공 응답에 추출한 토큰을 포함하여 반환합니다.
  return { ...data, token }; // 기존 data에 token 필드를 추가하여 반환
}