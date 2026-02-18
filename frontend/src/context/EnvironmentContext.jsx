import React, { createContext, useContext, useState } from 'react';

const EnvironmentContext = createContext();

export const EnvironmentProvider = ({ children }) => {
    const [environmentalMode, setEnvironmentalMode] = useState(false);

    return (
        <EnvironmentContext.Provider value={{ environmentalMode, setEnvironmentalMode }}>
            {children}
        </EnvironmentContext.Provider>
    );
};

export const useEnvironment = () => useContext(EnvironmentContext);
