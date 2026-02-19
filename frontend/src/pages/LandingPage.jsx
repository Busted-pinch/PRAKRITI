import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Activity, Shield, Zap, Wind,
    Brain, Leaf, Layers, CheckCircle, Globe,
    BarChart3, MessageSquare, User, Smartphone
} from 'lucide-react';
import Background3D from '../components/Background3D';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useEnvironment } from '../context/EnvironmentContext';

const LandingPage = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode, setEnvironmentalMode } = useEnvironment();
    const { user } = useAuth(); // Check if user is logged in


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div className={`relative min-h-screen overflow-hidden transition-colors duration-1000 font-sans ${isDarkMode
            ? 'bg-[#0c0a09]'
            : (environmentalMode ? 'bg-transparent' : 'bg-[#e7e5e4]')
            }`}>

            {/* Background */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-80' : 'opacity-60'}`}>
                <Background3D />
            </div>

            {/* Gradient Overlay for Text Readability - Hide in Env Mode */}
            <div className={`absolute inset-0 z-0 pointer-events-none bg-gradient-to-b ${isDarkMode
                ? 'from-black/10 via-transparent to-black/80'
                : (environmentalMode
                    ? 'from-transparent via-transparent to-transparent'
                    : 'from-white/10 via-transparent to-white/80')
                }`} />

            {/* 🔥 HERO SECTION */}
            <div className="relative z-10 pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[90vh]">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center max-w-5xl"
                >
                    <motion.div
                        variants={itemVariants}
                        className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md cursor-pointer hover:bg-emerald-500/20 transition-colors"
                        onClick={() => setEnvironmentalMode(!environmentalMode)}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${environmentalMode ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${environmentalMode ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                        </span>
                        <span className={`text-xs font-bold tracking-widest uppercase ${environmentalMode ? 'text-emerald-500' : 'text-gray-500'}`}>
                            {environmentalMode ? 'Environmental Mode: ON' : 'Environmental Mode: OFF'}
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className={`text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tighter mb-8 leading-[0.95] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                        Reconnect With the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            Environment
                        </span> Around You.
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        In a world of screens and data, we help you understand how the environment truly affects your life — and what you can do about it.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-center">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="group relative px-10 py-5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]"
                            >
                                <span className="relative z-10 flex items-center gap-3 font-bold tracking-wide">
                                    GO TO DASHBOARD <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        ) : (
                            <Link
                                to="/signup"
                                className="group relative px-10 py-5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]"
                            >
                                <span className="relative z-10 flex items-center gap-3 font-bold tracking-wide">
                                    GET STARTED <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        )}

                        <a
                            href="#how-it-works"
                            className={`px-8 py-5 rounded-full font-medium tracking-wide transition-all border ${isDarkMode ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                        >
                            SEE HOW IT WORKS
                        </a>
                    </motion.div>
                </motion.div>
            </div>

            {/* 🧠 SECTION 1 — The Problem (Emotional Hook) */}
            <div className={`relative z-10 py-32 ${isDarkMode ? 'bg-black/20' : 'bg-white/40'} backdrop-blur-sm`}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className={`text-4xl md:text-6xl font-bold mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            We Know the Data. <br />
                            <span className="text-gray-500">But We Don’t Feel the Impact.</span>
                        </h2>

                        <div className={`space-y-8 text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p>
                                We live in an age of constant notifications, dashboards, and statistics.
                                <br />
                                <span className="font-bold text-emerald-500">Air Quality Index. Temperature. Pollution alerts.</span>
                            </p>
                            <p className="text-2xl font-serif italic opacity-80">
                                "But numbers alone don’t change behavior."
                            </p>
                            <p>
                                We rarely understand how these invisible forces affect our breathing, our mood, our energy, and our long-term health.
                                And slowly, without realizing it, we lose our connection with the physical world around us.
                            </p>
                            <p className="uppercase tracking-widest font-bold text-emerald-500 pt-4">
                                Prakriti exists to restore that connection.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ⚙️ SECTION 2 — How It Works */}
            <div id="how-it-works" className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h2>
                    <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Connecting Line */}
                    <div className={`hidden md:block absolute top-[60px] left-[12%] right-[12%] h-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>

                    <WorkStep
                        step="01"
                        title="Understand You"
                        desc="We begin with a behavioral and health profile to capture your cognitive style and sensitivity."
                        icon={<User className="w-6 h-6" />}
                        isDarkMode={isDarkMode}
                    />
                    <WorkStep
                        step="02"
                        title="Analyze Environment"
                        desc="We integrate real-time environmental data — air quality, weather, and exposure trends."
                        icon={<Globe className="w-6 h-6" />}
                        isDarkMode={isDarkMode}
                    />
                    <WorkStep
                        step="03"
                        title="Personalize Impact"
                        desc="We translate complex environmental metrics into meaningful, personalized insights."
                        icon={<Brain className="w-6 h-6" />}
                        isDarkMode={isDarkMode}
                    />
                    <WorkStep
                        step="04"
                        title="Guide Action"
                        desc="We recommend small, realistic actions that improve your well-being and footprint."
                        icon={<CheckCircle className="w-6 h-6" />}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </div>

            {/* 🌿 SECTION 3 — Core Features */}
            <div className={`relative z-10 py-32 ${isDarkMode ? 'bg-gradient-to-b from-transparent to-black/40' : 'bg-gradient-to-b from-transparent to-white/60'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Core Features</h2>
                        <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Everything you need to thrive in your environment.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="text-emerald-400" />}
                            title="Personalized Intelligence"
                            desc="Not generic alerts. Context-aware insights tailored to your specific profile and health needs."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Activity className="text-teal-400" />}
                            title="Real-Time Awareness"
                            desc="Live AQI, weather, and exposure insights powered by official data sources and local sensors."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Layers className="text-cyan-400" />}
                            title="Counterfactual Simulation"
                            desc="“What would change if I did this?” See the projected impact before you make a decision."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<MessageSquare className="text-violet-400" />}
                            title="AI Companion Interface"
                            desc="A conversational interface that explains your environment in simple, human language."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Smartphone className="text-amber-400" />}
                            title="Behavior-Driven Actions"
                            desc="Action suggestions ranked by effort, impact, and feasibility for your daily life."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<BarChart3 className="text-rose-400" />}
                            title="Exposure Tracking"
                            desc="Visualize your exposure trends over time to manage long-term health risks."
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

const WorkStep = ({ step, title, desc, icon, isDarkMode }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="relative flex flex-col items-center text-center group"
    >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold mb-6 relative z-10 transition-all duration-300 ${isDarkMode
            ? 'bg-gray-800 text-white border border-gray-700 group-hover:bg-emerald-600 group-hover:border-emerald-500'
            : 'bg-white text-gray-900 border border-gray-200 group-hover:bg-emerald-500 group-hover:text-white'
            }`}>
            {icon}
        </div>
        <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
        <div className={`absolute -top-6 right-0 text-6xl font-bold opacity-5 ${isDarkMode ? 'text-white' : 'text-black'}`}>{step}</div>
    </motion.div>
);

const FeatureCard = ({ icon, title, desc, isDarkMode }) => (
    <GlassCard className="p-8 h-full">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100/50'}`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${icon.props.className}` })}
        </div>
        <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
    </GlassCard>
);

export default LandingPage;
