import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { APP_URL } from './ApiContext';
import Cookies from 'universal-cookie';
import { ErrorContext } from '../component/error/ErrorContext';
import { useNavigate } from 'react-router-dom';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const cookies = new Cookies(null, { path: '/' });
    const navigate = useNavigate()

    const reset = () => {
        setError(false);
        navigate("/")
    }

    useEffect(() => {
        const newSocket = io(APP_URL + '/game', {
            transports: ['websocket'],
            upgrade: false
        });
        newSocket.on('connect', () => {
            console.log("Connected Websocket")
            setSocket(newSocket);
            setLoading(false);
        });
        newSocket.on("bothConnected", (data => {
            console.log("bothConnected")
            cookies.set(data.id, data, {maxAge: 600})
            navigate("/play/" + data.id)

        }));
        newSocket.on("error", (data => {
            setError(data)
        }));
        return () => {
            newSocket.disconnect();
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <ErrorContext message={error.message} status={error.status} reset={reset} action={"Home"}/>
    }

    return (
        <SocketContext.Provider value={{socket, cookies}}>
            {children}
        </SocketContext.Provider>
    );
};