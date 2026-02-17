import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Shield, Zap, Wind, Brain, Leaf, Layers, CheckCircle } from 'lucide-react';
import Background3D from '../components/Background3D';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
    const { isDarkMode } = useTheme();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>

            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[100px] mix-blend-multiply opacity-20 animate-blob ${isDarkMode ? 'bg-emerald-900' : 'bg-emerald-200'
                    }`}></div>
                <div className={`absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-multiply opacity-20 animate-blob animation-delay-2000 ${isDarkMode ? 'bg-blue-900' : 'bg-cyan-200'
                    }`}></div>
                <div className={`absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-multiply opacity-20 animate-blob animation-delay-4000 ${isDarkMode ? 'bg-purple-900' : 'bg-violet-200'
                    }`}></div>
            </div>

            {/* 3D Background - Subtler in Light Mode */}
            <div className={`absolute inset-0 z-0 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <Background3D />
            </div>

            {/* Hero Section */}
            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-md">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                            Nature-Intelligent Design
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className={`text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight ${isDarkMode
                                ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500'
                                : 'text-gray-900'
                            }`}
                    >
                        Discover Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">True Nature</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                    >
                        Prakriti uses advanced cognitive styling to map your personality to nature's fundamental rhythms.
                        <br className="hidden md:block" />
                        Understand your mind, body, and environment in sync.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            to="/assessment"
                            className="group relative px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50 flex items-center justify-center gap-2 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">Start Assessment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </Link>
                        <Link
                            to="/about"
                            className={`px-8 py-4 rounded-full text-lg font-bold border transition-all hover:scale-105 backdrop-blur-sm ${isDarkMode
                                    ? 'border-white/10 hover:bg-white/5 text-white'
                                    : 'border-gray-200 hover:bg-white/50 text-gray-700'
                                }`}
                        >
                            Learn More
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* How It Works Section */}
            <div className={`py-24 relative z-10 ${isDarkMode ? 'bg-black/20' : 'bg-white/40'} backdrop-blur-lg`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            A seamless journey from cognitive assessment to environmental alignment.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connection Line (Desktop) */}
                        <div className={`hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] h-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

                        <StepCard
                            number="01"
                            title="Cognitive Mapping"
                            description="Answer 10 adaptive questions to determine your abstract thinking and social recharge energy."
                            icon={<Brain className="w-6 h-6" />}
                            isDarkMode={isDarkMode}
                        />
                        <StepCard
                            number="02"
                            title="Biometric Sync"
                            description="Input your physical parameters and health constraints to calibrate your activity threshold."
                            icon={<Activity className="w-6 h-6" />}
                            isDarkMode={isDarkMode}
                        />
                        <StepCard
                            number="03"
                            title="Environmental Lock"
                            description="Receive your personalized dashboard with real-time AQI and circadian phase alignment."
                            icon={<Layers className="w-6 h-6" />}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
            </div>

            {/* The Science / Features Grid */}
            <div className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>The Science of Prakriti</h2>
                        <p className={`text-lg max-w-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Drawing from ecological psychology and chronobiology.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Activity className="w-6 h-6 text-emerald-400" />}
                            title="Biometric Analog"
                            description="Map your physical intensity and health markers to natural elements."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-blue-400" />}
                            title="Environmental Sync"
                            description="Align your lifestyle with your AQI sensitivity and outdoor affinity."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-amber-400" />}
                            title="Cognitive Flow"
                            description="Understand your abstract thinking properties and social battery recharge rates."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Wind className="w-6 h-6 text-cyan-400" />}
                            title="Atmospheric Analysis"
                            description="Real-time air quality data integration for optimal activity planning."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<CheckCircle className="w-6 h-6 text-violet-400" />}
                            title="Routine Optimization"
                            description="Structure vs. Flexibility analysis to design your perfect day."
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Leaf className="w-6 h-6 text-lime-400" />}
                            title="Nature Immersion"
                            description="Curated hobby suggestions that reconnect you with the physical world."
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StepCard = ({ number, title, description, icon, isDarkMode }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className={`relative p-8 rounded-3xl border text-center transition-all ${isDarkMode
                ? 'bg-gray-800/50 border-white/5 hover:bg-gray-800'
                : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl'
            }`}
    >
        <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-6 relative z-10 ${isDarkMode ? 'bg-gray-900 border border-white/10 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}>
            {icon}
        </div>
        <div className={`absolute top-6 right-8 text-4xl font-bold opacity-10 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{number}</div>
        <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`leading-relaxed text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
    </motion.div>
);

const FeatureCard = ({ icon, title, description, isDarkMode }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-6 rounded-2xl border transition-all ${isDarkMode
                ? 'bg-white/5 border-white/5 hover:bg-white/10'
                : 'bg-white border-gray-100 shadow-lg hover:shadow-xl'
            }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'
            }`}>
            {icon}
        </div>
        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
    </motion.div>
);

export default LandingPage;
