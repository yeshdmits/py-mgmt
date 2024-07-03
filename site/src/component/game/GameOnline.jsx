import React, { useEffect, useState } from "react";
import TicTacToePlus from "./TicTacToePlus.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Timer from "../Timer.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import GameId from "../GameId.jsx";

const GameOnline = () => {
    const navigate = useNavigate();
    const {socket, cookies} = useSocket();
    const {gameId} = useParams();
    const [gameData, setData] = useState();

    const handleMove = (row, column, innerRow, innerColumn) => {
        socket.emit('move', {
            gameId: gameId,
            move: {
                "row": row,
                "column": column,
                "innerRow": innerRow,
                "innerColumn": innerColumn
            }
        });
    }

    const handleEndGame = () => {
        navigate(0);
    }

    const quitGame = () => {
        socket.emit('quit');
        navigate("/")
    };

    useEffect(() => {
        async function fetchData() {
            if (!gameData) {
                setData(cookies.get(gameId))
                socket.emit("load_game", gameId)
                socket.on("bothConnected", ((data) => {
                    console.log(data)
                    setData(data)
                }))
            }
        }
        if (socket) {
            fetchData();
            socket.on("playerMoved", (data => {
                cookies.set(data.id, data, {maxAge: 600})
                setData(data)
            }))
        }
    }, [socket]);

    if (!gameData) {
        return <div>Loading...Game...</div>
    }
    return (
        <TicTacToePlus
            state={gameData.state}
            nextMove={gameData.nextMove}
            step={gameData.step}
            handleMove={handleMove}
            quit={quitGame}
            player={gameData.player}
            history={gameData.historyState}
            status={gameData.status}
            winner={gameData.winner}
            gameId={<GameId gameId={window.location.href} />}
        >
            <Timer isActive={gameData && gameData.status === 'In Progress'} expireAt={new Date(gameData.expireAt)} handleEndGame={handleEndGame} />
        </TicTacToePlus>
    )
}

export default GameOnline;