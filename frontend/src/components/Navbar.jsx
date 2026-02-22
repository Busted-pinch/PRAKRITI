import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Leaf, Sun, Moon, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();
    const { environmentalMode, setEnvironmentalMode } = useEnvironment();
    const { language, toggleLanguage, t } = useLanguage();
    const { user, logout } = useAuth(); // START: Added auth hook
    const navigate = useNavigate();

    // Handle scroll effect for navbar background
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Set initial language from Google Translate cookie
    useEffect(() => {
        const match = document.cookie.match(/googtrans=\/[^\/]+\/([^;]+)/);
        if (match && match[1] && match[1] !== 'en') {
            setSelectedLanguage(match[1]);
        } else {
            setSelectedLanguage('');
        }
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = [
        { name: t('nav', 'home'), path: '/' },
        { name: t('nav', 'about'), path: '/about' },
    ];

    // Filter links if needed, or add Dashboard
    const displayLinks = user
        ? [...navLinks, { name: t('nav', 'dashboard'), path: '/dashboard' }, { name: t('nav', 'digitalTwin'), path: '/companion' }]
        : navLinks;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? isDarkMode
                    ? 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800'
                    : 'bg-white/80 backdrop-blur-md border-b border-gray-200'
                : isDarkMode ? 'bg-gray-900/50 backdrop-blur-sm' : 'bg-white/30 backdrop-blur-sm'
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
                            PRAKRITI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {displayLinks.map((link) => (
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

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/profile"
                                    className={`text-sm font-medium transition-colors hover:text-emerald-500 ${location.pathname === '/profile'
                                        ? 'text-emerald-500'
                                        : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${isDarkMode
                                        ? 'border-gray-700 hover:bg-gray-800 text-gray-300'
                                        : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {t('nav', 'logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className={`text-sm font-medium transition-colors hover:text-emerald-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    {t('nav', 'login')}
                                </Link>
                                <Link
                                    to="/signup"
                                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${isDarkMode
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20'
                                        }`}
                                >
                                    {t('nav', 'getStarted')}
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button & Theme Toggle */}
                    <div className="flex items-center gap-2">
                        {/* Environmental Toggle */}
                        {user && (
                            <button
                                onClick={() => setEnvironmentalMode(!environmentalMode)}
                                className={`p-2 rounded-lg transition-all duration-300 ${environmentalMode
                                    ? 'bg-emerald-100 text-emerald-600 shadow-inner'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                title={environmentalMode ? "Disable Environmental Mode" : "Enable Environmental Mode"}
                            >
                                <Leaf className={`w-5 h-5 ${environmentalMode ? 'fill-current' : ''}`} />
                            </button>
                        )}

                        <select
                            value={selectedLanguage}
                            onChange={(e) => {
                                const language = e.target.value;
                                setSelectedLanguage(language);
                                const select = document.querySelector(".goog-te-combo");
                                if (select) {
                                    select.value = language || 'en';
                                    select.dispatchEvent(new Event("change", { bubbles: true }));
                                } else if (language) {
                                    document.cookie = `googtrans=/en/${language}; path=/`;
                                    window.location.reload();
                                } else {
                                    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                                    window.location.reload();
                                }
                            }}
                            className={`p-1.5 md:p-2 rounded-lg border transition-all duration-300 text-xs md:text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDarkMode
                                    ? selectedLanguage
                                        ? 'bg-gray-800 border-emerald-500/30 text-emerald-400'
                                        : 'bg-transparent border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800'
                                    : selectedLanguage
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                        : 'bg-transparent border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <option value="">Translate</option>
                            <option value="en">English (Default)</option>
                            <option value="hi">Hindi</option>
                            <option value="mr">Marathi</option>
                            <option value="ta">Tamil</option>
                            <option value="te">Telugu</option>
                            <option value="bn">Bengali</option>
                            <option value="kn">Kannada</option>
                            <option value="gu">Gujarati</option>
                            <option value="ml">Malayalam</option>
                            <option value="pa">Punjabi</option>
                            <option value="or">Odia</option>
                            <option value="as">Assamese</option>
                        </select>

                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode
                                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

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
                            {displayLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-lg font-medium px-4 py-2 rounded-lg ${location.pathname === link.path
                                        ? isDarkMode ? 'bg-gray-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                        : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center px-6 py-3 rounded-xl font-bold border border-gray-200 text-gray-600"
                                >
                                    {t('nav', 'logout')}
                                </button>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className={`block w-full text-center px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {t('nav', 'login')}
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="w-full text-center px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                    >
                                        {t('nav', 'getStarted')}
                                    </Link>
                                </>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
