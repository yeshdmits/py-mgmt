import React, { useEffect, useState } from "react";
import TicTacToePlus from "./TicTacToePlus.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Timer from "../Timer.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import GameId from "../GameId.jsx";
import { useApi } from "../../context/ApiContext.jsx";

const GameOnline = () => {
    const navigate = useNavigate();
    const {socket, cookies} = useSocket();
    const {fetchGame} = useApi();
    const {gameId} = useParams();
    const [gameData, setData] = useState(null);
    const [playerLeft, setPlayerLeft] = useState(false);

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
                socket.emit("load_game", gameId)
                let game = cookies.get(gameId)
                console.log(game)
                if (!game) {
                    game = await fetchGame(gameId);
                }

                setData(game)
                setPlayerLeft(game.playerLeft)
            }
        }
        if (socket) {
            socket.on("playerMoved", (data => {
                cookies.set(data.id, data, {maxAge: 600})
                setData(data)
            }))
            socket.on('playerLeft', (data => {
                setPlayerLeft(data.playerLeft)
            }))
        }
        fetchData();
        setPlayerLeft(false);
    }, [socket])

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