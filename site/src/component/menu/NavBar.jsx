import React, { useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSwipeable } from 'react-swipeable';
import { useSocket } from "../../context/SocketContext";
import { useCookies } from "react-cookie";

const NavBar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const socket = useSocket()
    const navigate = useNavigate();
    // const [setCookie] = useCookies(['tictactoe']);

    const createGame = () => {
        socket.emit('create_game');
        socket.on("created", (data => {
            setIsNavOpen(false);
            navigate({
                pathname: "/join",
                search: `?${createSearchParams({
                    gameId: data
                })}`
            })
        }))
    };

    const joinGame = () => {
        setIsNavOpen(false)
        navigate("/join")
    };

    const mainMenu = () => {
        setIsNavOpen(false)
        navigate("/")
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => setIsNavOpen(false),
        onSwipedRight: () => setIsNavOpen(true),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    return (
        <div {...handlers} className="bg-gray-100 flex flex-col items-center">
            <div className="w-full bg-amber-500 p-1 text-white flex justify-around items-center shadow-md">
                <button
                    className="text-white text-2xl focus:outline-none"
                    onClick={() => setIsNavOpen(!isNavOpen)}
                >
                    ☰
                </button>
                <span className="text-3xl font-extrabold tracking-wider">
                    Tic-tac-toe Plus
                </span>
            </div>
            <nav className={`fixed top-0 left-0 h-full bg-white shadow-md transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-20`}>
                <button
                    className="p-4 text-gray-600 text-2xl focus:outline-none"
                    onClick={() => setIsNavOpen(false)}
                >
                    ×
                </button>
                <ul className="mt-8">
                    <li onClick={mainMenu}
                        className="p-4 border-b hover:cursor-pointer">Main Menu</li>
                    <li onClick={createGame}
                        className="p-4 border-b hover:cursor-pointer">Create Game</li>
                    <li onClick={joinGame}
                        className="p-4 border-b hover:cursor-pointer">Join Game</li>
                </ul>
            </nav>

        </div>
    )
}

export default NavBar;