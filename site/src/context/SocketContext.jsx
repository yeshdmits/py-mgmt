import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { APP_URL } from './ApiContext';
import Cookies from 'universal-cookie';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const cookies = new Cookies(null, { path: '/' });

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
            console.log(data)
            cookies.set(data.id, data, {maxAge: 600})
        }));
        return () => {
            newSocket.disconnect();
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <SocketContext.Provider value={{socket, cookies}}>
            {children}
        </SocketContext.Provider>
    );
};