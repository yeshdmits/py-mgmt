import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import Menu from "./Menu";

const NavBar = (props) => {
    const {socket} = useSocket()
    const navigate = useNavigate();
    const navRef = useRef(null);

    const allGames = () => {
        props.setIsNavOpen(false)
        navigate("/")
    }

    const createGame = () => {
        props.setIsNavOpen(false)
        socket.emit('create_game', false);
        socket.on("created", (data => {
            navigate("/join/" + data)
        }));
    };

    const joinGame = () => {
        props.setIsNavOpen(false)
        socket.emit('create_game', true);
        socket.on("created", (data => {
            navigate("/join/" + data)
        }));
    };

    return (
        <div className="bg-gray-100 flex flex-col items-center sticky w-full top-0 left-0 right-0'">
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
            <nav ref={navRef} className={`fixed top-0 left-0 w-full h-full bg-white shadow-md transform ${props.isNavOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-20`}>
                <button
                    className="p-4 text-gray-600 text-2xl focus:outline-none"
                    onClick={() => props.setIsNavOpen(false)}
                >
                    ×
                </button>
                <Menu create={createGame} join={joinGame} allGames={allGames} />
            </nav>

        </div>
    )
}

export default NavBar;