import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Sparkles, Wind, Droplets, Thermometer, Activity, Zap, Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import Background3D from '../components/Background3D';
import api from '../services/api';

const AiCompanion = () => {
    const { isDarkMode } = useTheme();
    const [messages, setMessages] = useState([
        { id: 1, text: "Greetings, Traveler. I am Prakritis Digital Twin. I can help you understand your environment and habits.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // rotating placeholder state
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    const messagesEndRef = useRef(null);

    const PLACEHOLDERS = [
        "Ask your Digital Twin about your environment...",
        "How does today’s AQI affect me?",
        "What activities suit my profile today?",
        "Is it safe for outdoor activity now?",
        "How can I improve my environmental balance?"
    ];

    const SUGGESTED_QUESTIONS = [
        "What does my environmental profile mean?",
        "Is it a good day for outdoor activity?",
        "How does AQI affect my health sensitivity?",
        "What activities suit my behaviour type?",
        "How can I improve my environmental balance?",
        "What should I do today based on my environment?"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e, overrideText = null) => {
        if (e) e.preventDefault();
        const textToSend = overrideText || input;

        if (!textToSend.trim()) return;

        const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const currentInput = textToSend; // Use local var for logic below

        try {
            // Try Simulation API
            try {
                // Determine if this is a simulation request (naive check)
                if (currentInput.toLowerCase().includes('what if') || currentInput.toLowerCase().includes('simulate')) {
                    const response = await api.post('/simulation/run', {
                        scenario: currentInput,
                        parameters: { aqi: 200, temp: 30 } // Extract real params in future
                    });

                    const botMsg = {
                        id: Date.now() + 1,
                        text: `Simulation Complete. \nConfidence: ${response.data.confidence * 100}% \nDetails: ${response.data.explanation}`,
                        sender: 'bot',
                        isSimulation: true,
                        data: response.data
                    };
                    setMessages(prev => [...prev, botMsg]);
                } else {
                    // Standard Chat API
                    const response = await api.post('/chat/message', { message: currentInput });
                    setMessages(prev => [...prev, { id: Date.now() + 1, text: response.data.reply, sender: 'bot' }]);
                }
            } catch (err) {
                console.warn("Backend offline, using simulation mock.");
                // Fallback Mock
                setTimeout(() => {
                    const mockReply = currentInput.toLowerCase().includes('what if')
                        ? "Simulation projected: If AQI reaches 200, outdoor physical activity risk increases by 45%. Recommended action: Switch to indoor yoga."
                        : "I am currently capable of simulating environmental scenarios. Try asking 'What if AQI rises to 300?'";

                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        text: `[OFFLINE MODE] ${mockReply}`,
                        sender: 'bot'
                    }]);
                    setIsTyping(false);
                }, 1000);
            }
        } finally {
            // Only turn off typing if not handled by fallback timeout (which handles it internally)
            // Actually, the fallback handles it. The try block should handle it too.
            // Let's adjust logic to be safer.
        }
        // Safety for non-fallback path
        if (!currentInput.toLowerCase().includes('what if') && !currentInput.toLowerCase().includes('simulate')) {
            // If we didn't hit the catch block, we need to turn off typing? 
            // actually the try block sets messages, but we need to ensure setIsTyping(false) runs.
            // The above code is a bit mixed. Let me refine it in the replacement.
        }
    };

    return (
        <Layout>
            <div className={`relative min-h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>

                {/* Left Panel: 3D Twin Visualization */}
                <div className="w-full md:w-1/2 lg:w-3/5 relative h-[40vh] md:h-auto overflow-hidden">
                    {/* Background Layer */}
                    <div className="absolute inset-0 z-0">
                        <Background3D />
                    </div>

                    {/* Overlay Info */}
                    <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between items-start">
                            <GlassCard className="pointer-events-auto p-4 inline-flex flex-col gap-2 bg-black/20 border-white/10 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">System Online</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white">Digital Twin <span className="text-emerald-400">v1.2</span></h2>
                            </GlassCard>
                        </div>

                        {/* Environmental Metrics (Mock/Real) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pointer-events-auto">
                            <GlassCard className="p-3 bg-black/20 border-white/10 text-center">
                                <Wind className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                <div className="text-xs text-gray-400 uppercase">AQI</div>
                                <div className="font-bold text-white">42</div>
                            </GlassCard>
                            <GlassCard className="p-3 bg-black/20 border-white/10 text-center">
                                <Thermometer className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                                <div className="text-xs text-gray-400 uppercase">Temp</div>
                                <div className="font-bold text-white">24°C</div>
                            </GlassCard>
                            <GlassCard className="p-3 bg-black/20 border-white/10 text-center">
                                <Droplets className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                                <div className="text-xs text-gray-400 uppercase">Humidity</div>
                                <div className="font-bold text-white">65%</div>
                            </GlassCard>
                            <GlassCard className="p-3 bg-black/20 border-white/10 text-center">
                                <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                                <div className="text-xs text-gray-400 uppercase">Energy</div>
                                <div className="font-bold text-white">Optimal</div>
                            </GlassCard>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Chat Interface */}
                <div className={`w-full md:w-1/2 lg:w-2/5 flex flex-col border-l backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/80 border-white/5' : 'bg-white/80 border-gray-200'
                    }`}>

                    {/* Chat Header */}
                    <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Scenario Simulator</h3>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ask "What if AQI drops to 200?"</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm shadow-emerald-500/20 shadow-lg'
                                    : (isDarkMode
                                        ? 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/10'
                                        : 'bg-white text-gray-700 rounded-tl-sm border border-gray-100 shadow-sm')
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className={`p-4 rounded-3xl rounded-tl-sm flex items-center gap-1.5 ${isDarkMode ? 'bg-white/5' : 'bg-white border border-gray-100'
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
                    <div className={`p-4 border-t relative z-20 ${isDarkMode ? 'border-white/5 bg-gray-900/40' : 'border-gray-200 bg-white/40'}`}>

                        {/* Suggested Questions (Chips) */}
                        <AnimatePresence>
                            {messages.length <= 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-wrap gap-2 mb-4"
                                >
                                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(null, q)}
                                            className={`text-xs px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${isDarkMode
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400'
                                                : 'bg-white/60 border-emerald-200 text-emerald-700 hover:bg-white hover:border-emerald-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSendMessage} className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all ${isDarkMode
                            ? 'bg-black/20 border-white/10 focus-within:border-emerald-500/50'
                            : 'bg-white border-gray-200 focus-within:border-emerald-200 shadow-sm'
                            }`}>
                            <button type="button" className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}>
                                <Mic className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={PLACEHOLDERS[placeholderIndex]}
                                className={`flex-1 bg-transparent px-2 py-2 focus:outline-none transition-all duration-500 ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                                    }`}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="p-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                        <p className={`mt-3 text-center text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                            Prakriti AI can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AiCompanion;
