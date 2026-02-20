import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Wind, Map,
    Droplets, Thermometer,
    Leaf, Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import GlassCard from '../components/GlassCard';
import MapWidget from '../components/MapWidget';
import Layout from '../components/Layout';
import DailyInsight from '../components/DailyInsight';
import NewsSection from '../components/NewsSection';
import LawPolicySection from '../components/LawPolicySection';
import api from '../services/api';

// --- Helper Functions ---
const calculatePersona = (constraints) => {
    const intensity = constraints?.max_physical_intensity || 'med';
    const sensitivity = constraints?.aqi_sensitivity || 'med';
    if (intensity === 'high' && sensitivity === 'high') return { name: "Forest Guardian", desc: "Protective of nature, high energy but sensitive to quality." };
    if (intensity === 'high' && sensitivity !== 'high') return { name: "Mountain Strider", desc: "Robust and adventurous, seeking peaks and challenges." };
    if (intensity === 'low' && sensitivity === 'high') return { name: "Urban Zen Master", desc: "Mindful and selective, thriving in controlled environments." };
    return { name: "River Wanderer", desc: "Adaptable and flowing, balanced in energy and sensitivity." };
};

const calculateAQITolerance = (sensitivity) => {
    switch (sensitivity) {
        case 'high': return 40;
        case 'med': return 70;
        case 'low': return 90;
        default: return 60;
    }
};

const RECOMMENDATIONS = [
    { id: 1, title: 'Forest Bathing', location: 'Greenwood Sanctuary', match: 98, image: 'bg-emerald-900' },
    { id: 2, title: 'Coastal Run', location: 'Azure Bay', match: 92, image: 'bg-blue-900' },
    { id: 3, title: 'Urban Gardening', location: 'Community Roof', match: 85, image: 'bg-amber-900' },
];

const Dashboard = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode, setEnvironmentalMode } = useEnvironment();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [profileRes, envRes] = await Promise.allSettled([
                    api.get('/user/profile'),
                    api.get('/environment/current?lat=28.6139&lon=77.2090')
                ]);

                let profileData = null;
                let envData = null;

                if (profileRes.status === 'fulfilled') {
                    profileData = profileRes.value.data;
                }
                if (envRes.status === 'fulfilled') {
                    envData = envRes.value.data;
                }

                if (!profileData?.persona) {
                    navigate('/assessment');
                    return;
                }

                const persona = profileData?.persona || { name: "Traveler", desc: "Your journey has just begun." };
                const aqiValue = envData?.aqi || 42;
                const sensitivity = profileData?.constraints?.aqi_sensitivity || 'med';
                const tolerance = calculateAQITolerance(sensitivity);

                setUserData({
                    userName: profileData?.name || "Traveler",
                    persona,
                    currentAQI: aqiValue,
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            </Layout>
        );
    }

    if (!userData) return null;

    return (
        <Layout>
            <div className={`p-4 md:p-8 min-h-screen ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {/* Header Greeting */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{userData.userName}</span>
                        </h1>
                    </div>

                    {/* Environmental Mode Toggle */}
                    <button
                        onClick={() => setEnvironmentalMode(!environmentalMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${environmentalMode
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                            : isDarkMode
                                ? 'bg-white/5 border-white/10 text-gray-400'
                                : 'bg-white border-gray-200 text-gray-500'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${environmentalMode ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {environmentalMode ? 'INT Mode: ON' : 'INT Mode: OFF'}
                        </span>
                    </button>
                </div>

                {/* Environmental Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <GlassCard className="p-4 flex items-center gap-3" hoverEffect={false}>
                        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                            <Wind className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div>
                            <div className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AQI</div>
                            <div className="font-bold text-lg">{userData.currentAQI || 42}</div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4 flex items-center gap-3" hoverEffect={false}>
                        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-50'}`}>
                            <Thermometer className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                        </div>
                        <div>
                            <div className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Temp</div>
                            <div className="font-bold text-lg">24°C</div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4 flex items-center gap-3" hoverEffect={false}>
                        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-50'}`}>
                            <Droplets className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                        </div>
                        <div>
                            <div className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Humidity</div>
                            <div className="font-bold text-lg">65%</div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4 flex items-center gap-3" hoverEffect={false}>
                        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                            <Zap className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        </div>
                        <div>
                            <div className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Energy</div>
                            <div className="font-bold text-lg">Optimal</div>
                        </div>
                    </GlassCard>
                </div>

                {/* Main Grid: Environmental News & Maps */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* Left Column: News Section */}
                    <div className="xl:col-span-8">
                        <NewsSection isDarkMode={isDarkMode} />
                    </div>

                    {/* Right Column: Existing Map and Insights */}
                    <div className="xl:col-span-4 space-y-6">
                        <div>
                            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Activity Map</h2>
                            <MapWidget locations={RECOMMENDATIONS} />
                        </div>
                        <DailyInsight />
                    </div>

                </div>

                {/* Laws & Agreements Full Width Section */}
                <div className="mt-8">
                    <LawPolicySection isDarkMode={isDarkMode} />
                </div>
            </div>
        </Layout>
    );
};
export default Dashboard;
