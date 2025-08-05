// components/CreateFootballSquad.jsx

import React, { useState, useEffect } from 'react';
import { Users, Trophy, Plus, Sparkles, ArrowRight, Check, MapPin, Calendar, Briefcase, Zap, Info } from 'lucide-react';
import { createTeam } from '../api/createTeam/createTeam'

const CreateFootballSquad = () => {
  const [teamName, setTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdTeam, setCreatedTeam] = useState(null); // 이 객체는 TeamResponseJoinUrl 형태를 가집니다.
  const [error, setError] = useState(null);

  // 이 state들은 사용자 입력 값을 저장하고, API 요청 시 사용됩니다.
  // 응답으로 받는 createdTeam에는 이 상세 정보가 포함되지 않습니다.
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [averageAge, setAverageAge] = useState('');
  const [teamType, setTeamType] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [teamIntro, setTeamIntro] = useState('');

  const [currentCityOptions, setCurrentCityOptions] = useState([]);

  useEffect(() => {
    if (selectedProvince && cityOptions[selectedProvince]) {
      setCurrentCityOptions(cityOptions[selectedProvince]);
    } else {
      setCurrentCityOptions([{ value: '', label: '시/군/구 선택 안함' }]);
    }
    setSelectedCity(''); // 시/도 변경 시 시/군/구 초기화
  }, [selectedProvince]);

  // ⭐ 백엔드 Enum 이름과 정확히 일치하도록 value 값 수정
  const ageOptions = [
    { value: '', label: '선택 안함' },
    { value: 'TWENTIES', label: '20대' },
    { value: 'THIRTIES', label: '30대' },
    { value: 'FORTIES', label: '40대' },
    { value: 'FIFTIES_PLUS', label: '50대 이상' },
    { value: 'MIXED', label: '혼합' },
  ];

  // ⭐ 백엔드 Enum 이름과 정확히 일치하도록 value 값 수정
  const teamTypeOptions = [
    { value: '', label: '선택 안함' },
    { value: 'CLUB', label: '동호회' },
    { value: 'SCHOOL', label: '학교/학원' },
    { value: 'COMPANY', label: '회사' },
    { value: 'FRIENDS', label: '친구/지인' },
    { value: 'OTHER', label: '기타' },
  ];

  // ⭐ 백엔드 Enum 이름과 정확히 일치하도록 value 값 수정
  const skillLevelOptions = [
    { value: '', label: '선택 안함' },
    { value: 'BEGINNER', label: '초급' },
    { value: 'INTERMEDIATE', label: '중급' },
    { value: 'ADVANCED', label: '고급' },
  ];
  
 // lib/koreanRegions.ts

// 시/도 옵션
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

// 시/군/구 옵션
 const cityOptions = {
  SEOUL: [
    { value: '', label: '구 선택 안함' },
    { value: 'JONGNO', label: '종로구' },
    { value: 'JUNGGU', label: '중구' },
    { value: 'YONGSAN', label: '용산구' },
    { value: 'SEONGDONG', label: '성동구' },
    { value: 'GWANGJIN', label: '광진구' },
    { value: 'DONGDAEMUN', label: '동대문구' },
    { value: 'JUNGNANG', label: '중랑구' },
    { value: 'SEONGBUK', label: '성북구' },
    { value: 'GANGBUK', label: '강북구' },
    { value: 'DOBONG', label: '도봉구' },
    { value: 'NOWON', label: '노원구' },
    { value: 'EUNPYEONG', label: '은평구' },
    { value: 'SEODAEMUN', label: '서대문구' },
    { value: 'MAPO', label: '마포구' },
    { value: 'YANGCHEON', label: '양천구' },
    { value: 'GANGSEO', label: '강서구' },
    { value: 'GURO', label: '구로구' },
    { value: 'GEUMCHEON', label: '금천구' },
    { value: 'YEONGDEUNGPO', label: '영등포구' },
    { value: 'DONGJAK', label: '동작구' },
    { value: 'GWANAK', label: '관악구' },
    { value: 'SEOCHO', label: '서초구' },
    { value: 'GANGNAM', label: '강남구' },
    { value: 'SONGPA', label: '송파구' },
    { value: 'GANGDONG', label: '강동구' },
  ],
  BUSAN: [
    { value: '', label: '구/군 선택 안함' },
    { value: 'JUNGGU', label: '중구' },
    { value: 'SEO', label: '서구' },
    { value: 'DONG', label: '동구' },
    { value: 'YEONGDO', label: '영도구' },
    { value: 'BUSANJIN', label: '부산진구' },
    { value: 'DONGNAE', label: '동래구' },
    { value: 'NAMGU', label: '남구' },
    { value: 'BUKGU', label: '북구' },
    { value: 'HAEUNDAE', label: '해운대구' },
    { value: 'SAHA', label: '사하구' },
    { value: 'GEUMJEONG', label: '금정구' },
    { value: 'GANGSEO', label: '강서구' },
    { value: 'YEONJE', label: '연제구' },
    { value: 'SUYEONG', label: '수영구' },
    { value: 'SASANG', label: '사상구' },
    { value: 'GIJANG', label: '기장군' },
  ],
  DAEGU: [
    { value: '', label: '구/군 선택 안함' },
    { value: 'JUNGGU', label: '중구' },
    { value: 'DONGGU', label: '동구' },
    { value: 'SEOBUKGU', label: '서구' },
    { value: 'NAMGU', label: '남구' },
    { value: 'BUKGU', label: '북구' },
    { value: 'SUSEONG', label: '수성구' },
    { value: 'DALSEO', label: '달서구' },
    { value: 'DALSEONG', label: '달성군' },
    { value: 'GUNWI', label: '군위군' },
  ],
  INCHEON: [
    { value: '', label: '구/군 선택 안함' },
    { value: 'JUNGGU', label: '중구' },
    { value: 'DONGGU', label: '동구' },
    { value: 'MICHUHOL', label: '미추홀구' },
    { value: 'YEONSU', label: '연수구' },
    { value: 'NAMDONG', label: '남동구' },
    { value: 'BUPYEONG', label: '부평구' },
    { value: 'GYEYANG', label: '계양구' },
    { value: 'SEO', label: '서구' },
    { value: 'GANGHWA', label: '강화군' },
    { value: 'ONGJIN', label: '옹진군' },
  ],
  GWANGJU: [
    { value: '', label: '구 선택 안함' },
    { value: 'DONGGU', label: '동구' },
    { value: 'SEOBUKGU', label: '서구' },
    { value: 'NAMGU', label: '남구' },
    { value: 'BUKGU', label: '북구' },
    { value: 'GWANGSAN', label: '광산구' },
  ],
  DAEJEON: [
    { value: '', label: '구 선택 안함' },
    { value: 'DONGGU', label: '동구' },
    { value: 'JUNGGU', label: '중구' },
    { value: 'SEOBUKGU', label: '서구' },
    { value: 'YUSEONG', label: '유성구' },
    { value: 'DAEDEOK', label: '대덕구' },
  ],
  ULSAN: [
    { value: '', label: '구/군 선택 안함' },
    { value: 'JUNGGU', label: '중구' },
    { value: 'NAMGU', label: '남구' },
    { value: 'DONGGU', label: '동구' },
    { value: 'BUKGU', label: '북구' },
    { value: 'ULJU', label: '울주군' },
  ],
  SEJONG: [
    { value: '', label: '시/군/구 선택 안함' },
    { value: 'SEJONG', label: '세종시' }, // 세종시는 단일 행정구역
  ],
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
    { value: 'ANSEONG', label: '안성시' },
    { value: 'OSAN', label: '오산시' },
    { value: 'SIHEUNG', label: '시흥시' },
    { value: 'GUNPO', label: '군포시' },
    { value: 'UIWANG', label: '의왕시' },
    { value: 'GWANGJU', label: '광주시' },
    { value: 'YANGJU', label: '양주시' },
    { value: 'DONGDUCHEON', label: '동두천시' },
    { value: 'GURI', label: '구리시' },
    { value: 'HWASEONG', label: '하남시' },
    { value: 'YEOJU', label: '여주시' },
    { value: 'GWANGMYEONG', label: '광명시' },
    { value: 'GAPYEONG', label: '가평군' },
    { value: 'YANGPYEONG', label: '양평군' },
    { value: 'YEONCHEON', label: '연천군' },
  ],
  GANGWON: [
    { value: '', label: '시/군 선택 안함' },
    { value: 'CHUNCHEON', label: '춘천시' },
    { value: 'WONJU', label: '원주시' },
    { value: 'GANGNEUNG', label: '강릉시' },
    { value: 'DONGHAE', label: '동해시' },
    { value: 'TAEBAEK', label: '태백시' },
    { value: 'SOKCHO', label: '속초시' },
    { value: 'SAMCHEOK', label: '삼척시' },
    { value: 'HONGCHEON', label: '홍천군' },
    { value: 'HOENGSEONG', label: '횡성군' },
    { value: 'YEONGWOL', label: '영월군' },
    { value: 'PYEONGCHANG', label: '평창군' },
    { value: 'JEONGSEON', label: '정선군' },
    { value: 'CHEORWON', label: '철원군' },
    { value: 'HWASHEON', label: '화천군' },
    { value: 'YANGGU', label: '양구군' },
    { value: 'INJE', label: '인제군' },
    { value: 'GOSEONG', label: '고성군' },
    { value: 'YANGYANG', label: '양양군' },
  ],
  CHUNGBUK: [
    { value: '', label: '시/군 선택 안함' },
    { value: 'CHEONGJU', label: '청주시' },
    { value: 'CHUNGJU', label: '충주시' },
    { value: 'JECHEON', label: '제천시' },
    { value: 'BOEUN', label: '보은군' },
    { value: 'OKCHEON', label: '옥천군' },
    { value: 'YEONGDONG', label: '영동군' },
    { value: 'JEUNGPYEONG', label: '증평군' },
    { value: 'JINCHEON', label: '진천군' },
    { value: 'GOESAN', label: '괴산군' },
    { value: 'EUMSEONG', label: '음성군' },
    { value: 'DANYANG', label: '단양군' },
  ],
  CHUNGNAM: [
    { value: '', label: '시/군 선택 안함' },
    { value: 'CHEONAN', label: '천안시' },
    { value: 'GONGJU', label: '공주시' },
    { value: 'BOEUN', label: '보령시' },
    { value: 'ASAN', label: '아산시' },
    { value: 'SEOSAN', label: '서산시' },
    { value: 'NONSAN', label: '논산시' },
    { value: 'GYERYONG', label: '계룡시' },
    { value: 'DANGJIN', label: '당진시' },
    { value: 'GEUMSAN', label: '금산군' },
    { value: 'BUYEO', label: '부여군' },
    { value: 'SEOCHEON', label: '서천군' },
    { value: 'CHEONGYANG', label: '청양군' },
    { value: 'HONGSEONG', label: '홍성군' },
    { value: 'YESAN', label: '예산군' },
    { value: 'TAEAN', label: '태안군' },
  ],
  JEONBUK: [
    { value: '', label: '시/군 선택 안함' },
    { value: 'JEONJU', label: '전주시' },
    { value: 'GUNSAN', label: '군산시' },
    { value: 'IKSAN', label: '익산시' },
    { value: 'JEONGEUP', label: '정읍시' },
    { value: 'NAMWON', label: '남원시' },
    { value: 'GIMJE', label: '김제시' },
    { value: 'WANJU', label: '완주군' },
    { value: 'JINAN', label: '진안군' },
    { value: 'MUJU', label: '무주군' },
    { value: 'JANGSU', label: '장수군' },
    { value: 'IMSIL', label: '임실군' },
    { value: 'SUNCHANG', label: '순창군' },
    { value: 'GOCHANG', label: '고창군' },
    { value: 'Buan', label: '부안군' },
  ],
  JEONNAM: [
    { value: '', label: '시/군 선택 안함' },
    { value: 'MOKPO', label: '목포시' },
    { value: 'YEOSU', label: '여수시' },
    { value: 'SUNCHEON', label: '순천시' },
    { value: 'NAJU', label: '나주시' },
    { value: 'GWANGYANG', label: '광양시' },
    { value: 'DAMYANG', label: '담양군' },
    { value: 'GOKSEONG', label: '곡성군' },
    { value: 'GUYE', label: '구례군' },
    { value: 'GOHEUNG', label: '고흥군' },
    { value: 'BOSUNG', label: '보성군' },
    { value: 'HWASUN', label: '화순군' },
    { value: 'JANGHEUNG', label: '장흥군' },
    { value: 'GANGJIN', label: '강진군' },
    { value: 'HAENAM', label: '해남군' },
    { value: 'YEONGAM', label: '영암군' },
    { value: 'MUAN', label: '무안군' },
    { value: 'HAMYEONG', label: '함평군' },
    { value: 'YEONGGWANG', label: '영광군' },
    { value: 'JANGSEONG', label: '장성군' },
    { value: 'WANDO', label: '완도군' },
    { value: 'JINDO', label: '진도군' },
    { value: 'SINAN', label: '신안군' },
  ],
  GYEONGBUK: [
    { value: '', label: '시/군 선택 안함' },
    { value: 'POHANG', label: '포항시' },
    { value: 'GYEONGJU', label: '경주시' },
    { value: 'GIMCHEON', label: '김천시' },
    { value: 'ANDONG', label: '안동시' },
    { value: 'GUMI', label: '구미시' },
    { value: 'YEONGJU', label: '영주시' },
    { value: 'YEONGCHEON', label: '영천시' },
    { value: 'SANGJU', label: '상주시' },
    { value: 'MUNGYEONG', label: '문경시' },
    { value: 'GYEONGSAN', label: '경산시' },
    { value: 'UISEONG', label: '의성군' },
    { value: 'CHEONGSONG', label: '청송군' },
    { value: 'YEONGYANG', label: '영양군' },
    { value: 'YEONGDEOK', label: '영덕군' },
    { value: 'CHEONGDO', label: '청도군' },
    { value: 'GORYEONG', label: '고령군' },
    { value: 'SEONGJU', label: '성주군' },
    { value: 'CHILGOK', label: '칠곡군' },
    { value: 'YECHEON', label: '예천군' },
    { value: 'BONGHWA', label: '봉화군' },
    { value: 'ULJIN', label: '울진군' },
    { value: 'ULLEUNG', label: '울릉군' },
  ],
  GYEONGNAM: [
    { value: '', label: '시/군 선택 안함' },
    { value: 'CHANGWON', label: '창원시' },
    { value: 'JINJU', label: '진주시' },
    { value: 'TONGYEONG', label: '통영시' },
    { value: 'SACHEON', label: '사천시' },
    { value: 'GIMHAE', label: '김해시' },
    { value: 'MIRYANG', label: '밀양시' },
    { value: 'GEOJE', label: '거제시' },
    { value: 'YANGSAN', label: '양산시' },
    { value: 'UIYEONG', label: '의령군' },
    { value: 'HAMAN', label: '함안군' },
    { value: 'CHANGNYEONG', label: '창녕군' },
    { value: 'GOSEONG', label: '고성군' },
    { value: 'NAMHAE', label: '남해군' },
    { value: 'HADONG', label: '하동군' },
    { value: 'SANCHEONG', label: '산청군' },
    { value: 'HAMYANG', label: '함양군' },
    { value: 'GEOCHANG', label: '거창군' },
    { value: 'HAPCHEON', label: '합천군' },
  ],
  JEJU: [
    { value: '', label: '시/군/구 선택 안함' },
    { value: 'JEJU', label: '제주시' },
    { value: 'SEOGWIPO', label: '서귀포시' },
  ],
};


  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  const handleSubmit = async () => {
    // 폼 유효성 검사
    if (!teamName.trim()) {
      setError('팀 이름을 입력해주세요.');
      return;
    }
    if (!selectedProvince) {
      setError('팀 시/도를 선택해주세요.');
      return;
    }
    if (currentCityOptions.length > 1 && !selectedCity) { // 시/군/구가 있는 시/도인데 선택 안 했을 경우
      setError(`${provinceOptions.find(p => p.value === selectedProvince)?.label} 내 시/군/구를 선택해주세요.`);
      return;
    }
    // 다른 필수 필드에 대한 유효성 검사도 필요하다면 여기에 추가하세요.

    setIsCreating(true);
    setError(null); // 이전 에러 메시지 초기화

    try {
      const regionToSend = selectedCity ? `${selectedProvince}-${selectedCity}` : selectedProvince;

      const newTeamData = {
        teamName,
        region: regionToSend,
        averageAge,
        teamType,
        skillLevel,
        teamIntro,
      };

      console.log("프론트엔드에서 백엔드로 보낼 데이터:", newTeamData);

      // ⭐ lib/api.js의 createTeam 함수는 이제 userId를 인자로 받지 않습니다.
      const newTeamResponse = await createTeam(newTeamData); 
      console.log("API 호출 결과 (newTeamResponse):", newTeamResponse); // 디버깅용: 서버 응답 확인
      
      // ⭐ API 응답은 TeamResponseJoinUrl 객체이므로, 그 필드만 사용합니다.
      setCreatedTeam(newTeamResponse); 
      console.log("createdTeam 상태 업데이트 후:", newTeamResponse); // 디버깅용: 상태 업데이트 확인
      
      // 폼 초기화 (팀 생성 성공 후)
      setTeamName('');
      setSelectedProvince('');
      setSelectedCity('');
      setAverageAge('');
      setTeamType('');
      setSkillLevel('');
      setTeamIntro('');

    } catch (err) {
      console.error('팀 생성 실패:', err);
      setError(err.message || '팀 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCreatedTeam(null); // 생성 완료 상태 해제
    // 모든 폼 필드 초기화
    setTeamName('');
    setSelectedProvince('');
    setSelectedCity('');
    setAverageAge('');
    setTeamType('');
    setSkillLevel('');
    setTeamIntro('');
    setError(null);
  };

  // 이 함수는 현재 createdTeam 객체에 region 필드가 없으므로 사용되지 않습니다.
  // 만약 생성 후 지역 정보를 다시 표시하고 싶다면, handleSubmit에서 newTeamData를
  // 별도의 state(예: submittedTeamData)에 저장하여 사용하는 것을 고려해야 합니다.
  // const getRegionLabel = (regionValue) => { /* ... */ };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* 배경 애니메이션 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* 헤더 */}
        <div className="text-center mb-12 pt-16">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
            새로운 스쿼드 생성
          </h1>
          <p className="text-gray-400 text-lg">당신만의 드림팀을 만들어보세요</p>
        </div>

        {/* 팀 생성 폼 또는 완료 화면 */}
        {!createdTeam ? (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-3xl"></div>
            
            <div className="relative z-10 flex flex-wrap -mx-1.5 mb-8"> 
              
              {/* 팀 이름 필드 */}
              <div className="w-full md:w-[calc(33.333%-12px)] px-1.5 mb-4"> 
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  팀 이름
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="팀 이름을 입력하세요..."
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 text-lg backdrop-blur-sm"
                    disabled={isCreating}
                  />
                  {teamName && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* 시/도 선택 */}
              <div className="w-full md:w-[calc(33.333%-12px)] px-1.5 mb-4">
                <label htmlFor="selectedProvince" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  시/도
                </label>
                <div className="relative">
                  <select
                    id="selectedProvince"
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 text-lg backdrop-blur-sm appearance-none"
                    disabled={isCreating}
                  >
                    {provinceOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 시/군/구 선택 */}
              <div className="w-full md:w-[calc(33.333%-12px)] px-1.5 mb-4">
                <label htmlFor="selectedCity" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  시/군/구
                </label>
                <div className="relative">
                  <select
                    id="selectedCity"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 text-lg backdrop-blur-sm appearance-none"
                    disabled={isCreating || !selectedProvince || currentCityOptions.length <= 1}
                  >
                    {currentCityOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[calc(33.333%-12px)] px-1.5 mb-4">
                <label htmlFor="averageAge" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  평균 연령대
                </label>
                <div className="relative">
                  <select
                    id="averageAge"
                    value={averageAge}
                    onChange={(e) => setAverageAge(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 text-lg backdrop-blur-sm appearance-none"
                    disabled={isCreating}
                  >
                    {ageOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[calc(33.333%-12px)] px-1.5 mb-4">
                <label htmlFor="teamType" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  소속 유형
                </label>
                <div className="relative">
                  <select
                    id="teamType"
                    value={teamType}
                    onChange={(e) => setTeamType(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 text-lg backdrop-blur-sm appearance-none"
                    disabled={isCreating}
                  >
                    {teamTypeOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[calc(33.333%-12px)] px-1.5 mb-4">
                <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  팀 실력
                </label>
                <div className="relative">
                  <select
                    id="skillLevel"
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 text-lg backdrop-blur-sm appearance-none"
                    disabled={isCreating}
                  >
                    {skillLevelOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 팀 소개 필드 */}
              <div className="w-full px-1.5 mb-4">
                <label htmlFor="teamIntro" className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  팀 소개 (선택 사항)
                </label>
                <div className="relative">
                  <textarea
                    id="teamIntro"
                    value={teamIntro}
                    onChange={(e) => setTeamIntro(e.target.value)}
                    placeholder="우리 팀을 자유롭게 소개해주세요 (예: 열정 가득한 20대 친목팀!)"
                    rows="4"
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-gray-400 text-lg backdrop-blur-sm resize-y"
                    disabled={isCreating}
                  ></textarea>
                </div>
              </div>

              {/* 에러 메시지 표시 */}
              {error && (
                <p className="w-full px-1.5 text-red-400 text-sm text-center mb-4">{error}</p>
              )}

              {/* 팀 만들기 버튼 */}
              <div className="w-full px-1.5">
                <button
                  onClick={handleSubmit}
                  disabled={!teamName.trim() || !selectedProvince || (currentCityOptions.length > 1 && !selectedCity) || isCreating}
                  className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg">
                    {isCreating ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        팀 생성 중...
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6" />
                        팀 만들기
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* 예시 팀 이름들 */}
              <div className="w-full px-1.5 pt-6 border-t border-white/10 mt-4">
                <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  인기 팀 이름 (클릭하여 자동 입력)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['FC Seoul', 'Busan Dragons', 'Galaxy United', 'Thunder Bolts'].map((example) => (
                    <button
                      key={example}
                      onClick={() => setTeamName(example)}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl transition-all duration-300 text-sm font-medium backdrop-blur-sm"
                      disabled={isCreating}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ⭐ 팀 생성 완료 화면 - createdTeam 객체의 필드(id, name, inviteLink, createdAt)만 사용 */
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
              팀 생성 완료!
            </h2>
            <p className="text-gray-400 mb-8 text-lg">팀이 성공적으로 생성되었습니다</p>
            
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="space-y-4">
                {/* 팀 이름 */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">팀 이름</span>
                  <span className="font-bold text-white text-lg">{createdTeam.name}</span>
                </div>
                
                {/* 초대 링크 */}
                {createdTeam.inviteLink && ( // 초대 링크가 있을 경우에만 표시
                  <div className="flex justify-between items-center py-2 border-t border-white/10">
                    <span className="text-gray-400">초대 링크</span>
                    <a 
                      href={createdTeam.inviteLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-300 hover:text-blue-200 transition-colors text-sm break-all"
                    >
                      {createdTeam.inviteLink}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼들 (이 부분은 이전과 동일합니다) */}
            <div className="space-y-4">
              <button className="w-full relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3">
                  <Users className="w-5 h-5" />
                  선수 추가하기
                </div>
              </button>
              
              <button 
                onClick={resetForm}
                className="w-full backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                새 팀 만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default CreateFootballSquad;