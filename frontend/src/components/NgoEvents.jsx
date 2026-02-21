import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { HeartHandshake, MapPin, ExternalLink } from 'lucide-react';
import GlassCard from './GlassCard';
import api from '../services/api';

/**
 * Strip common markdown artifacts from a string so raw API text
 * is human-readable: removes **bold**, *italic*, # headings,
 * bullet dashes / asterisks, and excess whitespace.
 */
function stripMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/#{1,6}\s*/g, '')          // headings
        .replace(/\*\*(.*?)\*\*/g, '$1')    // bold
        .replace(/\*(.*?)\*/g, '$1')        // italic
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // inline code
        .replace(/^\s*[-*+]\s+/gm, '• ')   // bullet lists
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → label only
        .replace(/\n{3,}/g, '\n\n')         // collapse excessive blank lines
        .trim();
}

const NgoEvents = ({ locality }) => {
    const { isDarkMode } = useTheme();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const searchLocality = locality || 'Mumbai';
                const response = await api.get(`/ngo/recommendations?locality=${encodeURIComponent(searchLocality)}`);
                if (response.data && response.data.events) {
                    setEvents(response.data.events);
                }
            } catch (err) {
                console.error('Failed to fetch NGO events:', err);
                setError('Unable to load NGO events at the moment.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [locality]);

    return (
        <div className={`mt-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {/* Section header — matches NewsSection / LawPolicySection style */}
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                        <HeartHandshake className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    Recommended NGO Events
                </h2>

                {/* City pill — shows which city the events are for */}
                {locality && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold
                            ${isDarkMode
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        {locality}
                    </motion.div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Finding events near {locality || 'you'}…
                    </p>
                </div>
            ) : error ? (
                <div className={`p-6 rounded-2xl text-center ${isDarkMode ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'}`}>
                    <p>{error}</p>
                </div>
            ) : events.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border border-dashed ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                    <HeartHandshake className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p>No events found in {locality || 'your area'} currently.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => {
                        const cleanDescription = stripMarkdown(event.description);
                        return (
                            <motion.div
                                key={event.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                            >
                                <GlassCard className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300">
                                    <div className="p-6 flex-1 flex flex-col">
                                        {/* Header row: NGO name badge + match % */}
                                        <div className="flex justify-between items-center mb-4">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isDarkMode
                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {event.ngo_name || 'NGO Event'}
                                            </span>
                                            {event.similarity != null && (
                                                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {Math.round(event.similarity * 100)}% Match
                                                </span>
                                            )}
                                        </div>

                                        {/* Event title */}
                                        <h3 className="text-base font-bold mb-3 leading-snug line-clamp-2">
                                            {event.event_title}
                                        </h3>

                                        {/* Description — cleaned & fully shown, scrollable if long */}
                                        {cleanDescription ? (
                                            <p className={`text-sm leading-relaxed flex-1 overflow-y-auto pr-1 max-h-32 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {cleanDescription}
                                            </p>
                                        ) : (
                                            <p className={`text-sm italic flex-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                No description available.
                                            </p>
                                        )}


                                        {/* CTA button */}
                                        {event.source_url && (
                                            <a
                                                href={event.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${isDarkMode
                                                    ? 'bg-white/10 hover:bg-emerald-500 hover:text-white'
                                                    : 'bg-gray-100 hover:bg-emerald-600 hover:text-white'
                                                    }`}
                                            >
                                                View Details
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NgoEvents;
