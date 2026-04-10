import React, { useState, useEffect, useRef } from 'react';
import { getMessages } from '../../api/chatService';
import { useAuthStore } from '../../store/authStore';
import websocket from '../../utils/websocket';

export default function ChatInterface({ roomId, roomName }) {
  const { userId, displayName, accessToken } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    // 1. Fetch History
    getMessages(roomId, 0, 50).then(data => {
      setMessages(data.content.reverse());
    });

    // 2. Connect and Subscribe
    websocket.connect(accessToken, () => {
      websocket.subscribe(`/topic/room/${roomId}`, (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      websocket.subscribe(`/topic/room/${roomId}/typing`, (indicator) => {
        if (indicator.userId === userId) return;
        setTypingUsers(prev => {
          if (indicator.isTyping) {
            return [...new Set([...prev, indicator.userName])];
          } else {
            return prev.filter(u => u !== indicator.userName);
          }
        });
      });
    });

    return () => {
      websocket.unsubscribe(`/topic/room/${roomId}`);
      websocket.unsubscribe(`/topic/room/${roomId}/typing`);
    };
  }, [roomId, accessToken, userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    websocket.publish(`/app/chat.sendMessage/${roomId}`, {
      content: inputValue,
      senderName: displayName
    });
    setInputValue('');
    sendTypingStatus(false);
  };

  const sendTypingStatus = (typing) => {
    if (isTyping === typing) return;
    setIsTyping(typing);
    websocket.publish(`/app/chat.typing/${roomId}`, {
      userId,
      userName: displayName,
      isTyping: typing
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
         <h2 className="font-bold text-slate-900 dark:text-white truncate">{roomName}</h2>
         <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId;
          const isSystem = msg.type === 'SYSTEM';

          if (isSystem) return (
            <div key={i} className="text-center text-[10px] text-slate-500 uppercase tracking-tighter py-2">
              — {msg.content} —
            </div>
          );

          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.senderName}</span>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        {typingUsers.length > 0 && (
          <div className="text-[10px] text-slate-400 mb-2 italic">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none outline-none px-4 py-2 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              sendTypingStatus(true);
            }}
            onBlur={() => sendTypingStatus(false)}
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30">
            →
          </button>
        </form>
      </div>
    </div>
  );
}
