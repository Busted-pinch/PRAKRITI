import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Wind, Map, User, Heart, Shield,
    Leaf, Zap, Dumbbell, AlertTriangle, Check
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
import Leaderboard from '../components/Leaderboard';
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

const Profile = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode } = useEnvironment();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '', hobbies: '', interests: '', diseases: '',
        max_physical_intensity: 'med', aqi_sensitivity: 'med'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
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
        fetchProfileData();
    }, []);

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

                {/* Profile Header */}
                <div className="mb-8">
                    <GlassCard className="p-8 relative" hoverEffect={false}>
                        <div className="absolute top-6 right-6 z-10">
                            <button
                                onClick={() => {
                                    setEditForm({
                                        name: userData.userName || '',
                                        hobbies: (userData.hobbies || []).join(', '),
                                        interests: (userData.interests || []).join(', '),
                                        diseases: (userData.diseases || []).join(', '),
                                        max_physical_intensity: userData.constraints?.max_physical_intensity || 'med',
                                        aqi_sensitivity: userData.constraints?.aqi_sensitivity || 'med'
                                    });
                                    setIsEditing(true);
                                }}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isDarkMode ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Edit Profile
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                <User className={`w-10 h-10 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div className="flex-1 pr-32">
                                <h1 className="text-3xl font-bold mb-1">{userData.userName}</h1>
                                <p className={`text-lg ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} font-semibold`}>
                                    {userData.persona.name}
                                </p>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    "{userData.persona.desc}"
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                            <Activity className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assessment Profile</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Hobbies Card */}
                        <GlassCard className="p-6 h-full flex flex-col" hoverEffect={true}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-rose-500/20' : 'bg-rose-100'}`}>
                                    <Heart className={`w-5 h-5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
                                </div>
                                <h3 className="font-bold text-lg">Hobbies</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 flex-grow">
                                {userData.hobbies.length > 0 ? userData.hobbies.map((h, i) => (
                                    <span key={i} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${isDarkMode ? 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10' : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'}`}>
                                        {h}
                                    </span>
                                )) : <span className="text-sm text-gray-500 italic">No hobbies recorded</span>}
                            </div>
                        </GlassCard>

                        {/* Interests Card */}
                        <GlassCard className="p-6 h-full flex flex-col" hoverEffect={true}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <Leaf className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <h3 className="font-bold text-lg">Interests</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 flex-grow">
                                {userData.interests.length > 0 ? userData.interests.map((interest, i) => (
                                    <span key={i} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${isDarkMode ? 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10' : 'bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100'}`}>
                                        {interest}
                                    </span>
                                )) : <span className="text-sm text-gray-500 italic">No interests added</span>}
                            </div>
                        </GlassCard>

                        {/* Physical Activity Card */}
                        <GlassCard className="p-6 h-full" hoverEffect={true}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                    <Dumbbell className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <h3 className="font-bold text-lg">Physical Limits</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="opacity-70">Intensity Level</span>
                                        <span className={`font-bold capitalize ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                            {userData.constraints?.max_physical_intensity || 'Medium'}
                                        </span>
                                    </div>
                                    <div className={`h-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                                        <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: userData.constraints?.max_physical_intensity === 'high' ? '100%' : userData.constraints?.max_physical_intensity === 'med' ? '66%' : '33%' }}
                                        />
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-blue-50/50 border-blue-100/50 text-blue-800'} text-xs leading-relaxed`}>
                                    Tailoring exercise durations and intensity recommendations based on this profile.
                                </div>
                            </div>
                        </GlassCard>

                        {/* Health Profile Card */}
                        <GlassCard className="p-6 h-full" hoverEffect={true}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                                    <Shield className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                                </div>
                                <h3 className="font-bold text-lg">Health Guard</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-70">AQI Sensitivity</span>
                                    <span className={`font-bold capitalize ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {userData.constraints?.aqi_sensitivity || 'Medium'}
                                    </span>
                                </div>
                                {userData.diseases.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold opacity-50 uppercase tracking-wider">Conditions & Risks</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {userData.diseases.map((d, i) => (
                                                <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${isDarkMode ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`p-3 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'} text-xs font-semibold`}>
                                        <Check className="w-4 h-4" />
                                        No chronic conditions reported.
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>


                {/* Charts & Leaderboard */}
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

                    {/* Leaderboard */}
                    <div className="md:col-span-4 min-h-[400px]">
                        <Leaderboard />
                    </div>
                </div>



                {/* Edit Profile Modal */}
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
                                <h2 className="text-2xl font-bold mb-2">Edit Profile</h2>
                                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Update your details manually or retake the assessment for a fresh analysis.
                                </p>

                                <div className="mb-8">
                                    <button
                                        onClick={() => navigate('/assessment')}
                                        className="w-full py-4 rounded-xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all flex flex-col items-center gap-2 group"
                                    >
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block font-bold text-emerald-500 text-lg">Retake Assessment</span>
                                            <span className="text-xs opacity-60">Redefine your nature persona through guided questions</span>
                                        </div>
                                    </button>
                                </div>

                                <div className="relative mb-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className={`w-full border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`} />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className={`px-4 font-bold tracking-widest ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'}`}>Or Manual Update</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Hobbies (comma separated)</label>
                                        <input
                                            type="text"
                                            value={editForm.hobbies}
                                            onChange={(e) => setEditForm({ ...editForm, hobbies: e.target.value })}
                                            className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Interests (comma separated)</label>
                                        <input
                                            type="text"
                                            value={editForm.interests}
                                            onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                                            className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Health Risks (comma separated)</label>
                                        <input
                                            type="text"
                                            value={editForm.diseases}
                                            onChange={(e) => setEditForm({ ...editForm, diseases: e.target.value })}
                                            className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Physical Intensity</label>
                                            <select
                                                value={editForm.max_physical_intensity}
                                                onChange={(e) => setEditForm({ ...editForm, max_physical_intensity: e.target.value })}
                                                className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                                            >
                                                <option value="low">Low</option>
                                                <option value="med">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">AQI Sensitivity</label>
                                            <select
                                                value={editForm.aqi_sensitivity}
                                                onChange={(e) => setEditForm({ ...editForm, aqi_sensitivity: e.target.value })}
                                                className={`w-full p-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                                            >
                                                <option value="low">Low (Tolerant)</option>
                                                <option value="med">Medium</option>
                                                <option value="high">High (Sensitive)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-400 transition-colors"
                                    >
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
