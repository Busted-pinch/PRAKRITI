import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Background3D from '../components/Background3D';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const { signup, loading, error } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await signup(fullName, email, password);
        if (success) {
            setSuccessMsg('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    return (
        <div className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0c0a09]' : 'bg-[#e7e5e4]'}`}>

            <div className="absolute inset-0 z-0 opacity-60">
                <Background3D />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`rounded-3xl p-8 backdrop-blur-xl border shadow-2xl ${isDarkMode
                        ? 'bg-white/5 border-white/10 shadow-emerald-900/20'
                        : 'bg-white/60 border-white/40 shadow-emerald-100/50'
                        }`}
                >
                    <div className="text-center mb-8">
                        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Join PRAKRITI</h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Start your journey towards environmental awareness.
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {successMsg}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Full Name
                            </label>
                            <div className="relative">
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${isDarkMode
                                        ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:bg-white/10'
                                        : 'bg-white border border-gray-200 text-gray-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'
                                        }`}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${isDarkMode
                                        ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:bg-white/10'
                                        : 'bg-white border border-gray-200 text-gray-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'
                                        }`}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${isDarkMode
                                        ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:bg-white/10'
                                        : 'bg-white border border-gray-200 text-gray-900 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'
                                        }`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-6 group ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                                } ${isDarkMode
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/20'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                                }`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    CREATE ACCOUNT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className={`font-semibold hover:underline ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
                            >
                                Log In
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
