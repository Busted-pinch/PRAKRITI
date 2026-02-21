import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { HeartHandshake, MapPin, Calendar, ExternalLink } from 'lucide-react';
import GlassCard from './GlassCard';
import api from '../services/api';

const NgoEvents = ({ locality }) => {
    const { isDarkMode } = useTheme();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                // use appropriate locality, defaulting to Mumbai if none provided for now
                const searchLocality = locality || "Mumbai";
                const response = await api.get(`/ngo/recommendations?locality=${encodeURIComponent(searchLocality)}`);
                if (response.data && response.data.events) {
                    setEvents(response.data.events);
                }
            } catch (err) {
                console.error("Failed to fetch NGO events:", err);
                setError("Unable to load NGO events at the moment.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [locality]);

    return (
        <div className={`mt-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex items-center gap-3 mb-6">
                <HeartHandshake className={`w-8 h-8 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className="text-2xl font-bold">Recommended NGO Events</h2>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : error ? (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                    {error}
                </div>
            ) : events.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <p>No events found in {locality || "your area"} currently.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300">
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                            isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {event.ngo_name || 'NGO Event'}
                                        </span>
                                        {event.similarity && (
                                            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {Math.round(event.similarity * 100)}% Match
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{event.event_title}</h3>
                                    <p className={`text-sm mb-4 line-clamp-3 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {event.description || 'No description available for this event.'}
                                    </p>
                                    
                                    <div className="space-y-2 mt-auto">
                                        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{event.location || locality || 'Local'}</span>
                                        </div>
                                    </div>

                                    {event.source_url && (
                                        <a 
                                            href={event.source_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium transition-colors ${
                                                isDarkMode 
                                                ? 'bg-white/10 hover:bg-emerald-500 hover:text-white' 
                                                : 'bg-gray-100 hover:bg-emerald-600 hover:text-white'
                                            }`}
                                        >
                                            View Details
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NgoEvents;
