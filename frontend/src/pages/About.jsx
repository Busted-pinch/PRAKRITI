import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import { Users, Target, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';

const About = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode } = useEnvironment();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <Layout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto w-full pt-12 pb-20"
            >
                <div className="text-center mb-20">
                    <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold text-sm tracking-widest uppercase mb-6 border border-emerald-500/20">
                        Our Vision
                    </motion.div>
                    <motion.h1 variants={itemVariants} className={`text-5xl md:text-7xl font-bold mb-8 tracking-tight ${isDarkMode
                        ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400'
                        : 'text-gray-900'
                        }`}>
                        About <span className="text-emerald-500">Prakriti</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light text-gray-500 dark:text-gray-400">
                        We bridge the gap between <span className="text-emerald-500 font-medium">ancient ecological wisdom</span> and <span className="text-blue-500 font-medium">modern cognitive science</span>.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <ValueCard
                        icon={<Target className="w-8 h-8 text-emerald-500" />}
                        title="Our Mission"
                        text="To democratize personalized environmental wellness through data-driven insights."
                        isDarkMode={isDarkMode}
                        environmentalMode={environmentalMode}
                        variants={itemVariants}
                    />
                    <ValueCard
                        icon={<Heart className="w-8 h-8 text-rose-500" />}
                        title="Our Values"
                        text="Sustainability, scientific integrity, and human-centric design are at our core."
                        isDarkMode={isDarkMode}
                        environmentalMode={environmentalMode}
                        variants={itemVariants}
                    />
                    <ValueCard
                        icon={<Users className="w-8 h-8 text-blue-500" />}
                        title="The Team"
                        text="A diverse collective of ecologists, data scientists, and designers building for the future."
                        isDarkMode={isDarkMode}
                        environmentalMode={environmentalMode}
                        variants={itemVariants}
                    />
                </div>

                <motion.div variants={itemVariants} className="relative">
                    <GlassCard className="p-10 md:p-16 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-12 opacity-5 pointer-events-none ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            <Sparkles className="w-96 h-96" />
                        </div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Why We Exist</h2>
                                <p className={`text-lg leading-relaxed mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    In an increasingly digital world, we are losing our connection to the physical environment.
                                    Prakriti uses technology not to distract you, but to reconnect you with your natural rhythms.
                                </p>
                                <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    By understanding your cognitive and physical traits, we curate experiences that don't just fit your schedule—they fit your soul.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <StatBox number="10k+" label="Profiles Mapped" isDarkMode={isDarkMode} />
                                <StatBox number="50+" label="Data Points" isDarkMode={isDarkMode} />
                                <StatBox number="98%" label="User Satisfaction" isDarkMode={isDarkMode} />
                                <StatBox number="24/7" label="Real-time Sync" isDarkMode={isDarkMode} />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </Layout>
    );
};

const ValueCard = ({ icon, title, text, isDarkMode, environmentalMode, variants }) => (
    <motion.div
        variants={variants}
        whileHover={{ y: -8, scale: 1.02 }}
        className={`group relative p-8 rounded-3xl text-center border transition-all duration-500 overflow-hidden ${isDarkMode
            ? 'bg-stone-900/60 border-white/10' // Dark Mode (Universal)
            : (environmentalMode ? 'bg-white/70 border-emerald-200/50 shadow-lg shadow-teal-900/5' : 'bg-white border-gray-100 shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:border-emerald-200')
            }`}>

        {/* Premium Eco Hover Glow (Behind) */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-blue-500/20 blur-xl pointer-events-none`} />

        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 relative z-10 ${isDarkMode
            ? 'bg-white/5'
            : (environmentalMode ? 'bg-teal-50 text-teal-600' : 'bg-emerald-50')
            }`}>
            {icon}
        </div>
        <h3 className={`text-xl font-bold mb-4 relative z-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`leading-relaxed relative z-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{text}</p>
    </motion.div>
);

const StatBox = ({ number, label, isDarkMode }) => (
    <div className={`p-6 rounded-2xl text-center ${isDarkMode ? 'bg-black/20 border border-white/5' : 'bg-white shadow-sm border border-emerald-100'
        }`}>
        <div className="text-3xl font-bold text-emerald-500 mb-1">{number}</div>
        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
    </div>
);

export default About;
