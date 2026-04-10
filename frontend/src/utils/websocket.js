import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketManager {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
  }

  connect(accessToken, onConnectCallback) {
    if (this.client && this.client.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      connectHeaders: { token: accessToken },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        if (onConnectCallback) onConnectCallback();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribe(destination, callback) {
    if (!this.client || !this.client.active) {
      console.warn('Cannot subscribe, WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      callback(JSON.parse(message.body));
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  publish(destination, body) {
    if (!this.client || !this.client.active) {
      console.warn('Cannot publish, WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

const websocket = new WebSocketManager();
export default websocket;
