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
import GlassCard from '../components/GlassCard';
import MapWidget from '../components/MapWidget';
import Layout from '../components/Layout';

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

const Dashboard = () => {
    const { isDarkMode } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize data from navigation state or local storage/defaults
    useEffect(() => {
        try {
            console.log("Dashboard received state:", location.state);
            if (location.state?.submission) {
                const { submission } = location.state;
                const persona = calculatePersona(submission.constraints);
                const traits = calculateTraits(submission.answers);
                const tolerance = calculateAQITolerance(submission.constraints?.aqi_sensitivity);

                setUserData({
                    persona,
                    traits,
                    aqiData: [
                        { name: 'Tolerance', value: tolerance },
                        { name: 'Risk', value: 100 - tolerance },
                    ],
                    hobbies: submission.hobbies || [],
                    interests: submission.selected_interests || []
                });
            } else {
                // Fallback / Demo Mode (Rich Static Data)
                console.log("No submission data found, using rich fallback.");
                setUserData({
                    persona: {
                        name: "Forest Guardian",
                        desc: "You possess a deep-rooted resilience and high adaptability. Like an ancient forest, you provide stability to those around you while maintaining a complex, thriving inner ecosystem."
                    },
                    traits: TRAIT_DATA,
                    aqiData: AQI_DATA,
                    hobbies: ['Hiking', 'Reading', 'Gardening'],
                    interests: ['Sustainability', 'Ecology']
                });
            }
        } catch (error) {
            console.error("Error processing dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [location.state]);

    // Data for charts
    const COLORS = ['#10B981', isDarkMode ? '#333' : '#e5e7eb'];

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            </Layout>
        );
    }

    if (!userData) return null; // Should not happen with fallback

    return (
        <Layout>
            <div className={`p-4 md:p-8 min-h-screen ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Traveler</span>
                        </h1>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Your <span className="font-semibold text-emerald-500">{userData.persona.name}</span> eco-profile is active.
                        </p>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* 1. Persona Card (Radar Chart) */}
                    <GlassCard className="md:col-span-4 p-6 min-h-[400px] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-emerald-500" />
                                    Trait Resonance
                                </h3>
                                <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                            </div>
                            <div className="h-[250px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={userData.traits}>
                                        <PolarGrid stroke={isDarkMode ? "#444" : "#e5e7eb"} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#9CA3AF' : '#4B5563', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                        <Radar
                                            name="My Traits"
                                            dataKey="A"
                                            stroke="#10B981"
                                            strokeWidth={3}
                                            fill="#10B981"
                                            fillOpacity={0.3}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ color: '#10B981' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm italic opacity-70">
                                "{userData.persona.desc}"
                            </p>
                        </div>
                    </GlassCard>

                    {/* 2. AQI Tolerance (Pie Chart) */}
                    <GlassCard className="md:col-span-4 p-6 min-h-[400px]">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
                            <Wind className="w-5 h-5 text-blue-500" />
                            Respiratory Resilience
                        </h3>
                        <div className="h-[200px] relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userData.aqiData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
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
                                <span className="font-mono font-bold text-emerald-500">42 (Good)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '42%' }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* 3. Behavior Insights (Using Static Data for now, can be personalized later) */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                        {INSIGHTS.map((insight, idx) => (
                            <GlassCard key={idx} className="p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300 cursor-default flex-1 justify-center">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    {insight.icon}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{insight.title}</h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{insight.desc}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-8">
                    <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Activity Map</h2>
                    <MapWidget locations={RECOMMENDATIONS} />
                </div>

                {/* Recommendations Section */}
                <div className="mt-8">
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
                                    <button className={`w-full py-2 rounded-lg border text-sm font-medium transition-colors ${isDarkMode
                                        ? 'border-white/10 text-white hover:bg-white/5'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}>
                                        Schedule
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
