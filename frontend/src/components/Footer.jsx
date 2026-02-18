import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = ({ simple = false }) => {
    const { isDarkMode } = useTheme();

    return (
        <footer className={`relative z-10 mt-auto border-t ${isDarkMode ? 'bg-black/20 border-white/5 text-gray-400' : 'bg-white/50 border-gray-200 text-gray-600'
            } backdrop-blur-lg transition-colors duration-300`}>
            {!simple && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="space-y-4">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} transition-colors group-hover:scale-110`}>
                                    <Leaf className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <span className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Prakriti
                                </span>
                            </Link>
                            <p className="text-sm leading-relaxed max-w-xs">
                                Harmonizing human cognition with environmental rhythms through data-driven ecological psychology.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                <Link to="/" className="hover:text-emerald-500 transition-colors">Platform</Link>
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/assessment" className="hover:text-emerald-500 transition-colors">Assessment</Link></li>
                                <li><Link to="/dashboard" className="hover:text-emerald-500 transition-colors">Dashboard</Link></li>
                                <li><Link to="/about" className="hover:text-emerald-500 transition-colors">Methodology</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Company</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/about" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact</Link></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>

                        {/* Social & Newsletter */}
                        <div>
                            <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Connect</h3>
                            <div className="flex gap-4 mb-6">
                                <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/30">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/30">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/30">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`border-t text-sm text-center ${isDarkMode ? 'border-white/5' : 'border-gray-200'} ${simple ? 'py-6 border-none' : 'mt-12 pt-8'}`}>
                &copy; {new Date().getFullYear()} Prakriti Inc. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
