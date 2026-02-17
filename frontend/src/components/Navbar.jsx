import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { isDarkMode } = useTheme();

    // Handle scroll effect for navbar background
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? isDarkMode
                    ? 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800'
                    : 'bg-white/80 backdrop-blur-md border-b border-gray-200'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} transition-colors group-hover:scale-110 duration-300`}>
                            <Leaf className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <span className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Prakriti
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-emerald-500 ${location.pathname === link.path
                                    ? 'text-emerald-500'
                                    : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <Link
                            to="/assessment"
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${isDarkMode
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                                }`}
                        >
                            Get Started
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${isDarkMode
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`md:hidden overflow-hidden border-t ${isDarkMode
                            ? 'bg-gray-900 border-gray-800'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className="px-4 py-4 space-y-4 flex flex-col">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-lg font-medium px-4 py-2 rounded-lg ${location.pathname === link.path
                                        ? isDarkMode ? 'bg-gray-800 text-emerald-400' : 'bg-gray-100 text-emerald-600'
                                        : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                to="/assessment"
                                className="w-full text-center px-6 py-3 rounded-xl font-bold bg-emerald-500 text-white"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
