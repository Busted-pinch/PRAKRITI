import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wind, Map, Scale,
    Droplets, Thermometer,
    Leaf, Zap, Eye, Gauge, CloudRain, FlaskConical, Flame
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import GlassCard from '../components/GlassCard';
import Layout from '../components/Layout';

import NewsSection from '../components/NewsSection';
import LawPolicySection from '../components/LawPolicySection';
import NgoEvents from '../components/NgoEvents';
import api from '../services/api';
import ContextualBriefing from '../components/ContextualBriefing';
import EmotionalUX from '../components/EmotionalUX';

// Fire-and-forget: award points for exploration actions
const rewardAction = (action_type, action_key) => {
    api.post('/rewards/action', { action_type, action_key }).catch(() => { });
};

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

/* ─── Metric Card ─────────────────────────────────────────────
   Hover  → lifts 3px + subtle colour glow
   Click  → full-screen overlay modal pops out with detail view
   (Backend team: populate the `insight` sections inside MetricModal)
────────────────────────────────────────────────────────────── */
const MetricModal = ({ metric, onClose, isDarkMode }) => {
    // Close on ESC
    const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    const { icon: Icon, label, value, unit, colorClass, insight } = metric;
    const formattedValue = value != null
        ? (typeof value === 'number' ? value.toFixed(value % 1 !== 0 ? 1 : 0) : value)
        : '—';

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Blur + dim overlay */}
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/30 backdrop-blur-sm'
                    }`} />

                {/* Modal card — stops propagation so clicking inside doesn't close */}
                <motion.div
                    className={`relative z-10 w-full max-w-md rounded-3xl border overflow-hidden shadow-2xl
                        ${isDarkMode
                            ? 'bg-gray-900/95 border-white/10'
                            : 'bg-white border-gray-200'}`}
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
                    exit={{ scale: 0.9, opacity: 0, y: 10, transition: { duration: 0.18 } }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Gradient header bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${colorClass
                        .replace('text-', 'from-').replace('-400', '-500')
                        } via-current to-transparent`}
                        style={{ background: `linear-gradient(90deg, var(--tw-gradient-from, currentColor), transparent)` }}
                    />
                    {/* Use inline style for the bar since Tailwind can't compose dynamic gradients */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl`}
                        style={{
                            background: `linear-gradient(90deg, ${colorClass.includes('blue') ? '#3b82f6'
                                : colorClass.includes('amber') ? '#f59e0b'
                                    : colorClass.includes('cyan') ? '#06b6d4'
                                        : colorClass.includes('teal') ? '#14b8a6'
                                            : colorClass.includes('yellow') ? '#eab308'
                                                : colorClass.includes('rose') ? '#f43f5e'
                                                    : colorClass.includes('orange') ? '#f97316'
                                                        : colorClass.includes('purple') ? '#a855f7'
                                                            : colorClass.includes('pink') ? '#ec4899'
                                                                : '#10b981'} 0%, transparent 100%)`
                        }}
                    />

                    <div className="p-6 pt-7">
                        {/* Header row */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${isDarkMode ? `${colorClass.replace('text-', 'bg-').replace('-400', '-500')}/15`
                                    : `${colorClass.replace('text-', 'bg-').replace('-400', '-500')}/10`}`}>
                                    <Icon className={`w-6 h-6 ${colorClass}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                                    <p className={`text-3xl font-black ${colorClass}`}>
                                        {formattedValue}
                                        <span className={`text-base font-normal ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{unit}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-gray-500 hover:text-white hover:bg-white/10'
                                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Divider */}
                        <div className={`h-px mb-5 ${isDarkMode ? 'bg-white/8' : 'bg-gray-100'}`} />

                        {/* ── AI Insight section ── */}
                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/[0.04] border border-white/8' : 'bg-gray-50 border border-gray-100'}`}>
                                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>What This Means for You</p>
                                {insight ? (
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{insight}</p>
                                ) : (
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} animate-pulse`}>
                                        Generating personalised insight…
                                    </p>
                                )}
                            </div>
                        </div>

                        <p className={`mt-4 text-center text-[10px] ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>
                            Press ESC or tap outside to close
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const MetricCard = ({ icon: Icon, label, value, unit, colorClass, isDarkMode, insight, actionKey }) => {
    const [open, setOpen] = useState(false);
    const metric = { icon: Icon, label, value, unit, colorClass, insight };

    // Extract a raw hex/rgba for the box-shadow glow (simpler than Tailwind dynamic classes)
    const glowColor = colorClass.includes('blue') ? 'rgba(59,130,246,0.35)'
        : colorClass.includes('amber') ? 'rgba(245,158,11,0.35)'
            : colorClass.includes('cyan') ? 'rgba(6,182,212,0.35)'
                : colorClass.includes('teal') ? 'rgba(20,184,166,0.35)'
                    : colorClass.includes('yellow') ? 'rgba(234,179,8,0.35)'
                        : colorClass.includes('rose') ? 'rgba(244,63,94,0.35)'
                            : colorClass.includes('orange') ? 'rgba(249,115,22,0.35)'
                                : colorClass.includes('purple') ? 'rgba(168,85,247,0.35)'
                                    : colorClass.includes('pink') ? 'rgba(236,72,153,0.35)'
                                        : 'rgba(16,185,129,0.35)';

    const handleOpen = () => {
        setOpen(true);
        if (actionKey) rewardAction('card_open', actionKey);
    };

    return (
        <>
            <motion.div
                className="cursor-pointer"
                whileHover={{ y: -3, boxShadow: `0 8px 24px ${glowColor}` }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={handleOpen}
            >
                <GlassCard className="p-3 flex items-center gap-3 min-w-0" hoverEffect={false}>
                    <div className={`p-2 rounded-xl flex-shrink-0 ${isDarkMode ? `${colorClass}/20` : `${colorClass}/10`}`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    <div className="min-w-0">
                        <div className={`text-[10px] uppercase tracking-wider truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
                        <div className="font-bold text-base leading-tight truncate">
                            {value != null ? (
                                <span>
                                    {typeof value === 'number' ? value.toFixed(value % 1 !== 0 ? 1 : 0) : value}
                                    <span className="text-xs font-normal ml-0.5 opacity-70">{unit}</span>
                                </span>
                            ) : (
                                <span className="text-gray-500 text-sm">—</span>
                            )}
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Expanded overlay portal */}
            {open && <MetricModal metric={metric} onClose={() => setOpen(false)} isDarkMode={isDarkMode} />}
        </>
    );
};

/* ─── Tab Section ────────────────────────────────────────────
   Browser-style horizontal tab bar that collapses all three
   content sections: Environmental Intelligence, Laws & Agreements,
   and NGOs Around Me.  Card internals are 100% untouched.
──────────────────────────────────────────────────────────── */
const TAB_DEFS = [
    {
        id: 'env', label: "What's Happening Around You", Icon: Leaf
    },
    { id: 'laws', label: 'Laws & Agreements', Icon: Scale },
    { id: 'ngo', label: 'NGOs Around Me', Icon: Map },
];

const TabSection = ({ isDarkMode, userData }) => {
    const [activeTab, setActiveTab] = useState('env');

    const handleTabChange = (id) => {
        setActiveTab(id);
        rewardAction('tab_switch', id);
    };

    /* colours for the active indicator */
    const accentGrad = 'from-emerald-500 to-teal-400';
    const accentText = isDarkMode ? 'text-emerald-400' : 'text-emerald-600';

    return (
        <div className="mt-2">
            {/* ── Tab Strip ───────────────────────────────────────── */}
            <div
                className={`relative flex items-stretch rounded-2xl overflow-hidden border
                    ${isDarkMode
                        ? 'bg-white/[0.04] border-white/10 backdrop-blur-md'
                        : 'bg-white border-gray-200 shadow-sm'}`}
            >
                {TAB_DEFS.map(({ id, label, Icon }) => {
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => handleTabChange(id)}
                            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3.5
                                text-sm font-semibold tracking-wide transition-all duration-200 focus:outline-none
                                ${isActive
                                    ? accentText
                                    : isDarkMode
                                        ? 'text-gray-400 hover:text-gray-200'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">{label}</span>
                            {/* Active underline bar */}
                            {isActive && (
                                <motion.span
                                    layoutId="tab-indicator"
                                    className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-gradient-to-r ${accentGrad}`}
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Panels ──────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="mt-6"
                >
                    {activeTab === 'env' && (
                        <NewsSection isDarkMode={isDarkMode} userCity={userData?.locationName?.split(',')[0]} />
                    )}

                    {activeTab === 'laws' && (
                        <LawPolicySection isDarkMode={isDarkMode} />
                    )}

                    {activeTab === 'ngo' && (
                        <div className="mb-16 px-4">
                            <NgoEvents locality={userData.locationName.split(',')[0]} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const Dashboard = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode, setEnvironmentalMode } = useEnvironment();
    const [userData, setUserData] = useState(null);
    const [envData, setEnvData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dailyBriefing, setDailyBriefing] = useState(null);
    const [emotionalInsight, setEmotionalInsight] = useState(null);
    const [envInsights, setEnvInsights] = useState({});
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

                const [profileRes, envRes, briefingRes, uxRes] = await Promise.allSettled([
                    api.get('/user/profile'),
                    api.get(`/environment/current?lat=${lat}&lon=${lon}`),
                    api.get(`/dashboard/daily-briefing?lat=${lat}&lon=${lon}`),
                    api.get(`/dashboard/emotional-ux?lat=${lat}&lon=${lon}`),
                ]);

                let profileData = null;
                let environment = null;

                if (profileRes.status === 'fulfilled') {
                    profileData = profileRes.value.data;
                }
                if (envRes.status === 'fulfilled') {
                    environment = envRes.value.data;
                }
                if (briefingRes?.status === 'fulfilled' && briefingRes.value?.data?.briefing) {
                    setDailyBriefing(briefingRes.value.data.briefing);
                }
                if (uxRes?.status === 'fulfilled' && uxRes.value?.data?.insight) {
                    setEmotionalInsight(uxRes.value.data.insight);
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

    // Fetch env-insights separately (can be slow — 9 LLM calls) so the
    // dashboard renders immediately and insights populate in the background.
    useEffect(() => {
        if (!userData || !envData) return;
        let cancelled = false;
        const fetchInsights = async () => {
            try {
                let lat = 28.6139, lon = 77.2090;
                try {
                    const loc = await fetch('https://ipapi.co/json/');
                    const locData = await loc.json();
                    if (locData?.latitude) { lat = locData.latitude; lon = locData.longitude; }
                } catch (_) { }
                const res = await api.get(`/dashboard/env-insights?lat=${lat}&lon=${lon}`);
                if (!cancelled && res.data?.insights) {
                    setEnvInsights(res.data.insights);
                }
            } catch (e) {
                console.warn('[env-insights] fetch failed:', e);
            }
        };
        fetchInsights();
        return () => { cancelled = true; };
    }, [userData, envData]);

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
        { icon: Gauge, label: 'AQI', value: envData?.aqi, unit: '', colorClass: 'text-blue-400', insight: envInsights['aqi'], actionKey: 'aqi' },
        { icon: Thermometer, label: 'Temp', value: envData?.temperature, unit: '°C', colorClass: 'text-amber-400', insight: envInsights['temperature'], actionKey: 'temperature' },
        { icon: Droplets, label: 'Humidity', value: envData?.humidity, unit: '%', colorClass: 'text-cyan-400', insight: envInsights['humidity'], actionKey: 'humidity' },
        { icon: Wind, label: 'Wind', value: envData?.wind_speed, unit: ' km/h', colorClass: 'text-teal-400', insight: envInsights['wind_speed'], actionKey: 'wind_speed' },
        { icon: Zap, label: 'UV Index', value: envData?.uv_index, unit: '', colorClass: 'text-yellow-400', insight: envInsights['uv_index'], actionKey: 'uv_index' },
        { icon: CloudRain, label: 'PM2.5', value: envData?.pm2_5, unit: ' μg/m³', colorClass: 'text-rose-400', insight: envInsights['pm2_5'], actionKey: 'pm2_5' },
        { icon: Flame, label: 'PM10', value: envData?.pm10, unit: ' μg/m³', colorClass: 'text-orange-400', insight: envInsights['pm10'], actionKey: 'pm10' },
        { icon: Eye, label: 'Ozone', value: envData?.ozone, unit: ' μg/m³', colorClass: 'text-purple-400', insight: envInsights['ozone'], actionKey: 'ozone' },
        { icon: FlaskConical, label: 'NO₂', value: envData?.nitrogen_dioxide, unit: ' μg/m³', colorClass: 'text-pink-400', insight: envInsights['nitrogen_dioxide'], actionKey: 'nitrogen_dioxide' },
    ];

    return (
        <Layout>
            <div className={`p-4 md:p-8 min-h-screen ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {/* Header Greeting */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black flex items-center gap-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{userData.userName}</span>
                        </h1>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-3">
                            <p className={`flex items-center gap-2 font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <Map className="w-4 h-4 text-emerald-500" />
                                {userData.locationName}
                            </p>
                            <div className={`hidden md:block w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                    {userData.persona.name}
                                </span>
                                <span className={`text-sm italic opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    "{userData.persona.desc}"
                                </span>
                            </div>
                            {envData?.aqi != null && (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-black ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'} ${aqiStatus.color}`}>
                                    AQI {envData.aqi} · {aqiStatus.label}
                                </div>
                            )}
                        </div>
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

                {/* AI Insight Cards — Daily Briefing + Emotional UX */}
                {(dailyBriefing || emotionalInsight) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <ContextualBriefing briefing={dailyBriefing} isDarkMode={isDarkMode} />
                        <EmotionalUX insight={emotionalInsight} isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Environmental Metrics Grid — always visible */}
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-6">
                    {metrics.map((m) => (
                        <MetricCard key={m.label} {...m} isDarkMode={isDarkMode} insight={m.insight} actionKey={m.actionKey} />
                    ))}
                </div>

                {/* ── Tab Bar ─────────────────────────────────────────────── */}
                <TabSection isDarkMode={isDarkMode} userData={userData} />
            </div>
        </Layout>
    );
};
export default Dashboard;
