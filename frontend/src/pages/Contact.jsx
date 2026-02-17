import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'
            }`}>
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-4xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Get in Touch
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Information</h2>
                        <div className="flex items-center gap-4">
                            <Mail className="w-6 h-6 text-emerald-500" />
                            <span>hello@prakriti.example.com</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone className="w-6 h-6 text-emerald-500" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <MapPin className="w-6 h-6 text-emerald-500" />
                            <span>123 Nature Way, Eco City, Earth</span>
                        </div>
                    </div>

                    <form className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'
                        }`}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" className={`w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                    }`} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" className={`w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                    }`} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea rows={4} className={`w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                    }`} />
                            </div>
                            <button className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
