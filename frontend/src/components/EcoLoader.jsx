import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Wind, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const EcoLoader = ({ text = "Calibrating Environment..." }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-xl transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'
            }`}>
            <div className="relative w-24 h-24 mb-8">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 rounded-full border-2 border-dashed ${isDarkMode ? 'border-emerald-500/30' : 'border-emerald-600/30'
                        }`}
                />

                {/* Inner Ring (Reverse) */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-3 rounded-full border border-dotted ${isDarkMode ? 'border-blue-400/30' : 'border-blue-500/30'
                        }`}
                />

                {/* Center Pulse */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Leaf className={`w-10 h-10 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </motion.div>

                {/* Orbiting Particle */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                >
                    <div className={`w-2 h-2 rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 ${isDarkMode ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-emerald-600 shadow-[0_0_10px_#059669]'
                        }`} />
                </motion.div>
            </div>

            {/* Technical Text */}
            <h2 className={`text-lg font-medium tracking-widest uppercase mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                {text}
            </h2>

            {/* Analysis Lines */}
            <div className="flex gap-1 h-4 items-end">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ height: [4, 16, 8, 12, 4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        className={`w-1 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default EcoLoader;
