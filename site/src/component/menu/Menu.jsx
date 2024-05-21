import React, { useEffect } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSocket } from '../../context/SocketContext.jsx'

const Menu = () => {
    const navigate = useNavigate();
    const socket = useSocket();

    const createGame = () => {
        socket.emit('create_game');
        socket.on("created", (data => {
            navigate({
                pathname: "/join",
                search: `?${createSearchParams({
                    gameId: data
                })}`
            })
        }))
    };

    const joinGame = () => {
        navigate("/join")
    };

    useEffect(() => {
    }, []);

    return (
        <>
            <div className="flex grow">
                <div className="flex flex-col items-center justify-center grow">
                    <div
                        className="flex items-center justify-center bg-green-200 rounded-lg text-gray-800 hover:cursor-pointer hover:bg-green-400 hover:text-gray-100 h-[5.5rem] w-[8.5rem]"
                        onClick={createGame}>
                        Create Game</div>

                    <div className="flex items-center justify-center h-[5.5rem]">
                        OR
                    </div>
                    <div
                        className="flex items-center justify-center bg-orange-200 rounded-lg text-gray-800 my-2 hover:cursor-pointer hover:bg-orange-400 hover:text-gray-100 h-[5.5rem] w-[8.5rem]"
                        onClick={joinGame}
                    >
                        Join Game</div>
                </div>
            </div>
        </>
    )
}

export default Menu;