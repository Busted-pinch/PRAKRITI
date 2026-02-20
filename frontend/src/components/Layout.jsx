import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Background3D from './Background3D';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

import Footer from './Footer';

import { useEnvironment } from '../context/EnvironmentContext';

const Layout = ({ children }) => {
    const { isDarkMode } = useTheme();
    const { environmentalMode } = useEnvironment();

    return (
        <div className={`relative min-h-screen w-full overflow-hidden font-sans transition-colors duration-500 flex flex-col ${isDarkMode
            ? 'text-white bg-slate-950'
            : (environmentalMode ? 'text-gray-900 bg-transparent' : 'text-gray-900 bg-emerald-50/30')
            }`}>
            <Background3D />

            {/* Light Mode Gradient Overlay - Hide in Env Mode as Vanta takes over */}
            {!isDarkMode && !environmentalMode && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-teal-100/40 to-cyan-100/40 -z-10 pointer-events-none" />
            )}

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col flex-grow"
            >
                <div className="flex-grow flex flex-col min-h-0 px-4 sm:px-6 md:px-8 lg:px-12 pt-32 pb-4">
                    {children}
                </div>
            </motion.div>

            <Footer />
        </div>
    );
};

export default Layout;
