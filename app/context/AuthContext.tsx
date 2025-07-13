// app/context/AuthContext.tsx
'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback, // useCallback 임포트 추가
  ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode'; // 'jwt-decode' 라이브러리 설치 필요: npm install jwt-decode

// JWT 페이로드의 타입을 정의합니다.
// 백엔드에서 토큰에 어떤 필드가 있는지에 따라 수정해야 합니다.
interface MyJwtPayload {
  sub?: string; // 일반적으로 userId 또는 subject
  name?: string; // 닉네임이 'name'으로 들어간다면
  userName?: string; // 닉네임이 'userName'으로 들어간다면
  // 다른 필드들도 있다면 여기에 추가
}

// 인증 컨텍스트 상태의 형태를 정의합니다.
interface AuthContextType {
  userName: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // 초기 토큰 확인을 위한 로딩 상태 추가
}

// 기본값으로 컨텍스트를 생성합니다.
// 타입스크립트에서 undefined를 허용하려면 | undefined를 추가하고,
// 사용하는 곳에서 undefined 체크를 하도록 합니다.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider의 props를 정의합니다.
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기 로딩 상태

  // ⭐ login 함수를 useCallback으로 감싸서 메모이제이션합니다. ⭐
  const login = useCallback((token: string) => {
    localStorage.setItem('accessToken', token);
    try {
      const decodedToken = jwtDecode<MyJwtPayload>(token);
      let extractedUserName: string | null = null;
      if (decodedToken && decodedToken.name) {
        extractedUserName = decodedToken.name;
      } else if (decodedToken && decodedToken.userName) {
        extractedUserName = decodedToken.userName;
      } else if (decodedToken && decodedToken.sub) {
        extractedUserName = decodedToken.sub;
      } else {
        extractedUserName = '사용자';
      }
      setUserName(extractedUserName);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('로그인 후 토큰 디코딩 실패:', error);
      setUserName(null);
      setIsAuthenticated(false);
    }
  }, []); // login 함수는 외부 의존성이 없으므로 빈 배열

  // ⭐ logout 함수를 useCallback으로 감싸서 메모이제이션합니다. ⭐
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUserName(null);
    setIsAuthenticated(false);
  }, []); // logout 함수는 외부 의존성이 없으므로 빈 배열

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const decodedToken = jwtDecode<MyJwtPayload>(token);
          let extractedUserName: string | null = null;

          // 백엔드에서 토큰에 어떤 필드에 닉네임이 담겨 있는지에 따라 선택합니다.
          // 예: claims.put("name", userInfo.name()); => decodedToken.name
          if (decodedToken && decodedToken.name) {
            extractedUserName = decodedToken.name; // ⭐ 'decodedodeToken'을 'decodedToken'으로 수정 ⭐
          } else if (decodedToken && decodedToken.userName) { // 혹시 'userName'이라면
            extractedUserName = decodedToken.userName;
          } else if (decodedToken && decodedToken.sub) { // userId를 닉네임으로 사용한다면
            extractedUserName = decodedToken.sub;
          } else {
            extractedUserName = '사용자'; // 닉네임 필드가 없을 경우 기본값
          }

          setUserName(extractedUserName);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('JWT 토큰 디코딩 실패 또는 토큰이 유효하지 않습니다:', error);
          localStorage.removeItem('accessToken'); // 유효하지 않은 토큰 제거
          setUserName(null);
          setIsAuthenticated(false);
        }
      } else {
        setUserName(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false); // 인증 확인 완료
    };

    // 컴포넌트 마운트 시 한 번 실행하여 기존 토큰을 확인합니다.
    checkAuthStatus();

    // 다른 탭/창에서 localStorage 변경이 발생했을 때 감지합니다.
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너를 정리합니다.
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []); // 빈 의존성 배열은 컴포넌트 마운트 시 한 번만 실행됨을 의미합니다.


  return (
    <AuthContext.Provider
      value={{ userName, login, logout, isAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// AuthContext를 사용하기 위한 사용자 정의 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
};
