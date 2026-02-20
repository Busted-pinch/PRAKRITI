import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const GlassCard = ({ children, className, hoverEffect = true }) => {
    const { isDarkMode } = useTheme();
    const { environmentalMode } = useEnvironment();

    return (
        <motion.div
            whileHover={hoverEffect ? { y: -8, scale: 1.02 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={twMerge(
                "group relative rounded-3xl border backdrop-blur-xl transition-all duration-500 overflow-hidden",
                isDarkMode
                    ? "bg-slate-900/60 border-white/10 shadow-xl shadow-emerald-900/20" // Dark Mode (Universal)
                    : (environmentalMode
                        ? "bg-white/80 border-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]" // Light Eco: Glowing Green Border & Shadow
                        : "bg-white/60 border-white/40 shadow-xl shadow-slate-900/5"), // Light Depleted
                className
            )}
        >
            {/* Premium Eco Hover Glow (Behind) */}
            {hoverEffect && (
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-500/20 blur-xl pointer-events-none`} />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
