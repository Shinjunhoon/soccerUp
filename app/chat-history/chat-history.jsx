// pages/chat-history.jsx

import React from 'react';
import Link from 'next/link';

function ChatHistoryPage() {
  // 💡 여기에 실제 채팅 내역 (예: 내가 대화했던 상대방 목록)을 불러와서 표시하는 로직이 들어갑니다.
  // 이 목록은 일반적으로 백엔드 API를 통해 가져오게 됩니다.

  // 임시로 대화 상대 목록을 가정합니다.
  const conversationPartners = ['userB', 'userC', 'userD']; 

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          나의 채팅 내역
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          여기에서 과거 대화 목록을 확인하거나 새로운 채팅을 시작할 수 있습니다.
        </p>

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">대화 상대</h2>
        {conversationPartners.length > 0 ? (
          <ul className="space-y-3">
            {conversationPartners.map((partnerId) => (
              <li 
                key={partnerId} 
                className="border border-gray-200 rounded-md p-4 flex justify-between items-center bg-blue-50 hover:bg-blue-100 transition duration-200"
              >
                <span className="text-lg font-medium text-gray-700">
                  {partnerId} 님
                </span>
                {/* 각 상대방과의 1:1 채팅 페이지로 연결되는 링크 */}
                <Link 
                  href={`/chat/${partnerId}`} 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-200"
                >
                  채팅하기
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">아직 시작된 대화가 없습니다.</p>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-blue-500 hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ChatHistoryPage;