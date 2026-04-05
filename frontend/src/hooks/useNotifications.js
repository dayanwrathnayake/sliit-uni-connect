import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/authStore';
import { isStudent } from '../utils/roles';
import {
  getNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
} from '../api/notificationApi';

export function useNotifications() {
  const store = useAuthStore();
  const { accessToken, isAuthenticated } = store;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [page, setPage]                   = useState(0);
  const [hasMore, setHasMore]             = useState(false);
  const [loading, setLoading]             = useState(false);

  const stompClientRef = useRef(null);
  const enabled = isAuthenticated && isStudent(store);

  // ── Initial load ──────────────────────────────────────────────────────────

  const fetchPage = useCallback(async (pageNum) => {
    if (!enabled) return;
    setLoading(true);
    try {
      const [countRes, notifRes] = await Promise.all([
        pageNum === 0 ? getUnreadCount() : Promise.resolve(null),
        getNotifications({ page: pageNum, size: 15 }),
      ]);

      if (countRes) {
        setUnreadCount(countRes.data.count);
      }

      const pageData = notifRes.data;
      const items = pageData.content ?? [];

      setNotifications((prev) => (pageNum === 0 ? items : [...prev, ...items]));
      setHasMore(!pageData.last);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchPage(0);
  }, [enabled, fetchPage]);

  // ── WebSocket connection ───────────────────────────────────────────────────

  useEffect(() => {
    if (!enabled || !accessToken) return;

    let client;
    try {
      client = new Client({
        webSocketFactory: () => {
          const socket = new SockJS('http://localhost:8080/ws');
          return socket;
        },
        connectHeaders: { token: accessToken },
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe('/user/queue/notifications', (message) => {
            try {
              const newNotif = JSON.parse(message.body);
              setNotifications((prev) => [newNotif, ...prev]);
              setUnreadCount((prev) => prev + 1);
            } catch (e) {
              console.error('Failed to parse WS notification:', e);
            }
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
        },
        onWebSocketError: (event) => {
          console.warn('WebSocket error (backend may be offline):', event);
        },
      });

      client.activate();
      stompClientRef.current = client;
    } catch (e) {
      console.error('Failed to initialise WebSocket client:', e);
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [enabled, accessToken]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(page + 1);
    }
  }, [loading, hasMore, page, fetchPage]);

  const markRead = useCallback(async (id) => {
    try {
      await apiMarkAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchPage(0);
  }, [fetchPage]);

  return {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadMore,
    markRead,
    markAllRead,
    refresh,
  };
}

export default useNotifications;
