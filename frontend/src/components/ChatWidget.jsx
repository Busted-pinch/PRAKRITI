import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Minimize2, Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm Prakriti AI. How can I help you connect with your environment today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && user && !ws.current) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // Use VITE_API_URL if available, otherwise fallback to localhost:8000
            // We need to strip 'http://' or 'https://' to append 'ws://' correctly
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const wsUrl = apiUrl.replace(/^http/, 'ws') + '/chat/stream';
            const token = localStorage.getItem('token');

            // Append token to query param for auth if backend supports it, 
            // or send as first message. 
            // Based on typical FastAPI + JWT, query param is common for WS.
            // Adjusting to: ws://url/chat/stream?token=...
            const fullWsUrl = `${wsUrl}?token=${token}`;

            console.log("Connecting to WS:", fullWsUrl);

            ws.current = new WebSocket(fullWsUrl);

            ws.current.onopen = () => {
                console.log("Connected to Chat WS");
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'update') {
                    // LangGraph sends updates per node execution. 
                    // content is likely the full message from that node.
                    // We'll treat each update with content as a distinct message for now, 
                    // or valid response.

                    if (data.content) {
                        setMessages(prev => {
                            // Deduplicate if needed? For now, just append.
                            // To avoid spamming bubbles if multiple nodes emit, we could check if the last message
                            // matches the current one, but assuming one main response for simplicity.
                            return [...prev, { id: Date.now(), text: data.content, sender: 'bot' }];
                        });
                        setIsTyping(false);
                    }
                } else if (data.type === 'complete') {
                    // Stream finished
                    setIsTyping(false);
                } else if (data.type === 'error') {
                    setMessages(prev => [...prev, { id: Date.now(), text: "Error: " + data.message, sender: 'bot', isError: true }]);
                    setIsTyping(false);
                }
            };

            ws.current.onclose = () => {
                console.log("Chat WS Disconnected");
                ws.current = null;
            };

            ws.current.onerror = (err) => {
                console.error("Chat WS Error:", err);
                setIsTyping(false);
            };
        }

        return () => {
            if (!isOpen && ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [isOpen, user]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsTyping(true);

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ message: input }));
        } else {
            // Fallback or Reconnect logic could go here
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), text: "Connection lost. Please try again.", sender: 'bot', isError: true }]);
                setIsTyping(false);
            }, 1000);
        }
    };

    // If no user, don't show the widget ?? Or show it and prompt login?
    // Requirement says "AI Companion Interface", likely strictly for auth users.
    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`mb-4 w-[350px] md:w-[400px] h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border backdrop-blur-xl ${isDarkMode
                            ? 'bg-gray-900/90 border-emerald-500/30'
                            : 'bg-white/90 border-emerald-100'
                            }`}
                    >
                        {/* Header */}
                        <div className={`p-4 flex justify-between items-center border-b ${isDarkMode ? 'bg-emerald-900/20 border-white/5' : 'bg-emerald-50 border-emerald-100'
                            }`}>
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-emerald-500/20' : 'bg-white'}`}>
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Prakriti AI</h3>
                                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                        </span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
                                        }`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-tr-none shadow-md'
                                        : (isDarkMode
                                            ? 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm')
                                        } ${msg.isError ? 'border-red-500/50 bg-red-500/10 text-red-500' : ''}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className={`p-3 rounded-2xl rounded-tl-none flex items-center gap-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm chat-bubble'
                                        }`}>
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className={`p-3 border-t flex items-center gap-2 ${isDarkMode ? 'border-white/5 bg-gray-900' : 'border-gray-100 bg-gray-50'
                            }`}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about air quality, health..."
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDarkMode
                                    ? 'bg-gray-800 text-white placeholder-gray-500 border-transparent'
                                    : 'bg-white text-gray-900 placeholder-gray-400 border-gray-200 border'
                                    }`}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all ${isOpen
                    ? 'bg-gray-500 rotate-90'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    }`}
            >
                {/* Glow Effect */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300 animate-pulse"></span>
                )}

                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageSquare className="w-6 h-6 text-white relative z-10" />
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
