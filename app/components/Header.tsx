'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { FaUserCircle } from 'react-icons/fa';
import { useState } from 'react'; // useState 훅을 임포트합니다.

const Header = () => {
  const { userName, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 모바일 메뉴 상태 관리

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsMobileMenuOpen(false); // 로그아웃 시 모바일 메뉴 닫기
  };

  // 'e' 매개변수에 React.MouseEvent<HTMLAnchorElement> 타입을 명시적으로 추가
  const handleFeatureClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('로그인이 필요합니다.');
      router.push('/login');
    } else {
      router.push(path);
      setIsMobileMenuOpen(false); // 메뉴 항목 클릭 시 모바일 메뉴 닫기
    }
  };

  // 모바일 메뉴 토글 함수
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return (
      <header className="w-full bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center">
        {/* 로딩 중 웹사이트 이름: 축구공 이모지와 텍스트 그라데이션 분리 */}
        <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-2xl sm:text-3xl md:text-4xl font-extrabold drop-shadow-lg">
          <span className="text-white mr-2">⚽</span> {/* 축구공 이모지에 흰색 적용 */}
          <span className="bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
            스쿼드 업
          </span>
        </span>
        <span className="text-lg text-gray-400">로딩 중...</span>
      </header>
    );
  }

  return (
    <header className="w-full bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* 로고 & 슬로건 */}
        <div className="flex-shrink-0"> {/* 로고가 좁아지지 않도록 flex-shrink-0 추가 */}
          <Link
            href="/"
            // 웹사이트 이름을 로고 형식으로 만들기 위해 배경, 패딩, 둥근 모서리 추가
            // 작은 화면에서 패딩과 텍스트 크기 조정
            className="inline-flex items-center justify-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-2xl sm:text-3xl md:text-4xl font-extrabold drop-shadow-lg hover:brightness-110 transition duration-300"
          >
            <span className="text-white mr-1 sm:mr-2">⚽</span> {/* 축구공 이모지에 흰색 적용 */}
            <span className="bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
              스쿼드 업
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-gray-400 ml-1 hidden sm:block">
            나만의 축구팀, 지금 바로 시작하세요!
          </p>
        </div>

        {/* 메뉴 (데스크톱용) */}
        <nav className="hidden md:flex space-x-4 lg:space-x-6"> {/* 데스크톱 메뉴 간격 조정 */}
          <Link
            href="/create-squad"
            onClick={(e) => handleFeatureClick(e, '/create-squad')}
            className={`text-sm lg:text-lg font-medium transition duration-300 ${ // 작은 화면에서 텍스트 크기 조정
              isAuthenticated ? 'hover:text-blue-400' : 'cursor-not-allowed opacity-50 hover:text-gray-500'
            }`}
          >
            새 스쿼드 만들기
          </Link>
          <Link
            href="/my-squads"
            onClick={(e) => handleFeatureClick(e, '/my-squads')}
            className={`text-sm lg:text-lg font-medium transition duration-300 ${ // 작은 화면에서 텍스트 크기 조정
              isAuthenticated ? 'hover:text-blue-400' : 'cursor-not-allowed opacity-50 hover:text-gray-500'
            }`}
          >
            내 스쿼드 보기
          </Link>
          <Link
            href="/TeamRosterViewer"
            onClick={(e) => handleFeatureClick(e, '/TeamRosterViewer')}
            className={`text-sm lg:text-lg font-medium transition duration-300 ${ // 작은 화면에서 텍스트 크기 조정
              isAuthenticated ? 'hover:text-blue-400' : 'cursor-not-allowed opacity-50 text-gray-500'
            }`}
          >
            선수보기
          </Link>
        </nav>

        {/* 사용자 메뉴 */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0"> {/* 사용자 메뉴가 좁아지지 않도록 flex-shrink-0 추가 */}
          {isAuthenticated ? (
            <>
              <span className="text-sm sm:text-lg font-semibold text-blue-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-none">
                환영합니다, {userName}님!
              </span>
              {/* 로그아웃 버튼 제거 (프로필 페이지에서 처리) */}
              <Link
                href="/profile"
                className="text-white hover:text-gray-300 transition duration-300"
              >
                <FaUserCircle size={28} className="sm:size-32" /> {/* 아이콘 크기 반응형으로 조정 */}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 sm:py-2 sm:px-5 rounded-full shadow-md transition duration-300 text-sm sm:text-base" // 버튼 패딩/텍스트 크기 조정
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-white hover:text-gray-300 transition duration-300"
              >
                <FaUserCircle size={28} className="sm:size-32" /> {/* 아이콘 크기 반응형으로 조정 */}
              </Link>
            </>
          )}
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          className="md:hidden text-white text-3xl focus:outline-none"
          onClick={toggleMobileMenu} // 클릭 이벤트 추가
        >
          ☰
        </button>
      </div>

      {/* 모바일 메뉴 (토글) */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-gray-800 py-4 px-4 mt-2 rounded-lg shadow-inner">
          <div className="flex flex-col space-y-3">
            <Link
              href="/create-squad"
              onClick={(e) => handleFeatureClick(e, '/create-squad')}
              className={`block text-white text-lg font-medium py-2 rounded-md hover:bg-gray-700 transition duration-300 ${
                isAuthenticated ? '' : 'cursor-not-allowed opacity-50'
              }`}
            >
              새 스쿼드 만들기
            </Link>
            <Link
              href="/my-squads"
              onClick={(e) => handleFeatureClick(e, '/my-squads')}
              className={`block text-white text-lg font-medium py-2 rounded-md hover:bg-gray-700 transition duration-300 ${
                isAuthenticated ? '' : 'cursor-not-allowed opacity-50'
              }`}
            >
              내 스쿼드 보기
            </Link>
            <Link
              href="/TeamRosterViewer"
              onClick={(e) => handleFeatureClick(e, '/TeamRosterViewer')}
              className={`block text-white text-lg font-medium py-2 rounded-md hover:bg-gray-700 transition duration-300 ${
                isAuthenticated ? '' : 'cursor-not-allowed opacity-50'
              }`}
            >
              선수보기
            </Link>
            {/* 인증된 경우에만 로그아웃 버튼 표시 */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full text-left bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 mt-3"
              >
                로그아웃
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
