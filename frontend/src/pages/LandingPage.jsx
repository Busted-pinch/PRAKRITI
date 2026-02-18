import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Activity, Shield, Zap, Wind,
    Brain, Leaf, Layers, CheckCircle, Globe,
    ThermometerSun, Droplets
} from 'lucide-react';
import Background3D from '../components/Background3D';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import Footer from '../components/Footer';
import EcoLoader from '../components/EcoLoader';

const LandingPage = () => {
    const { isDarkMode, setIsDarkMode } = useTheme();
    const { environmentalMode, setEnvironmentalMode } = useEnvironment();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleStartAssessment = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate technical calibration
        setTimeout(() => {
            navigate('/assessment');
        }, 2000);
    };

    const toggleMode = () => {
        const newMode = !environmentalMode;
        setEnvironmentalMode(newMode);
        if (newMode) {
            setIsDarkMode(false); // Force Light Mode for "Feel Good" UI
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div className={`relative min-h-screen overflow-hidden transition-colors duration-2000 font-sans ${environmentalMode
            ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100' // Healthy: Vibrant Ocean Breeze
            : (isDarkMode ? 'bg-[#0c0a09]' : 'bg-[#e7e5e4]') // Depleted: Warm/Stone Grey
            }`}>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && <EcoLoader text="Initializing Sensor Array..." />}
            </AnimatePresence>

            {/* 3D Background - Always Present */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-60' // Slightly more visible in light mode now
                }`}>
                <Background3D />
            </div>

            {/* Environmental Life Elements (Silhouettes) - ON Mode Only */}
            <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-2000 ${environmentalMode ? 'opacity-100' : 'opacity-0'}`}>
                {/* Tree Silhouette Left */}
                <div className="absolute bottom-[-5%] left-[-5%] w-96 h-96 opacity-[0.03] transform mix-blend-multiply dark:mix-blend-screen text-emerald-900 dark:text-emerald-100">
                    <Leaf className="w-full h-full" />
                </div>
                {/* Tree Silhouette Right */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] opacity-[0.04] transform scale-x-[-1] mix-blend-multiply dark:mix-blend-screen text-teal-900 dark:text-teal-100">
                    <Leaf className="w-full h-full" />
                </div>
                {/* Bird Silhouettes REMOVED per user request */}
            </div>

            {/* Ambient Atmosphere Overlay (Mode Response) */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 z-0 ${environmentalMode
                ? 'bg-gradient-to-t from-teal-500/10 via-transparent to-emerald-500/5' // Vertical gradient overlay
                : 'bg-transparent'
                }`} />

            {/* Main Content */}
            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center min-h-[90vh]">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center"
                >
                    {/* Environmental Mode Toggle */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-12 relative flex flex-col items-center"
                    >
                        {/* Call to Action for Environmental Mode - Only visible when OFF */}
                        {!environmentalMode && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mb-4 text-xs font-medium tracking-widest uppercase flex items-center gap-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                                <span>See a healthier environment</span>
                                <ArrowRight className="w-3 h-3 animate-pulse" />
                            </motion.div>
                        )}

                        <button
                            onClick={toggleMode}
                            className={`group relative flex items-center gap-3 px-2 py-2 pr-6 rounded-full border backdrop-blur-md transition-all duration-500 ${environmentalMode
                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]'
                                : (isDarkMode ? 'bg-stone-900/50 border-stone-800 hover:bg-stone-800' : 'bg-stone-200/50 border-stone-300 hover:bg-stone-200')
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${environmentalMode ? 'bg-emerald-500 text-white rotate-180' : (isDarkMode ? 'bg-stone-800 text-stone-500' : 'bg-stone-300 text-stone-500')
                                }`}>
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className={`text-[10px] font-bold tracking-widest uppercase mb-0.5 ${environmentalMode ? 'text-emerald-500' : (isDarkMode ? 'text-stone-500' : 'text-stone-500')
                                    }`}>
                                    Environmental Mode
                                </div>
                                <div className={`text-sm font-semibold transition-colors duration-300 ${environmentalMode ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-stone-400' : 'text-stone-600')
                                    }`}>
                                    {environmentalMode ? 'HEALTHY' : 'DEPLETED'}
                                </div>
                            </div>

                            {/* Pulse Effect when Active */}
                            {environmentalMode && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                            )}
                        </button>
                    </motion.div>

                    {/* AQI Data Widget - Glassmorphism */}
                    <motion.div
                        variants={itemVariants}
                        className={`mb-8 flex flex-col items-center justify-center p-4 rounded-2xl border backdrop-blur-md transition-all duration-1000 ${environmentalMode
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 w-64'
                            : (isDarkMode ? 'bg-stone-900/60 border-stone-800 text-stone-500 w-48' : 'bg-stone-200/60 border-stone-300 text-stone-500 w-48')
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <Wind className={`w-5 h-5 ${environmentalMode ? 'text-emerald-600' : 'opacity-50'}`} />
                            <span className="text-xs font-bold tracking-widest opacity-70">AIR QUALITY INDEX</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-bold tracking-tighter ${environmentalMode ? 'text-emerald-700' : (isDarkMode ? 'text-stone-300' : 'text-stone-600')}`}>
                                {environmentalMode ? '18' : '85'}
                            </span>
                            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${environmentalMode
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-stone-500/10 text-stone-500'}`}>
                                {environmentalMode ? 'HEALTHY' : 'MODERATE'}
                            </span>
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className={`text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-8 leading-[1.1] ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                    >
                        <span className={`block transition-all duration-1000 ${environmentalMode ? 'tracking-normal' : 'tracking-tight'
                            }`}>
                            Discover Your
                        </span>
                        <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r transition-all duration-1000 ${environmentalMode
                            ? 'from-emerald-400 via-teal-400 to-cyan-400'
                            : (isDarkMode ? 'from-white via-gray-300 to-gray-500' : 'from-gray-900 via-gray-700 to-gray-500')
                            }`}>
                            Environmental Profile
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                    >
                        {environmentalMode
                            ? "Experience a harmonious synchronization between your cognitive rhythms and the natural world."
                            : "Prakriti utilizes advanced environmental intelligence to map your personal constraints against nature's variables."}
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-6 items-center"
                    >
                        <Link
                            to="/assessment"
                            onClick={handleStartAssessment}
                            className={`group relative px-10 py-5 rounded-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:-translate-y-1 ${environmentalMode
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_20px_60px_-10px_rgba(16,185,129,0.7)]'
                                : (isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black')
                                }`}
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />

                            {/* Internal Glow for "Dynamic" feel without Glass */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-emerald-300 via-teal-300 to-white blur-xl pointer-events-none mix-blend-overlay" />

                            <span className="relative z-10 flex items-center gap-3 font-bold tracking-wide">
                                START ANALYSIS <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            to="/about"
                            className={`px-8 py-5 rounded-sm font-medium tracking-wide transition-all ${isDarkMode
                                ? 'text-gray-400 hover:text-white'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            METHODOLOGY
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* How It Works Section */}
            <div className={`py-24 relative z-10 transition-colors duration-1000 ${environmentalMode ? 'bg-emerald-50/50' : (isDarkMode ? 'bg-black/20' : 'bg-white/40')
                } backdrop-blur-lg`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${isDarkMode && !environmentalMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDarkMode && !environmentalMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            A seamless journey from cognitive assessment to environmental alignment.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connection Line (Desktop) */}
                        <div className={`hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] h-0.5 ${environmentalMode ? 'bg-emerald-200' : (isDarkMode ? 'bg-white/10' : 'bg-gray-200')
                            }`}></div>

                        <StepCard
                            number="01"
                            title="Cognitive Mapping"
                            description="Answer 10 adaptive questions to determine your abstract thinking and social recharge energy."
                            icon={<Brain className="w-6 h-6" />}
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                        <StepCard
                            number="02"
                            title="Biometric Sync"
                            description="Input your physical parameters and health constraints to calibrate your activity threshold."
                            icon={<Activity className="w-6 h-6" />}
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                        <StepCard
                            number="03"
                            title="Environmental Lock"
                            description="Receive your personalized dashboard with real-time AQI and circadian phase alignment."
                            icon={<Layers className="w-6 h-6" />}
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                    </div>
                </div>
            </div>

            {/* The Science / Features Grid */}
            <div className={`py-24 relative z-10 transition-colors duration-1000 ${environmentalMode ? 'bg-white/60' : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${isDarkMode && !environmentalMode ? 'text-white' : 'text-gray-900'}`}>The Science of Prakriti</h2>
                        <p className={`text-lg max-w-2xl ${isDarkMode && !environmentalMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Drawing from ecological psychology and chronobiology.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Activity className="w-6 h-6 text-emerald-400" />}
                            title="Biometric Analog"
                            description="Map your physical intensity and health markers to natural elements."
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-blue-400" />}
                            title="Environmental Sync"
                            description="Align your lifestyle with your AQI sensitivity and outdoor affinity."
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-amber-400" />}
                            title="Cognitive Flow"
                            description="Understand your abstract thinking properties and social battery recharge rates."
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                        <FeatureCard
                            icon={<Wind className="w-6 h-6 text-cyan-400" />}
                            title="Atmospheric Analysis"
                            description="Real-time air quality data integration for optimal activity planning."
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                        <FeatureCard
                            icon={<CheckCircle className="w-6 h-6 text-violet-400" />}
                            title="Routine Optimization"
                            description="Structure vs. Flexibility analysis to design your perfect day."
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                        <FeatureCard
                            icon={<Leaf className="w-6 h-6 text-lime-400" />}
                            title="Nature Immersion"
                            description="Curated hobby suggestions that reconnect you with the physical world."
                            isDarkMode={isDarkMode}
                            environmentalMode={environmentalMode}
                        />
                    </div>
                </div>
            </div>

            {/* Technical Grid Background Details */}
            <div className={`absolute bottom-0 left-0 right-0 h-px ${isDarkMode
                ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                : 'bg-gradient-to-r from-transparent via-gray-900/10 to-transparent'
                }`} />
            <div className={`absolute top-0 left-0 bottom-0 w-px ${isDarkMode
                ? 'bg-gradient-to-b from-transparent via-white/5 to-transparent'
                : 'bg-gradient-to-b from-transparent via-gray-900/5 to-transparent'
                }`} />

            {/* Footer */}
            {/* Footer */}
            <div className="relative z-10 w-full">
                <Footer />
            </div>
        </div>
    );
};

const StepCard = ({ number, title, description, icon, isDarkMode, environmentalMode }) => (
    <motion.div
        whileHover={{ y: -12, scale: 1.03 }} // Stronger lift
        className={`group relative p-8 rounded-3xl border text-center transition-all duration-500 backdrop-blur-xl overflow-hidden ${isDarkMode
            ? 'bg-stone-900/60 border-stone-800' // Dark Mode (Universal)
            : (environmentalMode ? 'bg-white/70 border-emerald-200 shadow-xl shadow-teal-900/10' : 'bg-stone-100/80 border-stone-300') // Light Eco vs Light Depleted
            }`}
    >
        {/* Premium Eco Hover Glow (Behind - Stronger) */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-emerald-400/30 via-teal-400/30 to-blue-500/30 blur-2xl pointer-events-none`} />

        <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-colors duration-500 shadow-sm ${isDarkMode
            ? 'bg-stone-900 border-stone-700 text-stone-400 group-hover:bg-stone-700'
            : (environmentalMode ? 'bg-teal-50 text-teal-700 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white' : 'bg-stone-200 border-stone-300 text-stone-600 group-hover:bg-stone-300')
            }`}>
            {icon}
        </div>
        <div className={`absolute top-6 right-8 text-5xl font-bold opacity-10 transition-colors ${isDarkMode
            ? 'text-stone-600'
            : (environmentalMode ? 'text-teal-900' : 'text-stone-400')
            }`}>{number}</div>
        <h3 className={`text-xl font-bold mb-3 relative z-10 transition-colors ${isDarkMode
            ? 'text-stone-100'
            : (environmentalMode ? 'text-teal-950' : 'text-stone-900')
            }`}>{title}</h3>
        <p className={`leading-relaxed text-sm relative z-10 transition-colors font-medium ${isDarkMode
            ? 'text-stone-400'
            : (environmentalMode ? 'text-teal-900/80' : 'text-stone-600')
            }`}>{description}</p>
    </motion.div>
);

const FeatureCard = ({ icon, title, description, isDarkMode, environmentalMode }) => (
    <motion.div
        whileHover={{ y: -8, scale: 1.03 }} // Lift + Scale
        className={`group relative p-6 rounded-2xl border transition-all duration-500 backdrop-blur-xl overflow-hidden ${isDarkMode
            ? 'bg-stone-900/60 border-stone-800' // Dark Mode (Universal)
            : (environmentalMode ? 'bg-white/70 border-teal-100 shadow-md hover:shadow-xl hover:shadow-emerald-500/20' : 'bg-stone-100/80 border-stone-200') // Light Eco vs Light Depleted
            }`}
    >
        {/* Premium Eco Hover Glow (Behind - Stronger) */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-blue-500/20 blur-xl pointer-events-none`} />

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 shadow-sm ${isDarkMode
            ? 'bg-stone-800'
            : (environmentalMode ? 'bg-teal-50 group-hover:bg-teal-500 group-hover:text-white' : 'bg-stone-200')
            }`}>
            {icon}
        </div>
        <h3 className={`text-lg font-bold mb-2 relative z-10 transition-colors ${isDarkMode
            ? 'text-stone-200'
            : (environmentalMode ? 'text-teal-950' : 'text-stone-800')
            }`}>{title}</h3>
        <p className={`text-sm leading-relaxed relative z-10 transition-colors font-medium ${isDarkMode
            ? 'text-stone-400'
            : (environmentalMode ? 'text-teal-900/80' : 'text-stone-600')
            }`}>{description}</p>
    </motion.div>
);

export default LandingPage;
