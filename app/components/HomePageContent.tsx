// app/HomePageContent.tsx
'use client';

import Link from 'next/link';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// ... (인터페이스 및 유틸리티 함수 코드는 동일)
interface FieldPlayer {
  id: string;
  position: 'GK' | 'LB' | 'CB' | 'RB' | 'CM' | 'LM' | 'RM' | 'LW' | 'ST' | 'RW' | 'LWB' | 'RWB' | 'CDM' | 'CAM' | 'CF' | 'LF' | 'RF' | 'LCB' | 'RCB' | 'LCM' | 'RCM' | 'SW' | 'SS' | 'CF';
  x: number;
  y: number;
  name: string;
  playerId: number | null;
}

interface SquadPlayer {
  id: number;
  username: string;
  position: 'FW' | 'MF' | 'DF' | 'GK';
}

const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
};

interface FloatingElementProps {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}


export default function HomePageContent() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [floatingElements, setFloatingElements] = useState<FloatingElementProps[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
    }
  }, []);

  const handleFeatureClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      alert('로그인이 필요합니다.');
    } else {
    }
  }, [isAuthenticated]);

  const demoFormations = useMemo(() => ({
    '4-4-2': [
      { id: 'gk', position: 'GK', x: 50, y: 90, name: '', playerId: null },
      { id: 'lb', position: 'LB', x: 20, y: 70, name: '', playerId: null },
      { id: 'cb1', position: 'CB', x: 40, y: 75, name: '', playerId: null },
      { id: 'cb2', position: 'CB', x: 60, y: 75, name: '', playerId: null },
      { id: 'rb', position: 'RB', x: 80, y: 70, name: '', playerId: null },
      { id: 'lm', position: 'LM', x: 20, y: 45, name: '', playerId: null },
      { id: 'cm1', position: 'CM', x: 40, y: 50, name: '', playerId: null },
      { id: 'cm2', position: 'CM', x: 60, y: 50, name: '', playerId: null },
      { id: 'rm', position: 'RM', x: 80, y: 45, name: '', playerId: null },
      { id: 'st1', position: 'ST', x: 40, y: 20, name: '', playerId: null },
      { id: 'st2', position: 'ST', x: 60, y: 20, name: '', playerId: null },
    ],
  }), []) as { [key: string]: FieldPlayer[] };

  const initialDemoFieldPlayers: FieldPlayer[] = useMemo(() =>
    demoFormations['4-4-2'].map(p => ({ ...p, name: '', playerId: null }))
  , [demoFormations]);

  const [demoFieldPlayers, setDemoFieldPlayers] = useState<FieldPlayer[]>(initialDemoFieldPlayers);
  const [demoSelectedPlayer, setDemoSelectedPlayer] = useState<SquadPlayer | null>(null);
  const [demoDraggedPlayer, setDemoDraggedPlayer] = useState<string | null>(null);

  const mockBenchPlayers: SquadPlayer[] = useMemo(() => [
    { id: 1, username: '손흥민', position: 'FW' },
    { id: 2, username: '이강인', position: 'MF' },
    { id: 3, username: '김민재', position: 'DF' },
    { id: 4, username: '김승규', position: 'GK' },
    { id: 5, username: '황희찬', position: 'FW' },
    { id: 6, username: '황인범', position: 'MF' },
    { id: 7, username: '이재성', position: 'MF' },
    { id: 8, username: '김진수', position: 'DF' },
    { id: 9, username: '조규성', position: 'FW' },
    { id: 10, username: '권경원', position: 'DF' },
  ], []);

  const handleDemoFieldPlayerClick = useCallback((fieldPositionId: string) => {
    const targetPosition = demoFieldPlayers.find(p => p.id === fieldPositionId);
    if (!targetPosition) return;

    if (demoSelectedPlayer) {
      const updatedFieldPlayers = demoFieldPlayers.map(player =>
        player.id === fieldPositionId
          ? {
              ...player,
              name: demoSelectedPlayer.username,
              playerId: demoSelectedPlayer.id,
            }
          : player
      );
      setDemoFieldPlayers(updatedFieldPlayers);
      setDemoSelectedPlayer(null);
    } else {
      if (targetPosition.name && targetPosition.playerId !== null) {
        const originalPlayerInBench = mockBenchPlayers.find(bp => bp.id === targetPosition.playerId);
        setDemoSelectedPlayer({
          id: targetPosition.playerId,
          username: targetPosition.name,
          position: originalPlayerInBench ? originalPlayerInBench.position : 'FW',
        });
        const updatedFieldPlayers = demoFieldPlayers.map(player =>
            player.id === fieldPositionId
                ? { ...player, name: '', playerId: null }
                : player
        );
        setDemoFieldPlayers(updatedFieldPlayers);
      }
    }
  }, [demoSelectedPlayer, demoFieldPlayers, mockBenchPlayers]);

  const handleDemoBenchPlayerClick = useCallback((player: SquadPlayer) => {
    if (demoSelectedPlayer && demoSelectedPlayer.id === player.id) {
      setDemoSelectedPlayer(null);
    } else {
      setDemoSelectedPlayer(player);
    }
  }, [demoSelectedPlayer]);

  const handleDemoDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, fieldPositionId: string) => {
    const playerOnField = demoFieldPlayers.find(p => p.id === fieldPositionId);
    if (playerOnField && playerOnField.name) {
      setDemoDraggedPlayer(fieldPositionId);
      e.dataTransfer.effectAllowed = "move";
    } else {
      e.preventDefault();
    }
  }, [demoFieldPlayers]);

  const handleDemoDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDemoDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetFieldPositionId: string) => {
    e.preventDefault();

    if (demoDraggedPlayer && demoDraggedPlayer !== targetFieldPositionId) {
      const draggedPlayerIndex = demoFieldPlayers.findIndex(p => p.id === demoDraggedPlayer);
      const targetPlayerIndex = demoFieldPlayers.findIndex(p => p.id === targetFieldPositionId);

      if (draggedPlayerIndex === -1 || targetPlayerIndex === -1) {
        return;
      }

      const updatedPlayers = [...demoFieldPlayers];

      const tempPlayerInfo = {
        name: updatedPlayers[draggedPlayerIndex].name,
        playerId: updatedPlayers[draggedPlayerIndex].playerId,
      };

      updatedPlayers[draggedPlayerIndex].name = updatedPlayers[targetPlayerIndex].name;
      updatedPlayers[draggedPlayerIndex].playerId = updatedPlayers[targetPlayerIndex].playerId;

      updatedPlayers[targetPlayerIndex].name = tempPlayerInfo.name;
      updatedPlayers[targetPlayerIndex].playerId = tempPlayerInfo.playerId;

      setDemoFieldPlayers(updatedPlayers);
    }

    setDemoDraggedPlayer(null);
  }, [demoDraggedPlayer, demoFieldPlayers]);

  const handleResetDemoSquad = useCallback(() => {
    setDemoFieldPlayers(initialDemoFieldPlayers);
    setDemoSelectedPlayer(null);
    setDemoDraggedPlayer(null);
  }, [initialDemoFieldPlayers]);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5000);

    const newFloatingElements: FloatingElementProps[] = [...Array(12)].map(() => ({
      left: `${10 + Math.random() * 80}%`,
      top: `${5 + Math.random() * 90}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }));
    setFloatingElements(newFloatingElements);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const features = [
    {
      id: 0,
      icon: '👥',
      title: '팀 생성 & 지인 초대',
      subtitle: '간단한 링크 공유로',
      description: '팀을 만들고 친구들에게 초대 링크를 공유하세요. 카카오톡, 문자, 이메일로 쉽게 초대할 수 있습니다.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      id: 1,
      icon: '⚽',
      title: '협업 스쿼드 구성',
      subtitle: '모두 함께 만드는',
      description: '팀원들이 함께 참여하여 포지션을 정하고, 최적의 스쿼드를 구성해보세요. 실시간으로 업데이트됩니다.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-500/20'
    },

  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(99, 102, 241, 0.15) 0%,
            rgba(168, 85, 247, 0.1) 25%,
            rgba(34, 197, 94, 0.05) 50%,
            rgba(0, 0, 0, 0.95) 100%)`
        }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((props, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: props.left,
              top: props.top,
              animationDelay: props.animationDelay,
              animationDuration: props.animationDuration
            }}
          >
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {/* Logo/Brand */}


              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  함께 만드는
                </span>
                <br />
                <span className="text-white">축구 스쿼드 메이커</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                팀을 만들고 <span className="text-green-400 font-semibold">지인들을 초대</span>하여
                <br />
                모두가 함께 참여하는 <span className="text-blue-400 font-semibold">협업 스쿼드 구성과 관리</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Link
                  href="/create-squad"
                  onClick={(e) => handleFeatureClick(e, '/create-squad')}
                  className={`group relative px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                    isAuthenticated
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-green-500/25'
                      : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center">
                    팀 만들기 🚀
                  </span>
                </Link>

                <Link
                  href="/TeamRosterViewer"
                  onClick={(e) => handleFeatureClick(e, '/TeamRosterViewer')}
                  className="group px-8 py-4 border-2 border-white/20 rounded-2xl text-white font-bold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    팀 참여하기
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">3단계</span>로 완성
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                간단한 과정으로 친구들과 함께 완벽한 축구팀을 만들어보세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  step: '01',
                  title: '팀 생성',
                  description: '팀 이름을 정하고 기본 설정을 완료하세요',
                  icon: '🏁',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  step: '02',
                  title: '지인 초대',
                  description: '초대 링크를 공유하여 친구들을 팀에 초대하세요',
                  icon: '📱',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  step: '03',
                  title: '스쿼드 구성',
                  description: '모든 팀원이 함께 포지션을 정하고 스쿼드를 완성하세요',
                  icon: '⚽',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center hover:border-white/20 transition-all duration-300 transform hover:scale-105">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-2xl mx-auto mb-6`}>
                      {step.icon}
                    </div>
                    <div className={`text-sm font-bold mb-2 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      STEP {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-white/30">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                협업의 <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">새로운 차원</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                팀원들과 함께 만들어가는 **축구 스쿼드** 구성의 즐거움을 경험하세요
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`group relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                    activeFeature === index ? 'scale-105' : ''
                  }`}
                  onClick={() => setActiveFeature(index)}
                  style={{
                    background: `linear-gradient(135deg, ${feature.bgColor.split(' ')[1]}, ${feature.bgColor.split(' ')[3]})`
                  }}
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>

                  {/* Card Content */}
                  <div className="relative z-10">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>

                    <p className={`text-sm font-medium mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                      {feature.subtitle}
                    </p>

                    <p className="text-gray-300 leading-relaxed mb-6">
                      {feature.description}
                    </p>

                    {/* Interactive Element */}
                    <div className="flex items-center text-white/60 group-hover:text-white transition-colors">
                      <span className="text-sm">더 알아보기</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Border Gradient */}
                  <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-white/20 transition-colors duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              {/* Background Card */}
              <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    **스쿼드 메이커** 미리보기
                  </h3>
                  <p className="text-gray-400">
                    팀원들이 함께 참여하여 **축구 스쿼드**를 구성하는 모습을 확인해보세요
                  </p>
                </div>

                {/* ⭐ Mock Team Building Interface (Interactive) ⭐ */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* 축구 필드 */}
                  <div className="lg:col-span-3">
                    <div className="relative w-full h-[400px] bg-green-600 rounded-lg overflow-hidden shadow-2xl">
                      {/* 필드 라인 등 기존 요소 유지 */}
                      <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-16 border-2 border-b-white border-white"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-16 border-2 border-t-white border-white"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-b-white border-white"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-t-white border-white"></div>
                      </div>

                      {demoFieldPlayers.map((player) => (
                        <div
                          key={player.id}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                            demoSelectedPlayer?.id === player.playerId ? 'scale-110 z-20' : 'z-10'
                          } ${
                            demoDraggedPlayer === player.id ? 'opacity-50' : ''
                          }`}
                          style={{
                            left: `${player.x}%`,
                            top: `${player.y}%`
                          }}
                          onClick={() => handleDemoFieldPlayerClick(player.id)}
                          draggable={player.name ? true : false}
                          onDragStart={(e) => handleDemoDragStart(e, player.id)}
                          onDragOver={handleDemoDragOver}
                          onDrop={(e) => handleDemoDrop(e, player.id)}
                        >
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg ${
                            player.name
                              ? (demoSelectedPlayer?.id === player.playerId
                                  ? 'bg-yellow-400 border-yellow-600 text-black'
                                  : 'bg-blue-600 border-blue-800 text-white')
                              : 'bg-gray-400 border-gray-600 text-gray-800'
                          }`}>
                            {player.name ? player.name[0] : '?'}
                          </div>
                          <div className="text-xs text-white text-center mt-1 font-semibold">
                            {player.position}
                          </div>
                          {player.name && (
                            <div className="text-xs text-white text-center bg-black bg-opacity-50 rounded px-1 mt-1">
                              {player.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 선수 목록 (벤치 선수) */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h4 className="text-xl font-bold text-white mb-4">벤치 선수 (데모)</h4>

                      {demoSelectedPlayer && (
                        <div className="mb-4 p-3 bg-blue-600 rounded-lg">
                          <div className="text-white text-sm">선택된 선수:</div>
                          <div className="text-white font-semibold">
                            {demoSelectedPlayer.username} ({demoSelectedPlayer.position})
                          </div>
                        </div>
                      )}
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {mockBenchPlayers.map((player) => (
                          <div
                            key={player.id}
                            className={`p-4 rounded-lg cursor-pointer transition-all ${
                              demoSelectedPlayer?.id === player.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            onClick={() => handleDemoBenchPlayerClick(player)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{player.username}</div>
                                <div className="text-sm opacity-75">{player.position}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() => setDemoSelectedPlayer(null)}
                          className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                        >
                          선택 해제
                        </button>
                        <button
                          onClick={handleResetDemoSquad}
                          className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                        >
                          데모 스쿼드 초기화
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ⭐ Mock Team Building Interface (Interactive) 끝 ⭐ */}

              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              친구들과 함께 **스쿼드 관리**를 시작하세요
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              지금 팀을 만들고 지인들을 초대하여 완벽한 **축구 스쿼드**를 구성해보세요
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create-team"
                onClick={(e) => handleFeatureClick(e, '/create-team')}
                className={`group inline-flex items-center px-12 py-6 rounded-full text-white font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden ${
                  isAuthenticated
                    ? 'bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:shadow-green-500/25'
                    : 'bg-gray-600 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center">
                  팀 만들기 시작
                  <svg className="w-6 h-6 ml-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/demo"
                className="group inline-flex items-center px-8 py-6 border-2 border-white/20 rounded-full text-white font-medium text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  데모 체험하기
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}