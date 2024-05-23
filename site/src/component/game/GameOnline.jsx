import React, { useEffect, useState } from "react";
import TicTacToePlus from "./TicTacToePlus.jsx";
import { useNavigate } from "react-router-dom";
import Timer from "../Timer.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import GameId from "../GameId.jsx";
import { useSearchParams } from 'react-router-dom';

const GameOnline = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [playerLeft, setPlayerLeft] = useState(false);
    const [gameData, setData] = useState(null)
    const [active, setActive] = useState(gameData && gameData.status === 'In Progress');
    const socket = useSocket();

    const handleMove = (row, column, innerRow, innerColumn) => {
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

    const handleEndGame = () => {
        setActive(false)
        navigate(0);
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
            if (!gameData) {
                socket.emit('load_game', searchParams.get('gameId'));
                socket.on("bothConnected", (data => {
                    console.log(data)
                    setPlayerLeft(false)
                    setData(data)
                    setActive(data.status !== 'Completed')
                }))
            }
            socket.on("playerMoved", (data => {
                setData(data)
                console.log(data)
            }))

            socket.on("playerLeft", (data) => {
                setPlayerLeft(true)
            })
            return () => {
                socket.disconnect();
            };
        }
    }, [socket])
    if (playerLeft) {
        return <div>Player Left... Waiting for connection</div>
    }


    if (!gameData) {
        return <div>Loading...Game...</div>
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
            status={gameData.status}
            winner={gameData.winner}
            gameId={<GameId gameId={searchParams.get('gameId')} />}
        >
            <Timer isActive={active} expireAt={new Date(gameData.expireAt)} handleEndGame={handleEndGame}/>
        </TicTacToePlus>
    )
}

export default GameOnline;