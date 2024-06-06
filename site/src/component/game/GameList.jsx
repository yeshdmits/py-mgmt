import React, { useEffect, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";

const GameList = (props) => {
    const [dataList, setDataList] = useState([])
    const navigate = useNavigate()
    const socket = useSocket()

    const formatISODate = (isoString) => {
        const date = new Date(isoString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}-${month} ${hours}:${minutes}`;
    }

    const formatPlayers = (gameContext) => {
        if (!gameContext) {
            return ""
        }
        if (gameContext.player1.connected && gameContext.player2.connected) {
            return '2/2'
        }

        if (gameContext.player1.connected || gameContext.player2.connected) {
            return '1/2'
        }

        return '0/2';
    }

    const handleItemClick = (item) => {
        if (props.isNavOpen) {
            return;
        }
        // socket.emit('load_game', searchParams.get('gameId'));
        navigate({
            pathname: "/play",
            search: `?${createSearchParams({
                gameId: item.id
            })}`
        })
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('http://localhost:5000/api/list');
                const data = await response.json();
                setDataList(data)
            } catch (error) {
                console.error('Error fetching data from REST API:', error);
            }
        }
        
        fetchData()
    }, [])

    return (
        <div className="w-full p-2 space-y-4">
            {
                dataList && dataList.map((item, index) => {
                    return (
                        <div className="border rounded p-4" key={index}>
                            <div className="flex justify-between mb-2">
                                <div className="flex flex-col justify-around items-start">
                                    <div>
                                        <span className="font-semibold">Created:</span> {formatISODate(item.createdAt)}
                                    </div>
                                    {/* <div>
                                        <span className="font-semibold">Until:</span> {formatISODate(item.expireAt)}
                                    </div> */}
                                </div>
                                <div className="flex flex-col justify-around items-start">
                                    <div>
                                        <span className="font-semibold">Status:</span> {item.status}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Winner:</span> {item.winner}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <span className="font-semibold">Players:</span> {formatPlayers(item.gameContext)}
                                </div>
                                <div onClick={() => handleItemClick(item)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    <div>Join</div>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default GameList;