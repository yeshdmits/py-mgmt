import React, { useEffect, useRef, useState } from "react";
import TicTacToePlus from "./TicTacToePlus.jsx";
import { useNavigate } from "react-router-dom";
import Timer from "../Timer.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import GameId from "../GameId.jsx";
import { useSearchParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const GameOnline = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [playerLeft, setPlayerLeft] = useState(false);
    const [cookies, setCookie] = useCookies(['tictactoe']);
    const [gameData, setData] = useState(null)
    const socket = useSocket();

    const handleMove = (row, column, innerRow, innerColumn) => {
        console.log("move")
        socket.emit('move', {

            gameId: searchParams.get('gameId'),
            move: {
                "row": row,
                "column": column,
                "innerRow": innerRow,
                "innerColumn": innerColumn
            }
        });
    }

    const createGame = () => {
        socket.emit('create_game');
        socket.on("created", (data => {
            navigate("/join")
        }))
    };

    useEffect(() => {
        setPlayerLeft(false);
        if (socket) {
            console.log(cookies.tictactoe)
            if (!cookies.tictactoe) {
            console.log(searchParams.get('gameId'))

                socket.emit('load_game', searchParams.get('gameId'));
            } else {
                setData(cookies.tictactoe)
                setPlayerLeft(false);
            }
            // socket.on("playerMoved", (data => {
            //     setCookie("tictactoe", JSON.stringify(data))
            //     setData(data)
            // }))
            // socket.on("playerLeft", () => {
            //     console.log("playerLeft")
            //     setPlayerLeft(true);
            // })
        }
    }, [socket, cookies])
    if (playerLeft) {
        return <div>Player Left... Waiting for connection</div>
    }


    if (!gameData) {
        return <div>Loading...</div>
    }
    return (
        <TicTacToePlus
            state={gameData.state}
            nextMove={gameData.nextMove}
            step={gameData.step}
            handleMove={handleMove}
            restart={createGame}
            player={gameData.player}
            history={gameData.historyState}
            gameId={<GameId gameId={searchParams.get('gameId')} />}
        >
            <Timer isActive={gameData != null} expireAt={new Date(gameData.expireAt)} />
        </TicTacToePlus>
    )
}

export default GameOnline;