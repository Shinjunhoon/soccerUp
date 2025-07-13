// components/TeamJoinRequest.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Send, User, MapPin, Trophy, Star, ArrowRight, Check } from 'lucide-react'; 
// API 함수 임포트 경로 확인: 'lib/api' 또는 'services/TeamJoinRequest/TeamJoinRequest'
// 여기서는 TeamJoinRequest.js (또는 .ts) 파일을 API 서비스로 가정합니다.
import { getTeamDetailsByInviteCode, joinTeam } from '../services/TeamJoinRequest/TeamJoinRequest';

const positions = {
  'GK': { name: '골키퍼', color: 'from-yellow-400 to-orange-500' },
  'DF': { name: '수비수', color: 'from-blue-400 to-blue-600' },
  'MF': { name: '미드필더', color: 'from-green-400 to-green-600' },
  'FW': { name: '공격수', color: 'from-red-400 to-red-600' }
};

const skillLevelOptions = [ // 백엔드 Enum과 일치하는 값들
  { value: '', label: '선택 안함' },
  { value: 'BEGINNER', label: '초급' },
  { value: 'INTERMEDIATE', label: '중급' },
  { value: 'ADVANCED', label: '고급' },
];

const provinceOptions = [
  { value: '', label: '시/도 선택 안함' },
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

const cityOptions = {
  GYEONGGI: [
    { value: '', label: '시/군/구 선택 안함' },
    { value: 'SUWON', label: '수원시' },
    { value: 'GOYANG', label: '고양시' },
    { value: 'YONGIN', label: '용인시' },
    { value: 'SEONGNAM', label: '성남시' },
    { value: 'BUCHEON', label: '부천시' },
    { value: 'HWASEONG', label: '화성시' },
    { value: 'ANSAN', label: '안산시' },
    { value: 'ANYANG', label: '안양시' },
    { value: 'PYEONGTAEK', label: '평택시' },
    { value: 'UIJEONGBU', label: '의정부시' },
    { value: 'PAJU', label: '파주시' },
    { value: 'GIMPO', label: '김포시' },
    { value: 'NAMYANGJU', label: '남양주시' },
    { value: 'POCHEON', label: '포천시' },
    { value: 'ICHON', label: '이천시' },
  ],
  SEOUL: [
    { value: '', label: '구 선택 안함' },
    { value: 'GANGNAM', label: '강남구' },
    { value: 'JUNGGU', label: '중구' },
    // 필요에 따라 서울의 다른 구들을 추가
  ],
  // 다른 시/도에 대한 시/군/구 목록을 필요에 따라 추가하세요.
};


// inviteCode를 prop으로 받도록 수정
export default function TeamJoinRequest({ inviteCode }) {
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [isLoadingTeamDetails, setIsLoadingTeamDetails] = useState(true);
  const [formData, setFormData] = useState({
    // ⭐ 이름 필드는 백엔드 DTO에 없으므로, UI에서만 사용하고 API 요청 시 제거
    name: '', // 사용자가 입력하지만, JoinRequestDto로 전송되지 않음
    position: 'MF',
    skillLevel: 'BEGINNER', // 'experience' -> 'skillLevel'로 이름 변경 및 초기값 설정
    selectedProvince: '',
    selectedCity: '',
    message: '' // 'teamIntro'로 백엔드에 전송
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [currentCityOptions, setCurrentCityOptions] = useState([]);

  // 시/도 변경 시 시/군/구 옵션 업데이트
  useEffect(() => {
    if (formData.selectedProvince && cityOptions[formData.selectedProvince]) {
      setCurrentCityOptions(cityOptions[formData.selectedProvince]);
    } else {
      setCurrentCityOptions([{ value: '', label: '시/군/구 선택 안함' }]);
    }
    setFormData(prev => ({ ...prev, selectedCity: '' })); // 시/도 변경 시 시/군/구 초기화
  }, [formData.selectedProvince]);


  // 초대 코드를 이용해 팀 상세 정보 불러오기
  useEffect(() => {
    const fetchTeamInfo = async () => {
      setIsLoadingTeamDetails(true);
      setError(null);

      if (!inviteCode) {
        setError('초대 코드가 제공되지 않았습니다.');
        setIsLoadingTeamDetails(false);
        return;
      }

      try {
        const fetchedTeam = await getTeamDetailsByInviteCode(inviteCode);
        setTeam(fetchedTeam);
      } catch (err) {
        console.error('팀 정보를 불러오는 데 실패했습니다:', err);
        setError(err.message || '팀 정보를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoadingTeamDetails(false);
      }
    };
    fetchTeamInfo();
  }, [inviteCode]); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('이름은 필수 입력 항목입니다.');
      return;
    }
    if (!formData.selectedProvince) {
      setError('거주 시/도를 선택해주세요.');
      return;
    }
    if (currentCityOptions.length > 1 && !formData.selectedCity) {
      setError(`${provinceOptions.find(p => p.value === formData.selectedProvince)?.label} 내 시/군/구를 선택해주세요.`);
      return;
    }

    if (!team || !team.id) {
      setError('팀 정보가 올바르지 않아 가입 요청을 보낼 수 없습니다.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // ⭐ 백엔드 JoinRequestDto에 맞춰 region 문자열 생성
      // 예: "SEOUL-GANGNAM", "GYEONGGI"
      const regionToSend = formData.selectedCity && formData.selectedCity !== '' 
                           ? `${formData.selectedProvince}-${formData.selectedCity}` 
                           : formData.selectedProvince;

      // ⭐ JoinRequestDto에 매핑될 객체 구성
      const joinRequestData = {
        teamId: team.id, // Long 타입이므로 JS에서는 number로 전송
        position: formData.position, 
        region: regionToSend, 
        skillLevel: formData.skillLevel, // 'experience' -> 'skillLevel' 매핑
        teamIntro: formData.message, // 'message' -> 'teamIntro' 매핑
        // teamType: 'CLUB', // 백엔드 JoinRequestDto에 teamType이 있다면 필요에 따라 추가
      };

      console.log('가입 요청 전송 데이터:', joinRequestData);

      // ⭐ joinTeam API 호출: 백엔드 DTO에 매핑되는 단일 객체 전달
      await joinTeam(joinRequestData);

      setSubmitted(true);
    } catch (err) {
      console.error('가입 요청 실패:', err);
      setError(err.message || '가입 요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      position: 'MF',
      skillLevel: 'BEGINNER',
      selectedProvince: '',
      selectedCity: '',
      message: ''
    });
    setError(null);
  };

  // UI 렌더링 로직
  if (isLoadingTeamDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white text-xl">
        팀 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* 헤더 */}
        <div className="text-center mb-12 pt-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          {team ? (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
              {team.name} 팀 가입
            </h1>
          ) : (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
              팀 가입 요청
            </h1>
          )}
          <p className="text-gray-400 text-lg">드림팀의 일원이 되어보세요</p>
          {inviteCode && (
            <p className="text-gray-500 text-sm mt-2">초대 코드: <span className="font-mono text-blue-300">{inviteCode}</span></p>
          )}
        </div>

        {error ? (
          <div className="backdrop-blur-xl bg-red-800/20 border border-red-500/30 rounded-3xl shadow-2xl p-8 text-center text-red-300">
            <p className="text-xl font-bold mb-4">오류 발생!</p>
            <p>{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300"
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          !submitted ? (
            /* 가입 요청 폼 */
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-3xl"></div>
              <div className="relative z-10 space-y-6">

                {/* 개인 정보 섹션 */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-400" />
                    개인 정보
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">이름 *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="이름을 입력하세요"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {/* 거주 지역 (시/도) 드롭다운 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="selectedProvince" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        거주 시/도 *
                      </label>
                      <div className="relative">
                        <select
                          id="selectedProvince"
                          name="selectedProvince"
                          value={formData.selectedProvince}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white backdrop-blur-sm appearance-none"
                          disabled={isSubmitting}
                        >
                          {provinceOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 거주 지역 (시/군/구) 드롭다운 */}
                    <div>
                      <label htmlFor="selectedCity" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        거주 시/군/구
                      </label>
                      <div className="relative">
                        <select
                          id="selectedCity"
                          name="selectedCity"
                          value={formData.selectedCity}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white backdrop-blur-sm appearance-none"
                          disabled={isSubmitting || !formData.selectedProvince || currentCityOptions.length <= 1}
                        >
                          {currentCityOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 축구 정보 섹션 */}
                <div className="pt-6 border-t border-white/10 space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-green-400" />
                    축구 정보
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">선호 포지션</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(positions).map(([key, pos]) => (
                          <button
                            key={key}
                            onClick={() => setFormData({...formData, position: key})}
                            className={`p-3 rounded-xl border transition-all duration-300 text-sm font-medium ${
                              formData.position === key
                                ? `bg-gradient-to-r ${pos.color} text-white border-transparent shadow-lg`
                                : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                            }`}
                          >
                            {pos.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 경험 수준 드롭다운 (skillLevelOptions 사용) */}
                    <div>
                      <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        경험 수준
                      </label>
                      <div className="relative">
                        <select
                          id="skillLevel"
                          name="skillLevel" // formData.experience -> formData.skillLevel
                          value={formData.skillLevel}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white backdrop-blur-sm appearance-none"
                          disabled={isSubmitting}
                        >
                          {skillLevelOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 메시지 섹션 */}
                <div className="pt-6 border-t border-white/10">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">자기소개 메시지</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="팀에 대한 열정과 자신의 강점을 어필해보세요..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                {/* 제출 버튼 */}
                <button
                  onClick={handleSubmit}
                  // 이름, 시/도, 시/군/구 (필요시)가 채워져야 버튼 활성화
                  disabled={!formData.name.trim() || !formData.selectedProvince || (currentCityOptions.length > 1 && !formData.selectedCity) || isSubmitting || !team} 
                  className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg">
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        요청 전송 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        가입 요청 보내기
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* 제출 완료 화면 */
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl"></div>
              <div className="relative z-10">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-2xl">
                    <Check className="w-10 h-10 text-white animate-bounce" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
                  요청이 전송되었습니다!
                </h2>
                <p className="text-gray-400 mb-8 text-lg">팀 관리자가 검토 후 연락드릴 예정입니다</p>

                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">신청자</span>
                      <span className="font-semibold text-white">{formData.name}</span>
                    </div>
                    {team && (
                      <div className="flex justify-between items-center border-t border-white/10 pt-3">
                        <span className="text-gray-400">신청 팀</span>
                        <span className="font-semibold text-white">{team.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-white/10 pt-3">
                      <span className="text-gray-400">선호 포지션</span>
                      <span className="font-semibold text-white">{positions[formData.position].name}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-3">
                      <span className="text-gray-400">경험 수준</span>
                      <span className="font-semibold text-white">
                        {skillLevelOptions.find(opt => opt.value === formData.skillLevel)?.label || formData.skillLevel}
                      </span>
                    </div>
                    {(formData.selectedProvince || formData.selectedCity) && (
                      <div className="flex justify-between items-center border-t border-white/10 pt-3">
                        <span className="text-gray-400">거주 지역</span>
                        <span className="font-semibold text-white">
                            {provinceOptions.find(opt => opt.value === formData.selectedProvince)?.label}
                            {formData.selectedCity && formData.selectedCity !== '' ? ` ${cityOptions[formData.selectedProvince]?.find(opt => opt.value === formData.selectedCity)?.label}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="w-full backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Users className="w-5 h-5" />
                  새 가입 요청
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}