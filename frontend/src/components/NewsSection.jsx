import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw } from 'lucide-react';
import api from '../services/api';
import NewsCard from './NewsCard';

const NewsSection = ({ isDarkMode, userCity }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newsFilter, setNewsFilter] = useState('global'); // 'global' or 'local'

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(null);

            const locationParam = newsFilter === 'local' && userCity ? userCity : 'global';
            const response = await api.get(`/news/personalized?location=${locationParam}`);
            setNews(response.data?.articles || []);
        } catch (err) {
            console.error("Failed to fetch personalized news", err);
            setError("Unable to load the latest environmental intelligence at this time.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [newsFilter, userCity]);

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                        <Newspaper className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    What's Happening
                </h2>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Filter Tabs */}
                    <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <button
                            onClick={() => setNewsFilter('global')}
                            disabled={loading}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${newsFilter === 'global'
                                    ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                                    : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                                }`}
                        >
                            Global
                        </button>
                        {userCity && (
                            <button
                                onClick={() => setNewsFilter('local')}
                                disabled={loading}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${newsFilter === 'local'
                                        ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                                        : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                                    }`}
                            >
                                {userCity}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={fetchNews}
                        disabled={loading}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {loading && news.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Analyzing global events against your profile...
                    </p>
                </div>
            ) : error ? (
                <div className={`p-6 rounded-2xl text-center ${isDarkMode ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'}`}>
                    <p>{error}</p>
                    <button onClick={fetchNews} className="mt-3 underline text-sm font-medium">Try Again</button>
                </div>
            ) : news.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border border-dashed ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                    <Newspaper className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No highly relevant news found for your profile right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {news.map((article, index) => (
                        <NewsCard key={index} article={article} isDarkMode={isDarkMode} />
                    ))}
                </div>
            )}

        </div>
    );
};

export default NewsSection;
