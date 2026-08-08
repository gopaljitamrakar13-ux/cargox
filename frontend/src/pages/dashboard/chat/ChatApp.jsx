import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import GlassCard from '../../../components/ui/GlassCard';
import Button from '../../../components/ui/Button';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { io } from 'socket.io-client';

// Derive the Socket.IO server URL from the same base as the API
// In development: ws://localhost:5000
// In production:  wss://your-backend.onrender.com
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || import.meta.env.VITE_API_URL?.replace('/api', '')
  || 'http://localhost:5000';

const ChatApp = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [shipments, setShipments] = useState([]);
  const [activeShipmentId, setActiveShipmentId] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch user's shipments for chat selection
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await api.get('/shipments/');
        setShipments(response.data);
        if (response.data.length > 0) {
          setActiveShipmentId(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to load shipments for chat', error);
      }
    };
    fetchShipments();
  }, []);

  // Initialize Socket.IO connection with JWT auth
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    // Connect with JWT token in query string (server reads it server-side)
    socketRef.current = io(SOCKET_URL, {
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('[Socket.IO] Connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('[Socket.IO] Disconnected');
    });

    socketRef.current.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on('error', (err) => {
      console.error('[Socket.IO] Error:', err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join/leave room and fetch history when active shipment changes
  useEffect(() => {
    if (!activeShipmentId || !socketRef.current) return;

    // Leave previous room and join new one
    socketRef.current.emit('join', { shipment_id: activeShipmentId });

    // Fetch chat history from REST API
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/chat/shipment/${activeShipmentId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load chat history', error);
      }
    };
    fetchHistory();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave', { shipment_id: activeShipmentId });
      }
    };
  }, [activeShipmentId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeShipmentId || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      shipment_id: activeShipmentId,
      content: newMessage.trim(),
      // sender_id from JWT is used server-side for security; this is just for UI optimistic update
      sender_id: user?.id,
    });

    setNewMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6"
    >
      {/* Sidebar: Shipment Selection */}
      <GlassCard className="w-full md:w-1/3 flex flex-col h-full p-4">
        <h2 className="text-xl font-bold text-white mb-4">Active Chats</h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {shipments.map(shipment => (
            <button
              key={shipment.id}
              onClick={() => setActiveShipmentId(shipment.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors border ${
                activeShipmentId === shipment.id
                  ? 'bg-primary/20 border-primary/50 text-white'
                  : 'bg-white/5 border-transparent text-textSecondary hover:bg-white/10'
              }`}
            >
              <div className="font-medium">Shipment {shipment.id.substring(0, 8).toUpperCase()}</div>
              <div className="text-xs opacity-70 truncate">{shipment.pickup_address} → {shipment.dropoff_address}</div>
            </button>
          ))}
          {shipments.length === 0 && (
            <div className="text-textSecondary text-sm text-center mt-10">No active shipments for chat.</div>
          )}
        </div>
      </GlassCard>

      {/* Main Chat Area */}
      <GlassCard className="w-full md:w-2/3 flex flex-col h-full p-0 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold">
              {activeShipmentId ? `Shipment ${activeShipmentId.substring(0, 8).toUpperCase()}` : 'Select a shipment'}
            </h3>
            <p className={`text-xs flex items-center ${connected ? 'text-success' : 'text-error'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-success' : 'bg-error'}`}></span>
              {connected ? 'Live — Real-time channel active' : 'Connecting...'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {!activeShipmentId && (
            <div className="h-full flex items-center justify-center text-textSecondary">
              Select a shipment from the sidebar to start chatting.
            </div>
          )}
          {messages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-[10px] opacity-60 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-surface/50">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={activeShipmentId ? 'Type a message...' : 'Select a shipment first'}
              className="flex-1 glass-input bg-white/5"
              disabled={!activeShipmentId || !connected}
            />
            <Button type="submit" disabled={!activeShipmentId || !connected} className="px-4">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ChatApp;
