import React, { useEffect, useState } from "react";
import TicTacToePlus from "./TicTacToePlus.jsx";

const GameMain = () => {
    const [data, setData] = useState(null);
    const [gameId, setGameId] = useState("")
    const [loading, setLoading] = useState(false);

    useEffect(() => {

    }, []);

    const createGame = () => {
        setLoading(true)
        // fetch('http://localhost:5000/game/new', {
        fetch('/game/', {
            method: 'POST'
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                console.log(data);
                setData(data);
                setGameId(data.id)
                setLoading(false); // Set loading state to false on success
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    };

    const getGame = () => {
        setLoading(true)
        // fetch('http://localhost:5000/game/' + gameId)
        fetch('/game/' + gameId)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                console.log(data);
                setData(data);
                setGameId(data.id)
                setLoading(false); // Set loading state to false on success
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    };

    const handleMove = (row, column, innerRow, innerColumn) => {
        // fetch('http://localhost:5000/game/' + gameId, {
        fetch('/game/' + gameId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                row: row,
                column: column,
                innerRow: innerRow,
                innerColumn: innerColumn
            })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                console.log(data);
                setData(data);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    const handleGameId = (e) => {
        setGameId(e.target.value);
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (data) {
        return <TicTacToePlus state={data.state} nextMove={data.nextMove} step={data.step} handleMove={handleMove} restart={createGame} />
    }


    return (
        <div className="grid grid-rows-2">
            <div
                className="flex items-center justify-center bg-green-200 rounded-lg text-gray-800 my-2 hover:cursor-pointer hover:bg-green-400 hover:text-gray-100 h-[2.5rem]"
                onClick={createGame}>
                Create Game</div>
            <div
                className="flex items-center justify-center bg-orange-200 rounded-lg text-gray-800 my-2 hover:cursor-pointer hover:bg-orange-400 hover:text-gray-100 h-[2.5rem]"
                onClick={getGame}
            >
                Load game</div>
            <div className="flex flex-col items-center justify-center">

                <div className="flex items-center justify-center">
                    <label className="block text-sm font-medium text-gray-700 m-4">Game ID</label>
                    <input
                        className="-full text-base px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        type="text"
                        name="gameId"
                        value={gameId}
                        onChange={handleGameId}
                    />
                </div>

            </div>

        </div>
    );
}

export default GameMain;