import React, { useEffect, useRef } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";

const NavBar = (props) => {
    const socket = useSocket()
    const navigate = useNavigate();
    const navRef = useRef(null);

    const createGame = () => {
        socket.emit('create_game');
        socket.on("created", (data => {
            props.setIsNavOpen(false);
            navigate({
                pathname: "/join",
                search: `?${createSearchParams({
                    gameId: data
                })}`
            })
        }))
    };

    const joinGame = () => {
        props.setIsNavOpen(false)
        navigate("/join")
    };

    const mainMenu = () => {
        props.setIsNavOpen(false)
        navigate("/")
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                props.setIsNavOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navRef])

    return (
        <div className="bg-gray-100 flex flex-col items-center">
            <div className="w-full bg-amber-500 p-1 text-white flex justify-around items-center shadow-md">
                <button
                    className="text-white text-2xl focus:outline-none"
                    onClick={() => props.setIsNavOpen(!props.isNavOpen)}
                >
                    ☰
                </button>
                <span className="text-3xl font-extrabold tracking-wider">
                    Tic-tac-toe Plus
                </span>
            </div>
            <nav ref={navRef} className={`fixed top-0 left-0 h-full bg-white shadow-md transform ${props.isNavOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-20`}>
                <button
                    className="p-4 text-gray-600 text-2xl focus:outline-none"
                    onClick={() => props.setIsNavOpen(false)}
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