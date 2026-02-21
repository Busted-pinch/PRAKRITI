import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Wind, Map,
    Droplets, Thermometer,
    Leaf, Zap, Eye, Gauge, CloudRain, FlaskConical, Flame
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import GlassCard from '../components/GlassCard';
import Layout from '../components/Layout';
import DailyInsight from '../components/DailyInsight';
import NewsSection from '../components/NewsSection';
import LawPolicySection from '../components/LawPolicySection';
import NgoEvents from '../components/NgoEvents';
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

const getAQIStatus = (aqi) => {
    if (aqi == null) return { label: 'N/A', color: 'text-gray-400' };
    if (aqi <= 50) return { label: 'Good', color: 'text-emerald-400' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-400' };
    return { label: 'Unhealthy', color: 'text-red-400' };
};

const MetricCard = ({ icon: Icon, label, value, unit, colorClass, isDarkMode }) => (
    <GlassCard className="p-3 flex items-center gap-3 min-w-0" hoverEffect={false}>
        <div className={`p-2 rounded-xl flex-shrink-0 ${isDarkMode ? `${colorClass}/20` : `${colorClass}/10`}`}>
            <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
        <div className="min-w-0">
            <div className={`text-[10px] uppercase tracking-wider truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
            <div className="font-bold text-base leading-tight truncate">
                {value != null ? (
                    <span>{typeof value === 'number' ? value.toFixed(value % 1 !== 0 ? 1 : 0) : value}<span className="text-xs font-normal ml-0.5 opacity-70">{unit}</span></span>
                ) : (
                    <span className="text-gray-500 text-sm">—</span>
                )}
            </div>
        </div>
    </GlassCard>
);

const Dashboard = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode, setEnvironmentalMode } = useEnvironment();
    const [userData, setUserData] = useState(null);
    const [envData, setEnvData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                let lat = 28.6139;
                let lon = 77.2090;
                let locationString = "New Delhi, Delhi";
                try {
                    const locationRes = await fetch('https://ipapi.co/json/');
                    const locationData = await locationRes.json();
                    if (locationData && locationData.latitude && locationData.longitude) {
                        lat = locationData.latitude;
                        lon = locationData.longitude;
                        if (locationData.city) {
                            locationString = `${locationData.city}, ${locationData.region || locationData.country_name}`;
                        }
                    }
                } catch (e) {
                    console.log("Could not fetch IP location, falling back to default.", e);
                }

                const [profileRes, envRes] = await Promise.allSettled([
                    api.get('/user/profile'),
                    api.get(`/environment/current?lat=${lat}&lon=${lon}`)
                ]);

                let profileData = null;
                let environment = null;

                if (profileRes.status === 'fulfilled') {
                    profileData = profileRes.value.data;
                }
                if (envRes.status === 'fulfilled') {
                    environment = envRes.value.data;
                }

                if (!profileData) {
                    navigate('/assessment');
                    return;
                }

                const aqiValue = environment?.aqi ?? null;
                const sensitivity = profileData?.constraints?.aqi_sensitivity || 'med';
                const tolerance = calculateAQITolerance(sensitivity);

                let energyDesc = "Optimal";
                if (aqiValue != null) {
                    if (aqiValue > tolerance) energyDesc = "Draining";
                    else if (aqiValue > tolerance - 20) energyDesc = "Moderate";
                }

                setEnvData(environment);
                setUserData({
                    userName: profileData?.name || "Traveler",
                    persona: profileData?.persona || { name: "Traveler", desc: "Your journey has just begun." },
                    locationName: locationString,
                    energyText: energyDesc
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

    const aqiStatus = getAQIStatus(envData?.aqi);

    const metrics = [
        { icon: Gauge, label: 'AQI', value: envData?.aqi, unit: '', colorClass: 'text-blue-400' },
        { icon: Thermometer, label: 'Temp', value: envData?.temperature, unit: '°C', colorClass: 'text-amber-400' },
        { icon: Droplets, label: 'Humidity', value: envData?.humidity, unit: '%', colorClass: 'text-cyan-400' },
        { icon: Wind, label: 'Wind', value: envData?.wind_speed, unit: ' km/h', colorClass: 'text-teal-400' },
        { icon: Zap, label: 'UV Index', value: envData?.uv_index, unit: '', colorClass: 'text-yellow-400' },
        { icon: CloudRain, label: 'PM2.5', value: envData?.pm2_5, unit: ' μg/m³', colorClass: 'text-rose-400' },
        { icon: Flame, label: 'PM10', value: envData?.pm10, unit: ' μg/m³', colorClass: 'text-orange-400' },
        { icon: Eye, label: 'Ozone', value: envData?.ozone, unit: ' μg/m³', colorClass: 'text-purple-400' },
        { icon: FlaskConical, label: 'NO₂', value: envData?.nitrogen_dioxide, unit: ' μg/m³', colorClass: 'text-pink-400' },
    ];

    return (
        <Layout>
            <div className={`p-4 md:p-8 min-h-screen ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {/* Header Greeting */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{userData.userName}</span>
                        </h1>
                        <p className={`flex items-center gap-2 mt-2 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Map className="w-4 h-4" />
                            {userData.locationName}
                            {envData?.aqi != null && (
                                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'} ${aqiStatus.color}`}>
                                    AQI {envData.aqi} · {aqiStatus.label}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-3">
                        {/* Open Map Button */}
                        <button
                            onClick={() => navigate('/map')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95 ${isDarkMode
                                ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 hover:bg-teal-500/20'
                                : 'bg-teal-50 border-teal-200 text-teal-600 hover:bg-teal-100'
                                }`}
                        >
                            <Map className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Open Map</span>
                        </button>

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
                </div>

                {/* Environmental Metrics Grid — all 9 params */}
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
                    {metrics.map((m) => (
                        <MetricCard key={m.label} {...m} isDarkMode={isDarkMode} />
                    ))}
                </div>

                {/* Main Grid: News & Insights */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Column: News Section */}
                    <div className="xl:col-span-9">
                        <NewsSection isDarkMode={isDarkMode} />
                    </div>

                    {/* Right Column: Insights */}
                    <div className="xl:col-span-3 space-y-6">
                        <DailyInsight />
                    </div>
                </div>

                {/* Laws & Agreements Full Width Section */}
                <div className="mt-8 mb-8">
                    <LawPolicySection isDarkMode={isDarkMode} />
                </div>

                {/* NGO Events Section */}
                <div className="mt-8 mb-16 px-4">
                    <NgoEvents locality={userData.locationName.split(',')[0]} />
                </div>
            </div>
        </Layout>
    );
};
export default Dashboard;
