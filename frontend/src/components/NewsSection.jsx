import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw } from 'lucide-react';
import api from '../services/api';
import NewsCard from './NewsCard';

const NewsSection = ({ isDarkMode }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(null);
            // Will call the newly created endpoint
            const response = await api.get('/news/personalized');
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
    }, []);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                        <Newspaper className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    Environmental Intelligence
                </h2>

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
                <div className="flex flex-col gap-2">
                    {news.map((article, index) => (
                        <NewsCard key={index} article={article} isDarkMode={isDarkMode} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsSection;
