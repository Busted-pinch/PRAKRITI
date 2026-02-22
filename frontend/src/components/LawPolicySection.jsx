import React, { useState, useEffect } from 'react';
import { Scale, RefreshCw, Globe, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import LawPolicyCard from './LawPolicyCard';

const LawPolicySection = ({ isDarkMode }) => {
    const [lawsData, setLawsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLaws = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/law/personalized');
            setLawsData(response.data?.laws || []);
        } catch (err) {
            console.error("Failed to fetch personalized laws", err);
            setError("Unable to load legal intelligence at this time.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLaws(); }, []);

    // Split into national and international — fall back to showing all together
    const nationalLaws = lawsData.filter(l => l.type === 'national');
    const internationalLaws = lawsData.filter(l => l.type === 'international');
    const unclassified = lawsData.filter(l => !l.type);
    // If backend doesn't set type on any, show all in one section
    const showUnified = lawsData.length > 0 && nationalLaws.length === 0 && internationalLaws.length === 0;

    return (
        <div className="w-full mt-12">
            {/* ── Section header ── */}
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                        <Scale className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    Laws &amp; Agreements
                </h2>

                <button
                    onClick={fetchLaws}
                    disabled={loading}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors
                        ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* ── States ── */}
            {loading && lawsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Translating legal policies for you…
                    </p>
                </div>
            ) : error ? (
                <div className={`p-6 rounded-2xl text-center border
                    ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <p>{error}</p>
                    <button onClick={fetchLaws} className="mt-3 underline text-sm font-medium">Try Again</button>
                </div>
            ) : lawsData.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border border-dashed
                    ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                    <Scale className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No relevant laws found for your profile.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* ── Unified (no type set) ── */}
                    {showUnified && (
                        <LawGrid laws={lawsData} isDarkMode={isDarkMode} label="Environmental Laws & Agreements" Icon={Scale} color="indigo" />
                    )}

                    {/* ── National Laws ── */}
                    {!showUnified && nationalLaws.length > 0 && (
                        <LawGrid laws={nationalLaws} isDarkMode={isDarkMode} label="National Environmental Laws" Icon={Leaf} color="emerald" />
                    )}

                    {/* ── International Agreements ── */}
                    {!showUnified && internationalLaws.length > 0 && (
                        <LawGrid laws={internationalLaws} isDarkMode={isDarkMode} label="International Agreements & Treaties" Icon={Globe} color="blue" />
                    )}

                    {/* ── Unclassified (mixed section) ── */}
                    {!showUnified && unclassified.length > 0 && (
                        <LawGrid laws={unclassified} isDarkMode={isDarkMode} label="Other Regulations" Icon={Scale} color="indigo" />
                    )}
                </div>
            )}
        </div>
    );
};

/* ── Sub-component: renders a labelled 3-col grid ── */
const COLOR = {
    emerald: { dark: 'text-emerald-400', light: 'text-emerald-700', bgDark: 'bg-emerald-500/10', bgLight: 'bg-emerald-50', divDark: 'border-emerald-500/20', divLight: 'border-emerald-100' },
    blue: { dark: 'text-blue-400', light: 'text-blue-700', bgDark: 'bg-blue-500/10', bgLight: 'bg-blue-50', divDark: 'border-blue-500/20', divLight: 'border-blue-100' },
    indigo: { dark: 'text-indigo-400', light: 'text-indigo-700', bgDark: 'bg-indigo-500/10', bgLight: 'bg-indigo-50', divDark: 'border-indigo-500/20', divLight: 'border-indigo-100' },
};

const LawGrid = ({ laws, isDarkMode, label, Icon, color }) => {
    const c = COLOR[color] || COLOR.indigo;
    return (
        <div>
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b
                ${isDarkMode ? c.divDark : c.divLight}`}>
                <div className={`p-1.5 rounded-lg ${isDarkMode ? c.bgDark : c.bgLight}`}>
                    <Icon className={`w-4 h-4 ${isDarkMode ? c.dark : c.light}`} />
                </div>
                <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? c.dark : c.light}`}>
                    {label}
                </h3>
                <span className={`ml-auto text-[10px] font-semibold tabular-nums ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {laws.length} {laws.length === 1 ? 'item' : 'items'}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {laws.map((law, idx) => (
                    <motion.div
                        key={`law-${idx}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.3 }}
                    >
                        <LawPolicyCard law={law} isDarkMode={isDarkMode} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default LawPolicySection;
