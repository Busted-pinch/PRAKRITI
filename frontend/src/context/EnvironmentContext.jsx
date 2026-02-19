import React, { createContext, useContext, useState } from 'react';

const EnvironmentContext = createContext();

export const EnvironmentProvider = ({ children }) => {
    // Initialize from localStorage or default to false
    const [environmentalMode, setEnvironmentalModeState] = useState(() => {
        const saved = localStorage.getItem('environmentalMode');
        return saved === 'true';
    });

    const setEnvironmentalMode = (value) => {
        setEnvironmentalModeState(value);
        localStorage.setItem('environmentalMode', value.toString());
    };

    return (
        <EnvironmentContext.Provider value={{ environmentalMode, setEnvironmentalMode }}>
            {children}
        </EnvironmentContext.Provider>
    );
};

export const useEnvironment = () => useContext(EnvironmentContext);
