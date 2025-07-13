// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        // 기존 애니메이션 정의 유지
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-30px)' },
          '60%': { transform: 'translateY(-15px)' },
        },
        bounceX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-10px)' },
        },
        pulseY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0)' },
        },
        // ⭐⭐⭐ 이 부분을 추가해야 합니다! ⭐⭐⭐
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out forwards',
        slideUp: 'slideUp 1s ease-out forwards',
        bounceIn: 'bounceIn 1.5s infinite',
        bounceX: 'bounceX 0.7s infinite alternate',
        pulseY: 'pulseY 1s infinite alternate',
        float: 'float 2s ease-in-out infinite',
        // ⭐⭐⭐ 이 부분을 추가해야 합니다! ⭐⭐⭐
        'scale-in': 'scale-in 0.3s ease-out forwards', // 0.3초 동안 부드럽게 나타나고 커지도록 설정
      },
    },
  },
  plugins: [],
};