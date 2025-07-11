import { useEffect, useRef, useState } from 'react';
import type { Message, BannedUser } from '@shared/schema';

interface ConnectionStatus {
  discord: boolean;
  firebase: boolean;
  websocket: boolean;
}

interface WebSocketData {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    discord: false,
    firebase: false,
    websocket: false,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };
    
    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketData = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection_status':
            setConnectionStatus(data.data);
            break;
          case 'initial_messages':
            setMessages(data.data);
            break;
          case 'banned_users':
            setBannedUsers(data.data);
            break;
          case 'new_message':
            setMessages(prev => [...prev, data.data]);
            break;
          case 'user_banned':
            setBannedUsers(prev => [...prev, data.data]);
            break;
          case 'user_unbanned':
            setBannedUsers(prev => prev.filter(user => user.username !== data.data.username));
            break;
          case 'messages_cleared':
            setMessages([]);
            break;
          case 'error':
            setError(data.data.message);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 3000);
    };
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (username: string, message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'send_message',
        data: { username, message }
      }));
    }
  };

  const banUser = (username: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'ban_user',
        data: { username }
      }));
    }
  };

  const unbanUser = (username: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'unban_user',
        data: { username }
      }));
    }
  };

  const clearMessages = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'clear_messages',
        data: {}
      }));
    }
  };

  return {
    isConnected,
    connectionStatus,
    messages,
    bannedUsers,
    error,
    sendMessage,
    banUser,
    unbanUser,
    clearMessages,
  };
}
