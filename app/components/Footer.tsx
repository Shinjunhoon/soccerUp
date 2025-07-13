// components/Footer.tsx
import React from 'react'; // React 임포트

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white p-4 text-center mt-auto">
      <div className="container mx-auto text-sm">
        &copy; {new Date().getFullYear()} 나의 스쿼드 메이커. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;