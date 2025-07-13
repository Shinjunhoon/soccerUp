// app/signup/page.tsx
'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
// auth.ts 파일의 경로를 정확히 확인해주세요.
// 만약 services 폴더 바로 아래에 auth.ts가 있다면 아래처럼 변경해야 합니다.
// import { signup, checkUserIdDuplicate, sendAuthCodeEmail, verifyAuthCode } from '../services/auth';
// 현재는 '../services/signup/auth'로 되어있으니 이 경로를 유지합니다.
import { signup, checkUserIdDuplicate, sendAuthCodeEmail, verifyAuthCode } from '../services/signup/auth'; 
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  // 폼 입력 필드 상태 관리
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState(''); // 생년월일 필드 추가
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');

  // UI 관련 상태 관리
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // 전체 폼 메시지

  // 비밀번호 보기/숨기기 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 아이디 중복 확인 관련 상태
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [isUserIdAvailable, setIsUserIdAvailable] = useState(false);
  const [idCheckLoading, setIdCheckLoading] = useState(false);

  // 이메일 인증 관련 상태
  const [emailAuthCode, setEmailAuthCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 최종 인증 완료 여부
  const [emailAuthMessage, setEmailAuthMessage] = useState(''); // 이메일 인증 관련 메시지
  const [isSendingEmail, setIsSendingEmail] = useState(false); // 이메일 코드 전송 중 로딩
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false); // 이메일 코드 확인 중 로딩
  const [showEmailAuthInput, setShowEmailAuthInput] = useState(false); // 인증 코드 입력창 표시 여부
  const [emailAuthTimer, setEmailAuthTimer] = useState(0); // 인증 시간 타이머 (초)
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 타이머 ref

  // 애니메이션 관련 상태
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false); // 컴포넌트 등장 애니메이션

  const router = useRouter(); // Next.js 라우터

  // 컴포넌트 마운트 시 애니메이션 활성화 및 마우스 위치 추적
  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 나이 계산 함수 (생년월일 기반)
  const calculateAge = (birthdateString: string): number | null => {
    if (!birthdateString) return null;
    const birthDate = new Date(birthdateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // 비밀번호 입력 변경 핸들러: 비밀번호 일치 여부 즉시 확인
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  // 비밀번호 확인 입력 변경 핸들러: 비밀번호 일치 여부 즉시 확인
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (password && newConfirmPassword !== password) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  // 아이디 입력 변경 핸들러: 아이디 변경 시 중복 확인 상태 초기화
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    setIdCheckMessage('');
    setIsUserIdAvailable(false);
  };

  // 이메일 입력 변경 핸들러: 이메일 변경 시 인증 상태 초기화 및 타이머 초기화
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsEmailVerified(false);
    setEmailAuthMessage('');
    setShowEmailAuthInput(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setEmailAuthTimer(0);
    }
  };

  // 비밀번호 필드 가시성 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 비밀번호 확인 필드 가시성 토글
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 아이디 중복 확인 버튼 클릭 핸들러
  const handleDuplicateCheck = async () => {
    if (!userId) {
      setIdCheckMessage('아이디를 입력해주세요.');
      setIsUserIdAvailable(false);
      return;
    }
    if (userId.length < 5 || userId.length > 12) {
      setIdCheckMessage('아이디는 5자 이상 12자 이하여야 합니다.');
      setIsUserIdAvailable(false);
      return;
    }

    setIdCheckLoading(true);
    setIdCheckMessage('');

    try {
      // checkUserIdDuplicate 함수는 result, msg, data를 반환한다고 가정
      const result = await checkUserIdDuplicate(userId);
      setIdCheckMessage(result.msg); // 백엔드에서 받은 메시지 표시
      setIsUserIdAvailable(result.data); // 백엔드에서 받은 data(boolean)로 사용 가능 여부 설정
    } catch (error: any) {
      console.error('아이디 중복 확인 에러:', error);
      setIdCheckMessage(error.message || '아이디 중복 확인 중 오류가 발생했습니다.');
      setIsUserIdAvailable(false);
    } finally {
      setIdCheckLoading(false);
    }
  };

  // 이메일 인증 코드 전송 핸들러
  const handleSendEmailAuthCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAuthMessage('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSendingEmail(true);
    setEmailAuthMessage('');
    setIsEmailVerified(false);
    setShowEmailAuthInput(true); // 인증 코드 입력 필드 보이게 함
    setEmailAuthCode(''); // 기존 인증 코드 초기화

    // 기존 타이머가 있다면 클리어
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setEmailAuthTimer(180); // 3분 (180초) 타이머 시작

    try {
      // sendAuthCodeEmail 함수는 result, msg, data를 반환한다고 가정
      const result = await sendAuthCodeEmail(email);
      setEmailAuthMessage(result.msg || '인증 코드가 이메일로 전송되었습니다. 3분 내로 입력해주세요.');

      // 타이머 시작
      timerRef.current = setInterval(() => {
        setEmailAuthTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!); // 타이머 종료
            setEmailAuthMessage('인증 시간이 만료되었습니다. 다시 요청해주세요.');
            setShowEmailAuthInput(false); // 인증 코드 입력 필드 숨김
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('이메일 인증 코드 전송 에러:', error);
      setEmailAuthMessage(error.message || '이메일 전송에 실패했습니다. 다시 시도해주세요.');
      setShowEmailAuthInput(false); // 실패 시 입력 필드 숨김
      if (timerRef.current) clearInterval(timerRef.current); // 에러 발생 시 타이머 중지
      setEmailAuthTimer(0);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 이메일 인증 코드 확인 핸들러 (수정된 부분)
  const handleVerifyEmailAuthCode = async () => {
    if (!emailAuthCode) {
      setEmailAuthMessage('인증 코드를 입력해주세요.');
      return;
    }
    if (emailAuthTimer === 0) {
      setEmailAuthMessage('인증 시간이 만료되었습니다. 코드를 다시 요청해주세요.');
      return;
    }

    setIsVerifyingEmail(true);
    setEmailAuthMessage('');

    try {
      // verifyAuthCode 함수는 성공 시 ApiBackendResponse<boolean>을 반환하고
      // 실패 시 (result: "FAIL" 또는 data: false) Error를 throw 합니다.
      const result = await verifyAuthCode(email, emailAuthCode); 
      
      // verifyAuthCode 함수가 에러를 throw하지 않고 여기까지 왔다면 성공입니다.
      // result.msg는 "이메일 인증에 성공했습니다."와 같은 메시지를 담고 있습니다.
      setIsEmailVerified(true);
      setEmailAuthMessage(result.msg || '이메일 인증이 완료되었습니다!'); // 서버 메시지 사용
      if (timerRef.current) clearInterval(timerRef.current); // 인증 성공 시 타이머 중지
      setEmailAuthTimer(0);
      
    } catch (error: any) {
      console.error('이메일 인증 확인 에러:', error);
      // verifyAuthCode 함수에서 던져진 에러 메시지를 사용합니다.
      setEmailAuthMessage(error.message || '인증 코드 확인 중 오류가 발생했습니다.');
      setIsEmailVerified(false); // 인증 실패
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // 타이머 시간 포맷 (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage(''); // 기존 전체 메시지 초기화

    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 생년월일 유효성 검사 및 나이 계산
    const calculatedAge = calculateAge(birthdate);
    if (!birthdate || calculatedAge === null || calculatedAge < 14) { // 최소 나이 제한 (예: 14세 미만 가입 불가)
        setMessage('올바른 생년월일을 입력하거나, 만 14세 이상이어야 합니다.');
        return;
    }

    // 필수 필드 입력 확인
    if (!name || !userId || !password || !confirmPassword || !region || !email) {
        setMessage('모든 필드를 입력해주세요.');
        return;
    }

    // 아이디 중복 확인 여부
    if (!isUserIdAvailable) {
      setMessage('아이디 중복 확인을 해주세요.');
      return;
    }

    // 이메일 인증 완료 여부
    if (!isEmailVerified) {
      setMessage('이메일 인증을 완료해주세요.');
      return;
    }

    setLoading(true); // 로딩 상태 활성화

    try {
      // 계산된 나이를 signup 페이로드에 포함하여 전송
      // signup 함수는 result, msg, data를 반환한다고 가정
      const result = await signup({ name, userId, password, age: calculatedAge, region, email });

      setMessage(result.msg || '회원가입이 성공적으로 완료되었습니다!'); // 서버 메시지 사용
      
      // 폼 필드 및 관련 상태 초기화 (회원가입 성공 시)
      setName('');
      setUserId('');
      setPassword('');
      setConfirmPassword('');
      setBirthdate(''); 
      setRegion('');
      setEmail('');
      setEmailAuthCode('');
      setPasswordMatchError(false);
      setIdCheckMessage('');
      setIsUserIdAvailable(false);
      setIsEmailVerified(false);
      setEmailAuthMessage('');
      setShowEmailAuthInput(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setEmailAuthTimer(0);

      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      console.error('회원가입 에러:', error);
      setMessage(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false); // 로딩 상태 비활성화
    }
  };

  // 폼 제출 버튼 활성화/비활성화 조건
  const calculatedAgeForValidation = calculateAge(birthdate);
  const isFormValid = name && userId && password && confirmPassword && !passwordMatchError &&
                      birthdate && calculatedAgeForValidation !== null && calculatedAgeForValidation >= 14 && // 생년월일과 최소 나이 검증
                      region && email && isUserIdAvailable && isEmailVerified;

  // 거주지역 옵션 (예시)
  const regions = [
    { value: '', label: '지역 선택' },
    { value: 'SEOUL', label: '서울' },
    { value: 'BUSAN', label: '부산' },
    { value: 'DAEGU', label: '대구' },
    { value: 'INCHEON', label: '인천' },
    { value: 'GWANGJU', label: '광주' },
    { value: 'DAEJEON', label: '대전' },
    { value: 'ULSAN', label: '울산' },
    { value: 'SEJONG', label: '세종' },
    { value: 'GYEONGGI', label: '경기' },
    { value: 'GANGWON', label: '강원' },
    { value: 'CHUNGBUK', label: '충북' },
    { value: 'CHUNGNAM', label: '충남' },
    { value: 'JEONBUK', label: '전북' },
    { value: 'JEONNAM', label: '전남' },
    { value: 'GYEONGBUK', label: '경북' },
    { value: 'GYEONGNAM', label: '경남' },
    { value: 'JEJU', label: '제주' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Gradient Background */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(139, 92, 246, 0.3) 0%,
            rgba(59, 130, 246, 0.2) 25%,
            rgba(16, 185, 129, 0.1) 50%,
            rgba(0, 0, 0, 0.95) 100%)`
        }}
      />

      {/* Animated Mesh Background */}
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d="M0,0 Q50,20 100,0 L100,100 Q50,80 0,100 Z" fill="url(#grad1)" className="animate-pulse" />
        </svg>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 shadow-2xl">
                <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h1 className="text-3xl font-bold text-white">NEXUS</h1>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              새로운 경험의<br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                시작점
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
              혁신적인 플랫폼에서 여러분의 아이디어를 현실로 만들어보세요
            </p>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className={`w-full max-w-md transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            {/* Sign Up Card */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

              {/* Main Card */}
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">회원가입</h3>
                  <p className="text-gray-400">새로운 계정을 생성하여 시작하세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 닉네임 필드 */}
                  <div className="group">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      닉네임
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20"
                        placeholder="예: 축구왕슛돌이"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* 아이디 필드 */}
                  <div className="group">
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
                      아이디
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          id="userId"
                          name="userId"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20"
                          placeholder="5~12자 영문, 숫자"
                          value={userId}
                          onChange={handleUserIdChange}
                          translate="no"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDuplicateCheck}
                        disabled={idCheckLoading || userId.length < 5 || userId.length > 12 || isUserIdAvailable}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition duration-300 ${
                          idCheckLoading || userId.length < 5 || userId.length > 12 || isUserIdAvailable
                            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md'
                        }`}
                      >
                        {idCheckLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          '중복 확인'
                        )}
                      </button>
                    </div>
                    {idCheckMessage && (
                      <p className={`mt-2 text-sm ${
                        isUserIdAvailable ? 'text-emerald-300' : 'text-red-300'
                      }`}>
                        {idCheckMessage}
                      </p>
                    )}
                  </div>

                  {/* 비밀번호 필드 */}
                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        required
                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20"
                        placeholder="비밀번호"
                        value={password}
                        onChange={handlePasswordChange}
                        translate="no"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* 비밀번호 확인 필드 */}
                  <div className="group">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm-password"
                        name="confirm-password"
                        required
                        className={`w-full px-4 py-3 pr-12 bg-white/5 border ${
                          passwordMatchError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-purple-500'
                        } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 transition-all duration-300 group-hover:border-white/20`}
                        placeholder="비밀번호를 다시 입력하세요"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        translate="no"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {passwordMatchError && (
                      <p className="mt-2 text-sm text-red-300">비밀번호가 일치하지 않습니다.</p>
                    )}
                  </div>

                  {/* 생년월일 필드 */}
                  <div className="group">
                    <label htmlFor="birthdate" className="block text-sm font-medium text-gray-300 mb-2">
                      생년월일
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="birthdate"
                        name="birthdate"
                        required
                        // 오늘 날짜를 기준으로 과거 날짜만 선택 가능하도록 max 속성 추가
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20 dark:[color-scheme:dark]"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {birthdate && calculateAge(birthdate) !== null && calculateAge(birthdate)! < 14 && (
                      <p className="mt-2 text-sm text-red-300">만 14세 이상만 가입할 수 있습니다.</p>
                    )}
                  </div>

                  {/* 거주지역 필드 */}
                  <div className="group">
                    <label htmlFor="region" className="block text-sm font-medium text-gray-300 mb-2">
                      거주 지역
                    </label>
                    <div className="relative">
                      <select
                        id="region"
                        name="region"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        {regions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* 이메일 본인인증 필드 */}
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      이메일 본인인증
                    </label>
                    <div className="relative flex items-center space-x-2">
                      <div className="relative flex-grow">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20"
                          placeholder="이메일 주소"
                          value={email}
                          onChange={handleEmailChange}
                          disabled={isEmailVerified} // 이메일 인증 완료 시 입력 비활성화
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendEmailAuthCode}
                        disabled={isSendingEmail || isEmailVerified || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition duration-300 ${
                          isSendingEmail || isEmailVerified || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md'
                        }`}
                      >
                        {isSendingEmail ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          isEmailVerified ? '인증 완료' : '코드 전송'
                        )}
                      </button>
                    </div>
                    {emailAuthMessage && (
                      <p className={`mt-2 text-sm ${
                        isEmailVerified ? 'text-emerald-300' : 'text-red-300'
                      }`}>
                        {emailAuthMessage}
                        {emailAuthTimer > 0 && !isEmailVerified && ` (${formatTime(emailAuthTimer)})`}
                      </p>
                    )}

                    {showEmailAuthInput && !isEmailVerified && (
                      <div className="flex items-center space-x-2 mt-4">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            id="emailAuthCode"
                            name="emailAuthCode"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20"
                            placeholder="인증 코드 입력"
                            value={emailAuthCode}
                            onChange={(e) => setEmailAuthCode(e.target.value)}
                            translate="no"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyEmailAuthCode}
                          disabled={isVerifyingEmail || !emailAuthCode || emailAuthTimer === 0}
                          className={`py-3 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition duration-300 ${
                            isVerifyingEmail || !emailAuthCode || emailAuthTimer === 0
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md'
                          }`}
                        >
                          {isVerifyingEmail ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            '인증 확인'
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 전체 폼 메시지 표시 영역 */}
                  {message && (
                    <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                      message.includes('성공') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
                    }`}>
                      <div className="flex items-center">
                        <span className="text-sm">{message}</span>
                      </div>
                    </div>
                  )}

                  {/* 회원가입 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className={`w-full relative overflow-hidden rounded-xl py-3 px-4 font-semibold transition-all duration-300 ${
                      isFormValid && !loading
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {loading && (
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      )}
                      <span className={loading ? 'opacity-0' : 'opacity-100'}>회원가입</span>
                    </div>
                  </button>

                  <div className="text-center text-gray-400 text-sm mt-6">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/login" className="text-purple-400 hover:underline">
                      로그인
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}