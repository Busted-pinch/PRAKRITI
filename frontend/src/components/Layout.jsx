import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Background3D from './Background3D';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

import Footer from './Footer';

const Layout = ({ children }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`relative min-h-screen w-full overflow-hidden font-sans transition-colors duration-500 flex flex-col ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'
            }`}>
            <Background3D />

            {/* Light Mode Gradient Overlay */}
            {!isDarkMode && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-sky-50 -z-10 pointer-events-none" />
            )}

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col flex-grow"
            >
                <div className="flex-grow flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 mt-16 sm:mt-0">
                    {children}
                </div>
            </motion.div>

            <Footer />
        </div>
    );
};

export default Layout;
