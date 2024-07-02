import React, {  useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useSocket } from "../context/SocketContext";
import GameId from "./GameId";
import { useNavigate } from "react-router-dom";

const LoadingDisplay = () => {
    const {gameId} = useParams();
    const {socket} = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            socket.emit('load_game', gameId);
        }
    }, [])

    if (gameId) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-center my-5">
                    Please share the Link with your friend
                </div>
                <GameId gameId={window.location.href} />
            </div>
        );
    }
}

export default LoadingDisplay;