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
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode, setEnvironmentalMode } = useEnvironment();
    const { user } = useAuth(); // Check if user is logged in
    const { t } = useLanguage();


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
            {/* Background - matching About/Contact page structure */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Background3D />
            </div>

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
                            {environmentalMode ? t('landing', 'envModeOn') : t('landing', 'envModeOff')}
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className={`text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tighter mb-8 leading-[0.95] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                        {t('landing', 'heroTitle1')} <br />
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode
                            ? 'from-emerald-400 via-teal-400 to-cyan-400'
                            : 'from-emerald-700 via-teal-600 to-cyan-700'
                            }`}>
                            {t('landing', 'heroTitle2')}
                        </span> {t('landing', 'heroTitle3')}
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}
                    >
                        {t('landing', 'heroSub')}
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-center">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="group relative px-10 py-5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]"
                            >
                                <span className="relative z-10 flex items-center gap-3 font-bold tracking-wide">
                                    {t('landing', 'btnDashboard')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        ) : (
                            <Link
                                to="/signup"
                                className="group relative px-10 py-5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]"
                            >
                                <span className="relative z-10 flex items-center gap-3 font-bold tracking-wide">
                                    {t('landing', 'btnGetStarted')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        )}

                        <a
                            href="#how-it-works"
                            className={`px-8 py-5 rounded-full font-medium tracking-wide transition-all border ${isDarkMode ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                        >
                            {t('landing', 'btnHowItWorks')}
                        </a>
                    </motion.div>
                </motion.div>
            </div>

            {/* 🧠 SECTION 1 — The Problem (Emotional Hook) */}
            <div className={`relative z-10 py-32 ${isDarkMode ? 'bg-black/20' : 'bg-white/60'} backdrop-blur-sm`}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className={`text-4xl md:text-6xl font-bold mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {t('landing', 'problemTitle1')} <br />
                            <span className="text-gray-500">{t('landing', 'problemTitle2')}</span>
                        </h2>

                        <div className={`space-y-8 text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p>
                                {t('landing', 'problemP1')}
                                <br />
                                <span className={`font-bold ${isDarkMode ? 'text-emerald-500' : 'text-teal-700'}`}>{t('landing', 'problemP2')}</span>
                            </p>
                            <p className="text-2xl font-serif italic opacity-80">
                                {t('landing', 'problemQuote')}
                            </p>
                            <p>
                                {t('landing', 'problemP3')}
                            </p>
                            <p className={`uppercase tracking-widest font-bold pt-4 ${isDarkMode ? 'text-emerald-500' : 'text-teal-700'}`}>
                                {t('landing', 'problemP4')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ⚙️ SECTION 2 — How It Works */}
            <div id="how-it-works" className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('landing', 'howItWorksTitle')}</h2>
                    <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Connecting Line */}
                    <div className={`hidden md:block absolute top-[60px] left-[12%] right-[12%] h-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>

                    <WorkStep
                        step="01"
                        title={t('landing', 'step1Title')}
                        desc={t('landing', 'step1Desc')}
                        icon={<User className="w-6 h-6" />}
                        isDarkMode={isDarkMode}
                    />
                    <WorkStep
                        step="02"
                        title={t('landing', 'step2Title')}
                        desc={t('landing', 'step2Desc')}
                        icon={<Globe className="w-6 h-6" />}
                        isDarkMode={isDarkMode}
                    />
                    <WorkStep
                        step="03"
                        title={t('landing', 'step3Title')}
                        desc={t('landing', 'step3Desc')}
                        icon={<Brain className="w-6 h-6" />}
                        isDarkMode={isDarkMode}
                    />
                    <WorkStep
                        step="04"
                        title={t('landing', 'step4Title')}
                        desc={t('landing', 'step4Desc')}
                        icon={<CheckCircle className="w-6 h-6" />}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </div>

            {/* 🌿 SECTION 3 — Core Features */}
            <div className={`relative z-10 py-32 ${isDarkMode ? 'bg-gradient-to-b from-transparent to-black/40' : 'bg-gradient-to-b from-white/40 to-white/70'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('landing', 'featuresTitle')}</h2>
                        <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('landing', 'featuresSub')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="text-emerald-400" />}
                            title={t('landing', 'feature1Title')}
                            desc={t('landing', 'feature1Desc')}
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Activity className="text-teal-400" />}
                            title={t('landing', 'feature2Title')}
                            desc={t('landing', 'feature2Desc')}
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Layers className="text-cyan-400" />}
                            title={t('landing', 'feature3Title')}
                            desc={t('landing', 'feature3Desc')}
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<MessageSquare className="text-violet-400" />}
                            title={t('landing', 'feature4Title')}
                            desc={t('landing', 'feature4Desc')}
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<Smartphone className="text-amber-400" />}
                            title={t('landing', 'feature5Title')}
                            desc={t('landing', 'feature5Desc')}
                            isDarkMode={isDarkMode}
                        />
                        <FeatureCard
                            icon={<BarChart3 className="text-rose-400" />}
                            title={t('landing', 'feature6Title')}
                            desc={t('landing', 'feature6Desc')}
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
    <GlassCard className="relative p-8 flex flex-col items-center text-center">
        <div className={`absolute -top-4 -right-2 text-5xl font-black opacity-10 ${isDarkMode ? 'text-white' : 'text-emerald-800'}`}>{step}</div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${isDarkMode
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-emerald-100 text-emerald-700'
            }`}>
            {icon}
        </div>
        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
    </GlassCard>
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
