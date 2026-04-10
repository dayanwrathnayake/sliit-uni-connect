import React, { useState } from 'react';
import { getEventChatRoom } from '../../api/chatService';
import ChatInterface from './ChatInterface';

export default function ChatDrawer({ eventId, eventName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isOpen && !room) {
      setLoading(true);
      try {
        const data = await getEventChatRoom(eventId, eventName);
        setRoom(data);
      } catch (err) {
        console.error('Failed to join chat');
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all hover:scale-110 z-40"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Drawer Content */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white dark:bg-slate-950 z-50 shadow-2xl transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="absolute left-0 top-1/2 -translate-x-full h-12 w-8 bg-white dark:bg-slate-950 rounded-l-xl hidden md:flex items-center justify-center cursor-pointer shadow-2xl" onClick={() => setIsOpen(false)}>
            <span className="text-slate-400">→</span>
        </div>

        {isOpen && room ? (
          <ChatInterface roomId={room.id} roomName={room.name} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">{loading ? 'Joining Chat...' : 'Click to open'}</p>
          </div>
        )}
      </div>
    </>
  );
}
