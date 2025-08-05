// app/login/page.tsx
'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { login as apiLogin } from '../api/login/login';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { login: contextLogin } = useAuth();

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    if (!userId || !password) {
      setMessage('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const result = await apiLogin({ userId, password });

      if (result.token) {
        contextLogin(result.token);
        setMessage('환영합니다! 로그인되었습니다.');
        setUserId('');
        setPassword('');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setMessage('토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      setMessage(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className={`w-full max-w-md transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            {/* Login Card */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              
              {/* Main Card */}
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">로그인</h3>
                  <p className="text-gray-400">계정에 접속하여 시작하세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User ID Field */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      아이디
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20"
                        placeholder="사용자 아이디"
                        translate="no"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/20"
                        placeholder="비밀번호"
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

                  {/* Message */}
                  {message && (
                    <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                      message.includes('환영') || message.includes('성공')
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/20 text-red-300'
                    }`}>
                      <div className="flex items-center">
                        <span className="text-sm">{message}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!userId || !password || loading}
                    className={`w-full relative overflow-hidden rounded-xl py-3 px-4 font-semibold transition-all duration-300 ${
                      userId && password && !loading
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {loading && (
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      )}
                      <span className={loading ? 'opacity-0' : 'opacity-100'}>
                        {loading ? '' : '로그인'}
                      </span>
                    </div>
                    {!loading && userId && password && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="px-4 text-gray-400 text-sm">또는</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-gray-400 mb-4">아직 계정이 없으신가요?</p>
                  <Link 
                    href="/signup"
                    className="inline-flex items-center px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300 group"
                  >
                    <span className="mr-2">회원가입</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}