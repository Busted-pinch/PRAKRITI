import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Initialize based on time, but allow override
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const hours = new Date().getHours();
        return hours < 6 || hours >= 18;
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setIsDarkMode }}>
            <div className={isDarkMode ? 'dark' : ''}>
                <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
                    {children}
                </div>
            </div>
        </ThemeContext.Provider>
    );
};
