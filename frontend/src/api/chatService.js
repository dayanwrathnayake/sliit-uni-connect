import api from './axios';

export const getEventChatRoom = async (eventId, eventName) => {
  const { data } = await api.get(`/api/chat/rooms/event/${eventId}`, {
    params: { eventName }
  });
  return data;
};

export const getMyChatRooms = async () => {
  const { data } = await api.get('/api/chat/rooms/my');
  return data;
};

export const getMessages = async (roomId, page = 0, size = 50) => {
  const { data } = await api.get(`/api/chat/rooms/${roomId}/messages`, {
    params: { page, size }
  });
  return data;
};
