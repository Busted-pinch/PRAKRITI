import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Activity, Wind, Sun, Moon, Map, Info,
    Droplets, Thermometer, Navigation, Heart,
    Leaf, Zap, Clock
} from 'lucide-react';
import {
    ResponsiveContainer, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip,
    PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import GlassCard from '../components/GlassCard';
import MapWidget from '../components/MapWidget';
import Layout from '../components/Layout';
import api from '../services/api';

// --- Helper Functions to Derive Data ---

const calculatePersona = (constraints) => {
    const intensity = constraints?.max_physical_intensity || 'med';
    const sensitivity = constraints?.aqi_sensitivity || 'med';

    if (intensity === 'high' && sensitivity === 'high') return { name: "Forest Guardian", desc: "Protective of nature, high energy but sensitive to quality." };
    if (intensity === 'high' && sensitivity !== 'high') return { name: "Mountain Strider", desc: "Robust and adventurous, seeking peaks and challenges." };
    if (intensity === 'low' && sensitivity === 'high') return { name: "Urban Zen Master", desc: "Mindful and selective, thriving in controlled environments." };
    return { name: "River Wanderer", desc: "Adaptable and flowing, balanced in energy and sensitivity." };
};

const calculateTraits = (answers) => {
    // Default if no answers
    if (!answers || !answers.length) return [
        { subject: 'Resilience', A: 120, fullMark: 150 },
        { subject: 'Adaptability', A: 98, fullMark: 150 },
        { subject: 'Empathy', A: 86, fullMark: 150 },
        { subject: 'Awareness', A: 99, fullMark: 150 },
        { subject: 'Energy', A: 85, fullMark: 150 },
        { subject: 'Curiosity', A: 65, fullMark: 150 },
    ];

    // Simple mapping of Likert 1-5 to 0-150 scale
    // We have 10 questions. usage:
    // Q1, Q7 -> Resilience
    // Q2, Q8 -> Adaptability
    // Q3 -> Awareness
    // Q4 -> Energy
    // Q5 -> Empathy
    // Q6, Q9 -> Curiosity

    // safe access
    const getVal = (idx) => (answers[idx] || 3) * 30;

    return [
        { subject: 'Resilience', A: (getVal(0) + getVal(6)) / 2, fullMark: 150 },
        { subject: 'Adaptability', A: (getVal(1) + getVal(7)) / 2, fullMark: 150 },
        { subject: 'Empathy', A: getVal(4), fullMark: 150 },
        { subject: 'Awareness', A: getVal(2), fullMark: 150 },
        { subject: 'Energy', A: getVal(3), fullMark: 150 },
        { subject: 'Curiosity', A: (getVal(5) + getVal(8)) / 2, fullMark: 150 },
    ];
};

const calculateAQITolerance = (sensitivity) => {
    switch (sensitivity) {
        case 'high': return 40;
        case 'med': return 70;
        case 'low': return 90;
        default: return 60;
    }
};

const TRAIT_DATA = [
    { subject: 'Resilience', A: 120, fullMark: 150 },
    { subject: 'Adaptability', A: 98, fullMark: 150 },
    { subject: 'Empathy', A: 86, fullMark: 150 },
    { subject: 'Awareness', A: 99, fullMark: 150 },
    { subject: 'Energy', A: 85, fullMark: 150 },
    { subject: 'Curiosity', A: 65, fullMark: 150 },
];

const AQI_DATA = [
    { name: 'Tolerance', value: 75 },
    { name: 'Remaining', value: 25 },
];

const RECOMMENDATIONS = [
    { id: 1, title: 'Forest Bathing', location: 'Greenwood Sanctuary', match: 98, image: 'bg-emerald-900' },
    { id: 2, title: 'Coastal Run', location: 'Azure Bay', match: 92, image: 'bg-blue-900' },
    { id: 3, title: 'Urban Gardening', location: 'Community Roof', match: 85, image: 'bg-amber-900' },
];

const INSIGHTS = [
    { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: 'High Energy Peak', desc: '06:00 AM - 10:00 AM' },
    { icon: <Wind className="w-5 h-5 text-blue-400" />, title: 'AQI Sensitive', desc: 'Avoid outdoor cardio when AQI > 100' },
    { icon: <Leaf className="w-5 h-5 text-emerald-400" />, title: 'Nature Affinity', desc: 'Thrives in dense vegetation zones' },
];

// ... imports
import Leaderboard from '../components/Leaderboard';
import Achievements from '../components/Achievements';
import DailyInsight from '../components/DailyInsight';

// ... (keep helper functions and constants)

const Dashboard = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode, setEnvironmentalMode } = useEnvironment();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ... (keep useEffect for fetching data)
    useEffect(() => {
        const fetchDashboardData = async () => {
            // ... (same implementation as before)
            try {
                setLoading(true);
                // Fetch User Profile and Environment Data in parallel
                // Adding default lat/lon for now (User's location or default to 0,0)
                const [profileRes, envRes] = await Promise.allSettled([
                    api.get('/user/profile'),
                    api.get('/environment/current?lat=28.6139&lon=77.2090') // Default to New Delhi or generic
                ]);

                let profileData = null;
                let envData = null;

                if (profileRes.status === 'fulfilled') {
                    profileData = profileRes.value.data;
                }

                if (envRes.status === 'fulfilled') {
                    envData = envRes.value.data;
                }

                // Redirect to Assessment if no persona (New User)
                if (!profileData?.persona) {
                    navigate('/assessment');
                    return;
                }

                const defaultPersona = {
                    name: "Traveler",
                    desc: "Your journey has just begun."
                };

                const persona = profileData?.persona || defaultPersona;
                // Use profile traits if available, otherwise empty or default? 
                // Using empty array might break charts if they expect data. 
                // Let's use the provided defaultTraits for safety if backend returns null traits but has persona (edge case)
                const defaultTraits = [
                    { subject: 'Resilience', A: 120, fullMark: 150 },
                    { subject: 'Adaptability', A: 98, fullMark: 150 },
                    { subject: 'Empathy', A: 86, fullMark: 150 },
                    { subject: 'Awareness', A: 99, fullMark: 150 },
                    { subject: 'Energy', A: 85, fullMark: 150 },
                    { subject: 'Curiosity', A: 65, fullMark: 150 },
                ];
                const traits = (profileData?.traits && profileData.traits.length > 0) ? profileData.traits : defaultTraits;

                const aqiValue = envData?.aqi || 42;

                // Calculate tolerance based on sensitivity
                const sensitivity = profileData?.constraints?.aqi_sensitivity || 'med';
                const tolerance = calculateAQITolerance(sensitivity);

                setUserData({
                    userName: profileData?.name || "Traveler",
                    persona,
                    traits,
                    aqiData: [
                        { name: 'Tolerance', value: tolerance },
                        { name: 'Risk', value: 100 - tolerance },
                    ],
                    currentAQI: aqiValue,
                    hobbies: profileData?.hobbies || [],
                    interests: profileData?.interests || []
                });

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const COLORS = ['#10b981', isDarkMode ? '#333' : '#e5e7eb'];

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
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{userData.userName}</span>
                        </h1>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Your <span className="font-semibold text-emerald-500">{userData.persona.name}</span> eco-profile is active.
                        </p>
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

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Row 1: Charts & Leaderboard */}
                    {/* Radar Chart */}
                    <GlassCard className="md:col-span-4 p-6 min-h-[400px] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-emerald-500" />
                                    Trait Resonance
                                </h3>
                            </div>
                            <div className="h-[250px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={userData.traits}>
                                        <PolarGrid stroke={isDarkMode ? "#444" : "#e5e7eb"} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#9CA3AF' : '#4B5563', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                        <Radar name="My Traits" dataKey="A" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.3} />
                                        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderRadius: '12px', border: 'none' }} itemStyle={{ color: '#10b981' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm italic opacity-70">"{userData.persona.desc}"</p>
                        </div>
                    </GlassCard>

                    {/* Pie Chart */}
                    <GlassCard className={`md:col-span-4 p-6 min-h-[400px] transition-all duration-500 ${environmentalMode
                            ? (isDarkMode ? 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] border-emerald-500/30' : 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] border-emerald-500/50')
                            : ''
                        }`}>
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
                            <Wind className="w-5 h-5 text-blue-500" />
                            Respiratory Resilience
                        </h3>
                        <div className="h-[200px] relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={userData.aqiData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" stroke="none">
                                        {userData.aqiData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold">{userData.aqiData[0].value}%</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Tolerance</span>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Current AQI (Local)</span>
                                <span className="font-mono font-bold text-emerald-500">{userData.currentAQI} (Good)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(userData.currentAQI, 100)}%` }} className="h-full bg-gradient-to-r from-emerald-400 to-teal-600" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Leaderboard (New) */}
                    <div className="md:col-span-4 min-h-[400px]">
                        <Leaderboard />
                    </div>

                    {/* Row 2: Map & Right Sidebar */}
                    <div className="md:col-span-8 space-y-6">
                        {/* Map */}
                        <div>
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Activity Map</h2>
                            <MapWidget locations={RECOMMENDATIONS} />
                        </div>

                        {/* Recommendations Carousel */}
                        <div>
                            <div className="flex justify-between items-end mb-6">
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Curated for You</h2>
                                <button className="text-emerald-500 text-sm font-medium hover:text-emerald-400">View All</button>
                            </div>
                            <div className="flex overflow-x-auto gap-6 pb-8 custom-scrollbar snap-x">
                                {RECOMMENDATIONS.map((item) => (
                                    <GlassCard key={item.id} className="min-w-[280px] p-0 overflow-hidden snap-center group cursor-pointer">
                                        <div className={`h-32 ${item.image} relative`}>
                                            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                                                {item.match}% Match
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                                <Map className="w-4 h-4" /> {item.location}
                                            </div>
                                            <button className={`w-full py-2 rounded-lg border text-sm font-medium transition-colors ${isDarkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                                Schedule
                                            </button>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Daily Insight (New) */}
                        <DailyInsight />

                        {/* Achievements (New) */}
                        <Achievements />
                    </div>

                </div>
            </div>
        </Layout>
    );
};
export default Dashboard;
