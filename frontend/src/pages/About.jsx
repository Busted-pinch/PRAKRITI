import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Users, Target, Heart, Sparkles, Globe, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
    const { isDarkMode } = useTheme();

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
        <div className={`min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden relative ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-600'
            }`}>
            {/* Background decorations */}
            <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none ${isDarkMode ? 'opacity-20' : 'opacity-40'}`} />
            <div className={`absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none ${isDarkMode ? 'opacity-20' : 'opacity-40'}`} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto relative z-10"
            >
                <motion.div variants={itemVariants} className="text-center mb-20">
                    <h1 className={`text-5xl md:text-7xl font-bold mb-8 tracking-tight ${isDarkMode
                        ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400'
                        : 'text-gray-900'
                        }`}>
                        About <span className="text-emerald-500">Prakriti</span>
                    </h1>

                    <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
                        We bridge the gap between <span className="text-emerald-500 font-medium">ancient ecological wisdom</span> and <span className="text-blue-500 font-medium">modern cognitive science</span>.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <ValueCard
                        icon={<Target className="w-8 h-8 text-emerald-500" />}
                        title="Our Mission"
                        text="To democratize personalized environmental wellness through data-driven insights."
                        isDarkMode={isDarkMode}
                        variants={itemVariants}
                    />
                    <ValueCard
                        icon={<Heart className="w-8 h-8 text-rose-500" />}
                        title="Our Values"
                        text="Sustainability, scientific integrity, and human-centric design are at our core."
                        isDarkMode={isDarkMode}
                        variants={itemVariants}
                    />
                    <ValueCard
                        icon={<Users className="w-8 h-8 text-blue-500" />}
                        title="The Team"
                        text="A diverse collective of ecologists, data scientists, and designers building for the future."
                        isDarkMode={isDarkMode}
                        variants={itemVariants}
                    />
                </div>

                <motion.div variants={itemVariants} className={`p-10 rounded-3xl border relative overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <div className={`absolute top-0 right-0 p-12 opacity-10 ${isDarkMode ? 'text-white' : 'text-black'
                        }`}>
                        <Sparkles className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Why We Exist</h2>
                            <p className="text-lg leading-relaxed mb-6">
                                In an increasingly digital world, we are losing our connection to the physical environment.
                                Prakriti uses technology not to distract you, but to reconnect you with your natural rhythms.
                            </p>
                            <p className="text-lg leading-relaxed">
                                By understanding your cognitive and physical traits, we curate experiences that don't just fit your schedule—they fit your soul.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <StatBox number="10k+" label="Profiles Mapped" isDarkMode={isDarkMode} />
                            <StatBox number="50+" label="Data Points" isDarkMode={isDarkMode} />
                            <StatBox number="98%" label="User Satisfaction" isDarkMode={isDarkMode} />
                            <StatBox number="24/7" label="Real-time Sync" isDarkMode={isDarkMode} />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

const ValueCard = ({ icon, title, text, isDarkMode, variants }) => (
    <motion.div
        variants={variants}
        whileHover={{ y: -10 }}
        className={`p-8 rounded-3xl text-center border transition-all duration-300 ${isDarkMode
            ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/30'
            : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-emerald-200'
            }`}>
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'
            }`}>
            {icon}
        </div>
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{text}</p>
    </motion.div>
);

const StatBox = ({ number, label, isDarkMode }) => (
    <div className={`p-6 rounded-2xl text-center ${isDarkMode ? 'bg-black/20' : 'bg-white shadow-sm'
        }`}>
        <div className="text-3xl font-bold text-emerald-500 mb-1">{number}</div>
        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
    </div>
);

export default About;
