import React, {  useEffect, useState } from "react";
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
import { useSocket } from "../context/SocketContext";
import GameId from "./GameId";

const LoadingDisplay = () => {
    const [searchParams] = useSearchParams();
    const [gameId, setGameId] = useState('');
    const [isKeyboardOpen] = useState(true);
    const socket = useSocket();
    const navigate = useNavigate()

    const getGame = () => {
        navigate({
            pathname: "/play",
            search: `?${createSearchParams({
                gameId: gameId
            })}`
        })
    };

    useEffect(() => {
        if (socket && searchParams.get('gameId')) {
            socket.emit('load_game', searchParams.get('gameId'));
        } else {
            socket.emit('create_game', true);
            socket.on("created", (data => {
                navigate({
                    pathname: "/play",
                    search: `?${createSearchParams({
                        gameId: data
                    })}`
                })
            }))
        }
    }, [])

    if (searchParams.get('gameId')) {

        return (
            <div className="w-full">
                <div className="flex items-center justify-center my-5">
                    Please share Game ID with your friend:
                </div>
                <GameId gameId={searchParams.get('gameId')} />
            </div>
        );
    }

    return (
        <div className={`w-full flex flex-col ${isKeyboardOpen ? 'justify-start' : 'justify-between'}`}>
            <div className="flex justify-center items-stretch">
                <div className="flex flex-col items-center justify-center">
                    <label className="block text-sm font-medium text-gray-700 m-4">Please insert Game ID here:</label>
                    <input
                        className="-full text-base px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        type="text"
                        name="gameId"
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                    />

                </div>
            </div>
            <div
                onClick={getGame}
                className="flex items-center justify-center bg-orange-200 rounded-lg text-gray-800 my-2 hover:cursor-pointer hover:bg-orange-400 hover:text-gray-100 h-[2.5rem]">
                Connect
            </div>
        </div>
    );

}

export default LoadingDisplay;