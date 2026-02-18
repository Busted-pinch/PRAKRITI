import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';

const Contact = () => {
    const { isDarkMode } = useTheme();

    return (
        <Layout>
            <div className="max-w-6xl mx-auto w-full pt-12 pb-20">
                <div className="text-center mb-16">
                    <h1 className={`text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Get in Touch
                    </h1>
                    <p className={`text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Have questions about your nature persona or enterprise solutions? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <ContactInfoCard
                            icon={<Mail className="w-6 h-6 text-emerald-500" />}
                            title="Email Us"
                            content="hello@prakriti.example.com"
                            subContent="We usually reply within 24 hours."
                            isDarkMode={isDarkMode}
                        />
                        <ContactInfoCard
                            icon={<Phone className="w-6 h-6 text-blue-500" />}
                            title="Call Us"
                            content="+1 (555) 123-4567"
                            subContent="Mon-Fri, 9am-6pm EST"
                            isDarkMode={isDarkMode}
                        />
                        <ContactInfoCard
                            icon={<MapPin className="w-6 h-6 text-purple-500" />}
                            title="Visit Us"
                            content="123 Nature Way, Eco City"
                            subContent="Earth, 10001"
                            isDarkMode={isDarkMode}
                        />
                    </div>

                    <GlassCard className="p-8 md:p-10">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                                    <input type="text" className={`w-full rounded-xl px-4 py-3 border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`} placeholder="Jane" />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                                    <input type="text" className={`w-full rounded-xl px-4 py-3 border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`} placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                                <input type="email" className={`w-full rounded-xl px-4 py-3 border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`} placeholder="jane@example.com" />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message</label>
                                <textarea rows={4} className={`w-full rounded-xl px-4 py-3 border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`} placeholder="How can we help you?" />
                            </div>

                            <button className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Send className="w-5 h-5" /> Send Message
                            </button>
                        </form>
                    </GlassCard>
                </div>
            </div>
        </Layout>
    );
};

const ContactInfoCard = ({ icon, title, content, subContent, isDarkMode }) => (
    <GlassCard className="flex items-center gap-6 p-6 hover:scale-[1.02] transition-transform cursor-default">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-white/5' : 'bg-emerald-50'}`}>
            {icon}
        </div>
        <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <p className={`font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{content}</p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subContent}</p>
        </div>
    </GlassCard>
);

export default Contact;
