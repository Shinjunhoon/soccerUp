// app/components/SessionExpiredModal.tsx
'use client';

import React from 'react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">세션 만료</h2>
        <p className="text-gray-300 text-center mb-6">
          인증이 만료되었습니다. 다시 로그인해주세요.
        </p>
        <button
          onClick={onConfirm}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
