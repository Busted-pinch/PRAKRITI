import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import Background3D from '../components/Background3D';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { Users, Globe, Brain, Zap, Heart, Shield } from 'lucide-react';

const About = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode } = useEnvironment();

    return (
        <div className={`min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${isDarkMode
            ? 'bg-[#0c0a09]'
            : (environmentalMode ? 'bg-transparent' : 'bg-[#e7e5e4]')
            }`}>
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Background3D />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="text-center mb-20">
                        <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            We Exist to Rebuild the <br />
                            <span className={`${isDarkMode ? 'text-emerald-400' : 'text-teal-700'}`}>Human–Environment Connection.</span>
                        </h1>
                        <p className={`text-xl leading-relaxed max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                            In an increasingly digital world, we spend more time interacting with screens than with the physical world around us. Prakriti exists to change that.
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid md:grid-cols-2 gap-8 mb-20">
                        <GlassCard className="p-8">
                            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                <Globe className="w-6 h-6 text-emerald-500" /> Our Mission
                            </h2>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                                To transform environmental data into personal, understandable, and actionable intelligence that empowers everyday decision-making.
                            </p>
                        </GlassCard>

                        <GlassCard className="p-8">
                            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                <Brain className="w-6 h-6 text-teal-500" /> Our Vision
                            </h2>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                                A future where environmental awareness is intuitive, personalized, and seamlessly integrated into daily life.
                            </p>
                        </GlassCard>
                    </div>

                    {/* Values */}
                    <div className="mb-20">
                        <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Our Values</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <ValueCard title="Clarity Over Noise" desc="We simplify complexity without distorting truth." icon={<Zap />} color="text-amber-600" darkColor="text-amber-400" />
                            <ValueCard title="Intelligence With Empathy" desc="Technology should adapt to humans, not the other way around." icon={<Heart />} color="text-rose-600" darkColor="text-rose-400" />
                            <ValueCard title="Action Over Alarm" desc="Awareness matters only when it leads to change." icon={<Users />} color="text-blue-600" darkColor="text-blue-400" />
                            <ValueCard title="Credibility First" desc="We rely on trusted, verified environmental data sources." icon={<Shield />} color="text-emerald-600" darkColor="text-emerald-400" />
                        </div>
                    </div>

                    {/* Team */}
                    <div className="text-center bg-emerald-500/10 rounded-3xl p-12 backdrop-blur-md border border-emerald-500/20">
                        <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Built By Curious Minds</h2>
                        <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            We are a team of technologists, thinkers, and problem-solvers united by one simple belief: Environmental awareness should not be abstract. It should be personal.
                        </p>
                    </div>

                </motion.div>
            </div>
            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
};

const ValueCard = ({ title, desc, icon, color = 'text-emerald-600', darkColor = 'text-emerald-400' }) => {
    const { isDarkMode } = useTheme();
    return (
        <GlassCard className="p-6 flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-white/80'}`}>
                {React.cloneElement(icon, { className: `w-6 h-6 ${isDarkMode ? darkColor : color}` })}
            </div>
            <div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
            </div>
        </GlassCard>
    );
}

export default About;
