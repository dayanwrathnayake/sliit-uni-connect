import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyChatRooms } from '../api/chatService';
import PageLayout from '../components/layout/PageLayout';
import ChatInterface from '../components/chat/ChatInterface';

export default function ChatPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getMyChatRooms();
        setRooms(data);
        if (data && data.length > 0) {
          setActiveRoom(data[0]);
        }
      } catch (err) {
        console.error('Failed to load chat rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 h-[calc(100vh-6rem)]">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Community Chat</h1>
          <p className="text-slate-500 text-sm mt-1">Connect with your clubs and events.</p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-full">
          {/* Sidebar list of rooms */}
          <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Conversations</h2>
            </div>
            {loading ? (
              <div className="p-4 pl-6 text-slate-500">Loading channels...</div>
            ) : rooms.length === 0 ? (
              <div className="p-4 pl-6 text-slate-500 text-sm">No chat rooms found. Join a club or event!</div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {rooms.map(room => (
                  <li 
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className={`cursor-pointer p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${activeRoom?.id === room.id ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500' : 'pl-5'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{room.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                        {room.type}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chat Window */}
          <div className="w-2/3 flex flex-col relative h-full">
            {activeRoom ? (
               <ChatInterface roomId={activeRoom.id} roomName={activeRoom.name} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <span className="text-6xl mb-4">💬</span>
                <p>Select a conversation to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
