import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useCookies } from 'react-cookie';
import { useNavigate, createSearchParams } from "react-router-dom";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cookies, setCookie] = useCookies(['tictactoe']);
    const navigate = useNavigate();

    useEffect(() => {
        const newSocket = io('localhost:5000/game');

        newSocket.on('connect', () => {
            setSocket(newSocket);
            setLoading(false);
        });
        newSocket.on("bothConnected", (data => {
            console.log(data.id)
            setCookie("tictactoe", JSON.stringify(data))
            navigate({
                pathname: "/play",
                search: `?${createSearchParams({
                    gameId: data.id
                })}`
            })
        }))
        newSocket.on("playerMoved", (data => {
            setCookie("tictactoe", JSON.stringify(data))
            navigate({
                pathname: "/play",
                search: `?${createSearchParams({
                    gameId: data.id
                })}`
            })
        }))
        return () => {
            newSocket.disconnect();
        };
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};