import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useSocket } from "../../context/SocketContext";
import { ErrorContext } from "../error/ErrorContext";
import Winner from "./Winner";
import View from '../../assets/view.svg?react'

const GameList = (props) => {
    const [dataList, setDataList] = useState([])
    const navigate = useNavigate();

    const { fetchGames } = useApi();
    const { socket } = useSocket();

    const joinGame = () => {
        socket.emit('create_game', true);
        socket.on("created", (data => {
            navigate("/join/" + data)
        }));
    };

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

    const handleItemClick = async (item) => {
        if (props.isNavOpen) {
            return;
        }
        navigate("/join/" + item.id)
    }

    useEffect(() => {
        async function fetch() {
            const games = await fetchGames();
            setDataList(games.sort((o1, o2) => {
                return new Date(o2.createdAt) - new Date(o1.createdAt);
            }))
            console.log(games)
        };
        fetch()
    }, [])

    if (dataList && dataList.length === 0) {
        return (
            <div className="w-full p-2 space-y-4">
                <ErrorContext message="No games are available." status="404" reset={joinGame} action={"Play with Bot"} />
            </div>
        );
    }

    return (
        <div className="w-full p-2 space-y-4">
            {
                dataList && dataList.map((item, index) => {
                    return (
                        <div className="flex border justify-between rounded" key={index}>
                            <div className="flex flex-col justify-between p-4">
                                <div>
                                    <span className="font-semibold">Created:</span> {formatISODate(item.createdAt)}
                                </div>
                                <div>
                                    <span className="font-semibold">Players:</span> {formatPlayers(item.gameContext)}
                                </div>
                            </div>
                            <div onClick={() => handleItemClick(item)}
                                className="flex flex-col justify-between bg-violet-300 hover:bg-violet-400 rounded pt-4 px-4">
                                <div>
                                    <span className="font-semibold">Status:</span> {item.status}
                                </div>
                                <div className="flex justify-between w-full">
                                    <span className="font-semibold">Winner:</span>
                                    <div><Winner winner={item.winner} /></div>
                                </div>
                                <div className="flex justify-center items-end">
                                    <View width="40px" height="40px" />
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