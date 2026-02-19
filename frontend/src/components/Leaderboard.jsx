import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, MapPin, Crown, Medal, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';
import api from '../services/api';

const Leaderboard = () => {
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('global');
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'global', label: 'Global', icon: <Trophy className="w-4 h-4" /> },
        { id: 'local', label: 'Local', icon: <MapPin className="w-4 h-4" /> },
        { id: 'friends', label: 'Friends', icon: <Users className="w-4 h-4" /> },
    ];

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // Try fetching real data, fall back to mock if backend fails/unauthorized
                try {
                    const response = await api.get(`/leaderboard/${activeTab}`);
                    if (response.data && response.data.length > 0) {
                        setLeaders(response.data);
                    } else {
                        throw new Error("No data");
                    }
                } catch (err) {
                    console.warn(`Failed to fetch ${activeTab} leaderboard, utilizing mock data.`);
                    // Mock Data
                    const mockData = Array.from({ length: 5 }).map((_, i) => ({
                        rank: i + 1,
                        name: activeTab === 'friends' ? `Friend ${i + 1}` : `EcoWarrior ${Math.floor(Math.random() * 1000)}`,
                        score: 10000 - (i * 500) - Math.floor(Math.random() * 200),
                        avatar: null
                    }));
                    setLeaders(mockData);
                }
            } catch (error) {
                console.error("Leaderboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [activeTab]);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className={`font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>#{rank}</span>;
    };

    return (
        <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-emerald-500" />
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Leaderboard</h3>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100/50 dark:bg-black/20 p-1 rounded-xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-800 shadow-sm text-emerald-600 dark:text-emerald-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence mode='wait'>
                            {leaders.map((leader, index) => (
                                <motion.div
                                    key={leader.name + activeTab}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between p-3 rounded-xl hover:bg-emerald-500/5 transition-colors ${isDarkMode ? 'hover:bg-white/5' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 flex justify-center">
                                            {getRankIcon(leader.rank)}
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                                            }`}>
                                            <User className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {leader.name}
                                            </div>
                                            <div className="text-xs text-gray-400">Level {Math.floor(leader.score / 1000) + 1}</div>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {leader.score.toLocaleString()} XP
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div className={`p-3 border-t text-center text-xs ${isDarkMode ? 'border-white/5 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                Top 3 earn verification badges
            </div>
        </GlassCard>
    );
};

export default Leaderboard;
