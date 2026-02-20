import React, { useState, useEffect } from 'react';
import { Scale, RefreshCw } from 'lucide-react';
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

    useEffect(() => {
        fetchLaws();
    }, []);

    // Split data into National Laws and International Agreements
    const nationalLaws = lawsData.filter(l => l.type === 'national');
    const internationalAgreements = lawsData.filter(l => l.type === 'international');

    return (
        <div className="w-full mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                        <Scale className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    Laws & Agreements
                </h2>

                <button
                    onClick={fetchLaws}
                    disabled={loading}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {loading && lawsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Translating legal policies for you...
                    </p>
                </div>
            ) : error ? (
                <div className={`p-6 rounded-2xl text-center ${isDarkMode ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'}`}>
                    <p>{error}</p>
                </div>
            ) : lawsData.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border border-dashed ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                    <Scale className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No relevant laws found.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* National Laws Segment */}
                    {nationalLaws.length > 0 && (
                        <div>
                            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                National Environmental Laws
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {nationalLaws.map((law, idx) => (
                                    <LawPolicyCard key={`nat-${idx}`} law={law} isDarkMode={isDarkMode} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* International Agreements Segment */}
                    {internationalAgreements.length > 0 && (
                        <div>
                            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                International Agreements & Treaties
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {internationalAgreements.map((agreement, idx) => (
                                    <LawPolicyCard key={`int-${idx}`} law={agreement} isDarkMode={isDarkMode} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LawPolicySection;
