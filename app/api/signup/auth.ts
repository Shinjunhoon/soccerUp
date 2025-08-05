// services/auth.ts
import axios from 'axios';

// axios가 아직 설치되어 있지 않다면 'npm install axios' 또는 'yarn add axios'로 설치해주세요.

// 🚨 백엔드 API 기본 URL을 Vercel rewrites의 source 경로와 동일하게 '/api'로 설정합니다.
// 이렇게 하면 모든 API 호출이 Vercel 프록시를 거치게 됩니다.
const API_BASE_URL = '/api'; 

// --- 타입 정의 ---

// 백엔드의 ApiResponseEntity 구조에 맞춰 타입을 정의합니다.
// 서버의 ResponseEnum (SUCCESS/FAIL)이 프론트엔드에서는 "OK" | "FAIL"로 매핑된다고 가정합니다.
// 만약 서버가 "success" 또는 "fail"을 그대로 보낸다면, result 필드의 타입을 확장하거나 백엔드를 수정해야 합니다.
export interface ApiBackendResponse<T = any> {
    result: "OK" | "FAIL" | "success" | "fail"; // 백엔드의 실제 응답에 맞춰 유연하게 정의
    msg: string;
    data: T; // 제네릭을 사용하여 실제 데이터 타입을 유연하게 처리
}

// 회원가입 요청 시 필요한 데이터의 타입 정의
export interface SignupPayload {
    name: string; // 닉네임
    userId: string; // 아이디
    password: string; // 비밀번호
    age: number;      // 나이 (숫자)
    region: string;   // 거주지역
    email: string;    // 이메일
}

// 회원가입 API 응답 데이터의 타입 정의 (백엔드의 실제 반환 타입에 맞추세요)
export type SignupResponse = ApiBackendResponse<string | object | void>; 

// 아이디 중복 확인 API 응답 데이터의 타입 정의 (data가 boolean)
export type UserIdCheckResponse = ApiBackendResponse<boolean>;

// 이메일 인증 코드 전송 API 응답 데이터의 타입 정의 (data가 void 또는 null)
export type EmailSendCodeResponse = ApiBackendResponse<void>; // 백엔드에서 data 없이 msg만 반환하면 void

// 이메일 인증 코드 확인 API 응답 데이터의 타입 정의 (data가 boolean)
export type EmailVerifyCodeResponse = ApiBackendResponse<boolean>;


// --- API 호출 함수 ---

/**
 * 회원가입 API를 호출하는 함수
 * @param payload { name, userId, password, age, region, email } 형식의 사용자 데이터
 * @returns ApiBackendResponse 타입의 응답
 * @throws Error API 호출 실패 또는 서버 에러 시 예외 발생
 */
export async function signup(payload: SignupPayload): Promise<SignupResponse> {
    try {
        // 🚨 경로를 '/api/register'로 수정합니다.
        // 백엔드 UserController의 @RequestMapping이 없다면 '/register'가 맞겠지만,
        // rewrites를 사용하므로 '/api/register' 형태로 호출하는 것이 일관됩니다.
        // 백엔드 설정에 따라 /api/auth/register 등 추가 경로가 필요할 수 있습니다.
        const response = await axios.post<SignupResponse>(`${API_BASE_URL}/register`, payload);
        
        // 서버 응답이 200 OK이더라도, result 필드가 "FAIL" 또는 "fail"이면 에러로 간주
        if (response.data.result === "FAIL" || response.data.result === "fail") {
            throw new Error(response.data.msg || '회원가입에 실패했습니다.');
        }
        return response.data;
    } catch (error: any) {
        // AxiosError이면서 response가 있는 경우 (HTTP 4xx/5xx 상태 코드 또는 200 OK + result: "FAIL")
        if (axios.isAxiosError(error) && error.response) {
            // 백엔드 ApiResponseEntity 형식으로 msg가 있을 경우
            if (error.response.data && error.response.data.msg) {
                throw new Error(error.response.data.msg);
            }
            // Spring Boot의 @Valid 유효성 검사 실패 등 기본 에러 응답 (message 필드 사용)
            if (error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            }
            // 다른 HTTP 에러 (예: 404 Not Found, 500 Internal Server Error 등)
            throw new Error(`API 요청 오류: ${error.response.status} - ${error.response.statusText}`);
        }
        // 네트워크 오류 또는 서버에 연결할 수 없는 경우
        throw new Error('네트워크 오류 또는 서버에 연결할 수 없습니다.');
    }
}

/**
 * 아이디 중복 확인 API를 호출하는 함수
 * @param userId 확인할 사용자 아이디
 * @returns UserIdCheckResponse 타입의 응답
 * @throws Error API 호출 실패 또는 서버 에러 시 예외 발생
 */
