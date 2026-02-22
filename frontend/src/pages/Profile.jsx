import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Wind, Map, User, Heart, Shield,
    Leaf, Zap, Dumbbell, AlertTriangle, Edit3,
    Gauge, Droplets, Eye, Flame, FlaskConical, CloudRain,
    BookOpen, Scale, HeartHandshake
} from 'lucide-react';
import {
    ResponsiveContainer, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip,
    PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import GlassCard from '../components/GlassCard';
import Layout from '../components/Layout';
import Achievements from '../components/Achievements';
import api from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// Cards explored display config
const CARD_META = [
    { key: 'aqi', label: 'AQI', icon: Gauge, color: 'text-blue-400' },
    { key: 'temperature', label: 'Temp', icon: Zap, color: 'text-amber-400' },
    { key: 'humidity', label: 'Humidity', icon: Droplets, color: 'text-cyan-400' },
    { key: 'wind_speed', label: 'Wind', icon: Wind, color: 'text-teal-400' },
    { key: 'uv_index', label: 'UV', icon: Flame, color: 'text-yellow-400' },
    { key: 'pm2_5', label: 'PM2.5', icon: CloudRain, color: 'text-rose-400' },
    { key: 'pm10', label: 'PM10', icon: Flame, color: 'text-orange-400' },
    { key: 'ozone', label: 'Ozone', icon: Eye, color: 'text-purple-400' },
    { key: 'nitrogen_dioxide', label: 'NO₂', icon: FlaskConical, color: 'text-pink-400' },
];

const TAB_META = [
    { key: 'env', label: 'News', icon: BookOpen, color: 'text-emerald-400' },
    { key: 'laws', label: 'Laws', icon: Scale, color: 'text-blue-400' },
    { key: 'ngo', label: 'NGOs', icon: HeartHandshake, color: 'text-amber-400' },
];

// ─── Points & Explored display (right half of header) ────────────────────────

const RewardsSummary = ({ rewards, isDarkMode }) => {
    const { total_points = 0, cards_explored = {}, tab_interactions = {} } = rewards;
    const exploredCount = Object.values(cards_explored).filter(v => v > 0).length;
    const tabsCount = Object.values(tab_interactions).filter(v => v > 0).length;
    const earned = (rewards.achievements || []).filter(a => a.unlocked).length;

    return (
        <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[280px]">
            {/* Total points badge */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border
                ${isDarkMode ? 'bg-white/[0.04] border-white/10' : 'bg-emerald-50 border-emerald-100'}`}>
                <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Total Points
                    </p>
                    <p className={`text-3xl font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {total_points.toLocaleString()}
                        <span className={`text-sm font-normal ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>pts</span>
                    </p>
                </div>
                <div className="flex gap-3 text-right">
                    <div>
                        <p className="text-lg font-black">{exploredCount}<span className={`text-xs font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>/9</span></p>
                        <p className={`text-[9px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cards</p>
                    </div>
                    <div>
                        <p className="text-lg font-black">{tabsCount}<span className={`text-xs font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>/3</span></p>
                        <p className={`text-[9px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tabs</p>
                    </div>
                    <div>
                        <p className="text-lg font-black">{earned}<span className={`text-xs font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>/16</span></p>
                        <p className={`text-[9px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Badges</p>
                    </div>
                </div>
            </div>

            {/* Cards explored mini grid */}
            <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-white/[0.03] border-white/8' : 'bg-gray-50 border-gray-100'}`}>
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Cards & Tabs Explored
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {CARD_META.map(({ key, label, icon: Icon, color }) => {
                        const count = cards_explored[key] || 0;
                        return (
                            <div key={key} title={`${label}: opened ${count}×`}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all
                                    ${count > 0
                                        ? isDarkMode ? `${color.replace('text-', 'bg-').replace('-400', '-500')}/15 border border-current/20 ${color}` : `bg-white border border-gray-200 ${color}`
                                        : isDarkMode ? 'bg-white/[0.03] border border-white/5 text-gray-600' : 'bg-white border border-gray-100 text-gray-300'
                                    }`}>
                                <Icon className="w-2.5 h-2.5" />
                                {label}
                                {count > 0 && <span className="opacity-60">×{count}</span>}
                            </div>
                        );
                    })}
                    {TAB_META.map(({ key, label, icon: Icon, color }) => {
                        const count = tab_interactions[key] || 0;
                        return (
                            <div key={key} title={`${label} tab: visited ${count}×`}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all
                                    ${count > 0
                                        ? isDarkMode ? `${color.replace('text-', 'bg-').replace('-400', '-500')}/15 border border-current/20 ${color}` : `bg-white border border-gray-200 ${color}`
                                        : isDarkMode ? 'bg-white/[0.03] border border-white/5 text-gray-600' : 'bg-white border border-gray-100 text-gray-300'
                                    }`}>
                                <Icon className="w-2.5 h-2.5" />
                                {label}
                                {count > 0 && <span className="opacity-60">×{count}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

const Profile = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode } = useEnvironment();
    const [userData, setUserData] = useState(null);
    const [rewards, setRewards] = useState({ total_points: 0, cards_explored: {}, tab_interactions: {}, achievements: [] });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '', hobbies: '', interests: '', diseases: '',
        max_physical_intensity: 'med', aqi_sensitivity: 'med'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [profileRes, envRes, rewardsRes] = await Promise.allSettled([
                    api.get('/user/profile'),
                    api.get('/environment/current?lat=28.6139&lon=77.2090'),
                    api.get('/rewards'),
                ]);

                let profileData = null;
                let envData = null;

                if (profileRes.status === 'fulfilled') profileData = profileRes.value.data;
                if (envRes.status === 'fulfilled') envData = envRes.value.data;
                if (rewardsRes.status === 'fulfilled' && rewardsRes.value.data) {
                    setRewards(rewardsRes.value.data);
                }

                if (!profileData?.persona) {
                    navigate('/assessment');
                    return;
                }

                const persona = profileData?.persona || { name: "Traveler", desc: "Your journey has just begun." };
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
                const sensitivity = profileData?.constraints?.aqi_sensitivity || 'med';
                const tolerance = calculateAQITolerance(sensitivity);

                setUserData({
                    userName: profileData?.name || "Traveler",
                    email: profileData?.email || "",
                    persona,
                    traits,
                    aqiData: [
                        { name: 'Tolerance', value: tolerance },
                        { name: 'Risk', value: 100 - tolerance },
                    ],
                    currentAQI: aqiValue,
                    hobbies: profileData?.hobbies || [],
                    interests: profileData?.interests || profileData?.selected_interests || [],
                    diseases: profileData?.diseases || [],
                    constraints: profileData?.constraints || {},
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const openEdit = () => {
        if (!userData) return;
        setEditForm({
            name: userData.userName || '',
            hobbies: (userData.hobbies || []).join(', '),
            interests: (userData.interests || []).join(', '),
            diseases: (userData.diseases || []).join(', '),
            max_physical_intensity: userData.constraints?.max_physical_intensity || 'med',
            aqi_sensitivity: userData.constraints?.aqi_sensitivity || 'med'
        });
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        try {
            const payload = {
                name: editForm.name,
                hobbies: editForm.hobbies.split(',').map(s => s.trim()).filter(Boolean),
                interests: editForm.interests.split(',').map(s => s.trim()).filter(Boolean),
                diseases: editForm.diseases.split(',').map(s => s.trim()).filter(Boolean),
                constraints: {
                    max_physical_intensity: editForm.max_physical_intensity,
                    aqi_sensitivity: editForm.aqi_sensitivity
                }
            };
            const res = await api.put('/user/profile', payload);
            if (res.data?.profile) {
                const profileData = res.data.profile;
                const persona = profileData.persona || { name: "Traveler", desc: "Your journey has just begun." };
                const tolerance = calculateAQITolerance(profileData.constraints?.aqi_sensitivity || 'med');
                setUserData(prev => ({
                    ...prev,
                    userName: profileData.name || prev.userName,
                    persona,
                    hobbies: profileData.hobbies || [],
                    interests: profileData.interests || [],
                    diseases: profileData.diseases || [],
                    constraints: profileData.constraints || prev.constraints,
                    aqiData: [
                        { name: 'Tolerance', value: tolerance },
                        { name: 'Risk', value: 100 - tolerance },
                    ]
                }));
            }
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile.");
        }
    };

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

                {/* ── Profile Header: left = identity, right = rewards summary ── */}
                <div className="mb-8">
                    <GlassCard className="p-6 md:p-8 relative" hoverEffect={false}>
                        <div className="flex flex-col md:flex-row gap-6 md:gap-10">

                            {/* Left — Avatar + name + persona */}
                            <div className="flex items-start gap-5 flex-1 min-w-0">
                                <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <User className={`w-10 h-10 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <div className="min-w-0">
                                    {/* Clickable username → opens edit modal */}
                                    <button
                                        onClick={openEdit}
                                        className="group flex items-center gap-2 text-left"
                                        title="Click to edit profile"
                                    >
                                        <h1 className={`text-2xl md:text-3xl font-bold truncate group-hover:text-emerald-500 transition-colors`}>
                                            {userData.userName}
                                        </h1>
                                        <Edit3 className={`w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </button>
                                    <p className={`text-base font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {userData.persona.name}
                                    </p>
                                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        "{userData.persona.desc}"
                                    </p>
                                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                        Click your name to edit profile
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className={`md:w-px md:self-stretch ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} hidden md:block`} />

                            {/* Right — Rewards summary */}
                            <RewardsSummary rewards={rewards} isDarkMode={isDarkMode} />
                        </div>
                    </GlassCard>
                </div>

                {/* ── Assessment Profile ─────────────────────────────────────── */}
                <div className="mb-8">
                    <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assessment Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Hobbies */}
                        <GlassCard className="p-6" hoverEffect={false}>
                            <div className="flex items-center gap-2 mb-4">
                                <Heart className={`w-5 h-5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
                                <h3 className="font-semibold text-lg">Hobbies</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {userData.hobbies.length > 0 ? userData.hobbies.map((h, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-emerald-50 text-emerald-700'}`}>{h}</span>
                                )) : <span className="text-sm text-gray-500">No hobbies added</span>}
                            </div>
                        </GlassCard>

                        {/* Interests */}
                        <GlassCard className="p-6" hoverEffect={false}>
                            <div className="flex items-center gap-2 mb-4">
                                <Leaf className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <h3 className="font-semibold text-lg">Interests</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {userData.interests.length > 0 ? userData.interests.map((interest, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-teal-50 text-teal-700'}`}>{interest}</span>
                                )) : <span className="text-sm text-gray-500">No interests added</span>}
                            </div>
                        </GlassCard>

                        {/* Health Profile */}
                        <GlassCard className="p-6" hoverEffect={false}>
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <h3 className="font-semibold text-lg">Health Profile</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Dumbbell className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <span className="text-sm">Physical Intensity: </span>
                                    <span className={`text-sm font-bold capitalize ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {userData.constraints?.max_physical_intensity || 'Medium'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wind className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <span className="text-sm">AQI Sensitivity: </span>
                                    <span className={`text-sm font-bold capitalize ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {userData.constraints?.aqi_sensitivity || 'Medium'}
                                    </span>
                                </div>
                                {userData.diseases.length > 0 && (
                                    <div className="flex items-start gap-2 mt-2">
                                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                                        <div className="flex flex-wrap gap-1">
                                            {userData.diseases.map((d, i) => (
                                                <span key={i} className={`px-2 py-0.5 rounded text-xs ${isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* ── Charts + Achievements ───────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                    {/* Trait Resonance Radar Chart */}
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

                    {/* Respiratory Resilience Pie Chart */}
                    <GlassCard className={`md:col-span-4 p-6 min-h-[400px] transition-all duration-500 ${environmentalMode
                        ? (isDarkMode ? 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] border-emerald-500/30' : 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] border-emerald-500/50')
                        : ''}`}>
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

                    {/* Achievements — replaces Leaderboard */}
                    <div className="md:col-span-4 min-h-[400px]">
                        <Achievements achievements={rewards.achievements} />
                    </div>
                </div>

                {/* ── Edit Profile Modal ──────────────────────────────────────── */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                className={`w-full max-w-lg rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-2xl overflow-y-auto max-h-[90vh]`}
                            >
                                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Hobbies (comma separated)</label>
                                        <input type="text" value={editForm.hobbies} onChange={(e) => setEditForm({ ...editForm, hobbies: e.target.value })}
                                            className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Interests (comma separated)</label>
                                        <input type="text" value={editForm.interests} onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                                            className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Health Risks (comma separated)</label>
                                        <input type="text" value={editForm.diseases} onChange={(e) => setEditForm({ ...editForm, diseases: e.target.value })}
                                            className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Physical Intensity</label>
                                            <select value={editForm.max_physical_intensity} onChange={(e) => setEditForm({ ...editForm, max_physical_intensity: e.target.value })}
                                                className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                                                <option value="low">Low</option>
                                                <option value="med">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">AQI Sensitivity</label>
                                            <select value={editForm.aqi_sensitivity} onChange={(e) => setEditForm({ ...editForm, aqi_sensitivity: e.target.value })}
                                                className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                                                <option value="low">Low (Tolerant)</option>
                                                <option value="med">Medium</option>
                                                <option value="high">High (Sensitive)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button onClick={() => setIsEditing(false)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}>
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveProfile}
                                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-400 transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </Layout>
    );
};

export default Profile;
