// components/ChatWindow.jsx

import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from 'axios'; // npm install axios 필요

// Spring Boot 서버의 기본 URL (개발 환경 기준)
const API_BASE_URL = 'http://localhost:8080'; 

function ChatWindow({ currentUserId, targetUserId }) {
  // 메시지 목록 상태 관리
  const [messages, setMessages] = useState([]);
  // 현재 입력 중인 메시지 상태 관리
  const [messageInput, setMessageInput] = useState('');
  // STOMP 클라이언트 인스턴스를 useRef로 관리 (컴포넌트 리렌더링 시에도 유지)
  const stompClient = useRef(null);
  // 메시지 창의 스크롤을 맨 아래로 내리기 위한 Ref
  const messagesEndRef = useRef(null);

  // 컴포넌트 마운트 및 currentUserId/targetUserId 변경 시 실행
  useEffect(() => {
    // 사용자 ID가 유효한지 확인 후 연결 시도
    if (currentUserId && targetUserId) {
        connect();
        loadChatHistory();
    }

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      if (stompClient.current && stompClient.current.connected) {
        console.log('STOMP client disconnecting...');
        stompClient.current.disconnect(() => console.log('Disconnected from WebSocket.'));
      }
    };
  }, [currentUserId, targetUserId]); // 종속성 배열: 이 값들이 변경되면 useEffect 다시 실행

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 스크롤을 메시지 창 하단으로 부드럽게 이동시키는 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 웹소켓 연결 함수
  const connect = () => {
    // SockJS를 사용하여 WebSocket 연결 시도 (Spring Boot의 /ws-stomp 엔드포인트)
    const socket = new SockJS(`${API_BASE_URL}/ws-stomp`);
    stompClient.current = Stomp.over(socket);
    
    // STOMP 클라이언트 연결
    stompClient.current.connect({}, (frame) => {
      console.log('Connected to WebSocket: ' + frame);
      
      // 현재 사용자의 개인 메시지 큐를 구독
      // 이 경로로 서버가 메시지를 보내면 클라이언트가 받게 됩니다.
      stompClient.current.subscribe(`/user/queue/messages`, (messageOutput) => {
        const newMessage = JSON.parse(messageOutput.body);
        console.log('Received message:', newMessage);
        
        // 현재 대화 중인 상대방의 메시지이거나 내가 보낸 메시지인 경우에만 화면에 추가
        // (주의: `convertAndSendToUser`는 발신자와 수신자 모두에게 메시지를 보내므로 필터링 필요)
        if (
            (newMessage.senderId === targetUserId && newMessage.receiverId === currentUserId) ||
            (newMessage.senderId === currentUserId && newMessage.receiverId === targetUserId)
        ) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      }, (error) => {
        console.error('STOMP subscription error:', error);
      });

    }, (error) => {
      console.error('STOMP connection error: ' + error);
      // 연결 실패 시 재연결 로직을 추가할 수 있습니다.
      // setTimeout(connect, 5000); 
    });
  };

  // 이전 채팅 내역 불러오는 함수 (HTTP GET 요청)
  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${currentUserId}/${targetUserId}`);
      setMessages(response.data);
      console.log('Chat history loaded:', response.data);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // 에러 시 사용자에게 알림
      alert('채팅 내역을 불러오는데 실패했습니다.');
    }
  };

  // 메시지 전송 함수
  const sendMessage = () => {
    // 입력된 메시지가 있고, STOMP 클라이언트가 연결되어 있는지 확인
    if (messageInput.trim() && stompClient.current && stompClient.current.connected) {
      const chatMessage = {
        senderId: currentUserId,
        receiverId: targetUserId,
        content: messageInput.trim(),
        // timestamp는 서버에서 설정하므로 클라이언트에서 보내지 않아도 됩니다.
      };
      
      // STOMP 클라이언트를 통해 서버의 @MessageMapping 경로로 메시지 전송
      stompClient.current.send("/pub/chat/message", {}, JSON.stringify(chatMessage));
      setMessageInput(''); // 메시지 입력창 비우기
    } else {
        console.warn("메시지를 입력하거나 연결 상태를 확인해주세요.");
    }
  };

  // 엔터 키 입력 시 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Shift+Enter는 줄바꿈
      e.preventDefault(); // 기본 줄바꿈 동작 방지
      sendMessage();
    }
  };

  // currentUserId나 targetUserId가 아직 유효하지 않을 경우
  if (!currentUserId || !targetUserId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">채팅 상대를 선택해주세요...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto my-8 border border-gray-300 rounded-lg shadow-lg bg-white">
      {/* 헤더 */}
      <div className="p-4 bg-blue-600 text-white rounded-t-lg">
        <h2 className="text-xl font-semibold">{targetUserId} 님과의 채팅</h2>
      </div>

      {/* 메시지 표시 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ maxHeight: 'calc(100% - 120px)' }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[70%] p-3 rounded-xl 
              ${msg.senderId === currentUserId 
                ? 'bg-green-500 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'}
            `}>
              <span className="font-bold text-sm">
                {msg.senderId === currentUserId ? '나' : msg.senderId}
              </span>
              <p className="text-base break-words">{msg.content}</p>
              <span className="text-xs text-gray-500 block mt-1" style={{ color: msg.senderId === currentUserId ? '#eee' : '#666' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* 스크롤 타겟 */}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-4 border-t border-gray-200 bg-white flex items-center">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
        />
        <button 
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          보내기
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;