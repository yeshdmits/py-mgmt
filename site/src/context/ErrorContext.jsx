import React, { createContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useLocation } from 'react-router-dom';

const ErrorContext = createContext(null);

export const ErrorContextProvider = ({ children }) => {
    const socket = useSocket();
    const [error, setError] = useState(null);
    const location = useLocation();


    useEffect(() => {
        setError(null)
        socket.on('error', (data) => {
            setError(data)
        });
        socket.onAny((event, ...args) => {
            if (event !== 'error') {
                setError(null)
            }
        })
    }, [location]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <ErrorContext.Provider value={error}>
            {children}
        </ErrorContext.Provider>
    );
};