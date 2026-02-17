import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Wind, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Welcome back, Traveler
                    </h1>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Your daily nature alignments are ready.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Main Stat Card */}
                    <div className={`col-span-1 md:col-span-2 p-6 rounded-3xl border ${isDarkMode
                            ? 'bg-gradient-to-br from-emerald-900/40 to-gray-900 border-white/10'
                            : 'bg-white border-gray-200 shadow-sm'
                        }`}>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Current Alignment</h2>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                                    Forest Guardian
                                </span>
                            </div>
                            <Activity className="text-emerald-500 w-6 h-6" />
                        </div>
                        <div className="space-y-4">
                            <ProgressBar label="Social Battery" value={75} isDarkMode={isDarkMode} />
                            <ProgressBar label="Physical Energy" value={40} isDarkMode={isDarkMode} />
                            <ProgressBar label="Creative Flow" value={90} isDarkMode={isDarkMode} />
                        </div>
                    </div>

                    {/* Environmental Card */}
                    <div className={`p-6 rounded-3xl border ${isDarkMode
                            ? 'bg-gray-800/50 border-white/10'
                            : 'bg-white border-gray-200 shadow-sm'
                        }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                                <Wind className="w-5 h-5" />
                            </div>
                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Air Quality</h3>
                        </div>
                        <div className="text-4xl font-bold mb-2 text-blue-500">42 <span className="text-sm text-gray-500">AQI</span></div>
                        <p className="text-sm text-green-500 font-medium">Excellent Quality</p>
                        <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Perfect condition for your high-intensity outdoor activities today.
                        </p>
                    </div>

                    {/* Time Card */}
                    <div className={`p-6 rounded-3xl border ${isDarkMode
                            ? 'bg-gray-800/50 border-white/10'
                            : 'bg-white border-gray-200 shadow-sm'
                        }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </div>
                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Circadian Phase</h3>
                        </div>
                        <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {new Date().getHours() > 17 || new Date().getHours() < 6 ? 'Rest' : 'Active'}
                        </div>
                        <p className="text-sm text-amber-500 font-medium">Melatonin Production Rising</p>
                        <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Wind down recommended in 2 hours to match your chronotype.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProgressBar = ({ label, value, isDarkMode }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{value}%</span>
        </div>
        <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

export default Dashboard;
