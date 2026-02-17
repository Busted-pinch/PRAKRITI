import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Initial check
        const checkTime = () => {
            const hours = new Date().getHours();
            // Light Mode: 6 AM (6) to 6 PM (18)
            // Dark Mode: 6 PM (18) to 6 AM (6)

            const isDayTime = hours >= 6 && hours < 18;
            setIsDarkMode(!isDayTime);
        };

        checkTime();

        // Check periodically (e.g., every minute) to update if the time crosses the boundary
        const interval = setInterval(checkTime, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ThemeContext.Provider value={{ isDarkMode }}>
            <div className={isDarkMode ? 'dark' : ''}>
                <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
                    {children}
                </div>
            </div>
        </ThemeContext.Provider>
    );
};