export async function checkUserIdDuplicate(userId: string): Promise<UserIdCheckResponse> {
    try {
        // 🚨 경로를 '/api/checkUser'로 수정합니다.
        const response = await axios.post<UserIdCheckResponse>(`${API_BASE_URL}/checkUser`, { userId });
        
        // 서버 응답이 200 OK이더라도, result 필드가 "FAIL" 또는 "fail"이면 에러로 간주
        if (response.data.result === "FAIL" || response.data.result === "fail") {
            throw new Error(response.data.msg || '아이디 중복 확인에 실패했습니다.');
        }
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.data && error.response.data.msg) {
                throw new Error(error.response.data.msg);
            }
            if (error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error(`API 요청 오류: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error('네트워크 오류 또는 서버에 연결할 수 없습니다.');
    }
}

/**
 * 이메일 인증 코드 전송 API를 호출하는 함수
 * @param email 인증 코드를 받을 이메일 주소
 * @returns EmailSendCodeResponse 타입의 응답
 * @throws Error API 호출 실패 또는 서버 에러 시 예외 발생
 */
export async function sendAuthCodeEmail(email: string): Promise<EmailSendCodeResponse> {
    try {
        // 🚨 백엔드의 EmailController가 @RequestMapping("/api/email")을 사용한다면,
        // 여기에 `/email` 접두사를 추가해야 합니다.
        // 예: `${API_BASE_URL}/email/send-code`
        // 현재는 API_BASE_URL이 '/api'이므로, 최종 경로는 '/api/send-code'가 됩니다.
        // 백엔드에 EmailController의 정확한 @RequestMapping과 메서드별 @PostMapping 경로를 확인하여 수정하세요.
        // 만약 백엔드 EmailController가 @RequestMapping("/api/email")이고 send-code 메서드가 @PostMapping("/send-code")라면,
        // `/${API_BASE_URL}/email/send-code` 가 맞습니다.
        // 현재 코드는 `API_BASE_URL`이 이미 `/api`를 포함하므로, `/email`만 추가하면 됩니다.
        const response = await axios.post<EmailSendCodeResponse>(`${API_BASE_URL}/send-code`, { email });

        // 서버 응답이 200 OK이더라도, result 필드가 "FAIL" 또는 "fail"이면 에러로 간주
        if (response.data.result === "FAIL" || response.data.result === "fail") {
            throw new Error(response.data.msg || '이메일 인증 코드 전송에 실패했습니다.');
        }
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.data && error.response.data.msg) {
                throw new Error(error.response.data.msg);
            }
            if (error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error(`API 요청 오류: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error('네트워크 오류 또는 서버에 연결할 수 없습니다.');
    }
}

/**
 * 이메일 인증 코드 확인 API를 호출하는 함수
 * @param email 인증을 요청했던 이메일 주소
 * @param code 사용자 입력 인증 코드
 * @returns EmailVerifyCodeResponse 타입의 응답 (result, msg, data 필드 포함)
 * @throws Error API 호출 실패 또는 서버 에러 시 예외 발생
 */
export async function verifyAuthCode(email: string, code: string): Promise<EmailVerifyCodeResponse> {
    try {
        // 🚨 백엔드의 EmailController가 @RequestMapping("/api/email")을 사용한다면,
        // 여기에 `/email` 접두사를 추가해야 합니다.
        // 예: `${API_BASE_URL}/email/verify-code`
        const response = await axios.post<EmailVerifyCodeResponse>(`${API_BASE_URL}/verify-code`, { email, code });

        const responseData = response.data;

        // 서버 응답의 result가 "OK" 또는 "success"이고 data가 true일 때만 성공으로 처리
        if ((responseData.result === "OK" || responseData.result === "success") && responseData.data === true) {
            return responseData; // 성공 응답 (result, msg, data) 그대로 반환
        } else {
            // result가 "FAIL" 또는 "fail"이거나 data가 false일 경우 (인증 코드 불일치 등)
            throw new Error(responseData.msg || '이메일 인증 코드 확인에 실패했습니다.');
        }

    } catch (error: any) {
        // HTTP 상태 코드가 200 OK가 아니거나, 네트워크 오류 등 axios 자체 오류가 발생했을 때
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.data && error.response.data.msg) {
                throw new Error(error.response.data.msg);
            }
            if (error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error(`API 요청 오류: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error('네트워크 오류 또는 서버에 연결할 수 없습니다.');
    }
}

// 이메일 로그인 함수는 필요하면 여기에 추가
// export const login = async (credentials: any) => {
//   // ... 기존 로그인 로직 ...
// };