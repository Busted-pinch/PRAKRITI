import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Only show for logged-in users, and hide on the AiCompanion page itself
    if (!user) return null;
    if (location.pathname === '/companion') return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <motion.button
                onClick={() => navigate('/companion')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
                title="Chat with Digital Twin"
            >
                {/* Glow Effect */}
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300 animate-pulse"></span>
                <MessageSquare className="w-6 h-6 text-white relative z-10" />
            </motion.button>
        </div>
    );
};

export default ChatWidget;
