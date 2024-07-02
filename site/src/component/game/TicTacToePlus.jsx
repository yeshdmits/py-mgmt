import React, { useEffect, useState } from "react";
import Cross from '../../assets/cross.svg?react'
import Circle from '../../assets/circle.svg?react'
import TicTacToeItem from "./TicTacToeItem.jsx";

const TicTacToePlus = (props) => {
    const [state, setState] = useState(props.state);
    const [nextTurn, setNextTurn] = useState(props.nextMove);
    const cross = props.step === 1

    const handleQuit = () => {
        props.quit();
    }

    useEffect(() => {
        setState(props.state);
        setNextTurn(props.nextMove)
    }, [props.state, props.nextMove])

    return (
        <div className="flex flex-col justify-start items-center min-w-full">
            <div className="flex flex-col justify-start max-h-72 w-full">
                {Array.isArray(state) &&
                    <div className="pb-2">

                        <div className="flex justify-around pb-2">
                            <div className="flex items-center">
                                <div className="pr-2">Move:</div>
                                {cross ?
                                    <Cross width='16px' height='16px' fill="#d9004c" />
                                    :
                                    <Circle width='16px' height='16px' fill="#0033aa" stroke="#0033aa" />
                                }
                            </div>
                            <div>{props.children}</div>

                        </div>
                        <div>{props.gameId}</div>
                    </div>

                }
                {(props.status === 'Completed') &&
                    <div className="flex flex-col items-center justify-around h-[4.5rem]">
                        <div>
                            Winner:
                        </div>
                        <div>
                            {props.winner === 1 ?
                                <Cross width='24px' height='24px' fill="#d9004c" />
                                : props.winner === -1 ?
                                <Circle width='24px' height='24px' fill="#0033aa" stroke="#0033aa" strokeWidth={0} />
                                : "Draw"
                            }
                        </div>
                    </div>
                }
            </div>
            <div className="grid grid-rows-3 divide-y divide-zinc-700">
                {state.map((item, key) => {
                    return (
                        <div className="grid grid-cols-3 divide-x divide-zinc-700 auto-cols-max max-h-32" key={"highout" + key}>
                            {item.map((i, index) => {
                                return (
                                    <div className={(nextTurn === null || (key === nextTurn.row && index === nextTurn.column)) && props.status !== 'Completed' ?
                                        "grid grid-rows-1 justify-center bg-teal-100 max-h-32" :
                                        "grid grid-rows-1 justify-center max-h-32"}
                                        key={"highin" + index}>
                                        <TicTacToeItem
                                            row={key}
                                            column={index}
                                            active={nextTurn === null || (key === nextTurn.row && index === nextTurn.column)}
                                            cross={cross}
                                            fields={i}
                                            canMove={props.status === 'In Progress' && props.player?.move}
                                            handleMove={props.handleMove}
                                            history={props.history[key][index]}
                                        />
                                    </div>
                                );
                            })}

                        </div>
                    );
                })
                }
            </div>
            <div onClick={handleQuit}
                className="w-full mt-4 flex items-center justify-center bg-violet-200 rounded-lg text-gray-800 hover:cursor-pointer hover:bg-violet-400 hover:text-gray-100 h-[2.5rem]">
                Quit
            </div>
        </div>
    );
}

export default TicTacToePlus;