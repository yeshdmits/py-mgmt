import React, { useState, useEffect } from "react";
import Cross from '../../assets/cross.svg?react'
import Circle from '../../assets/circle.svg?react'
import HistoryItem from "./HistoryItem";

const TicTacToeItem = (props) => {

    const [twoDimArr, setTwoDimArr] = useState(props.fields);

    const handleClick = (key, index) => {
        if (!props.active || twoDimArr[key][index] !== 0 || !props.canMove) {
            return;
        }
        props.handleMove(props.row, props.column, key, index)
    }
    useEffect(() => {
        setTwoDimArr(props.fields)
    }, [props.fields])

    return (
        <div className="flex justify-center items-center">
            <HistoryItem showItem={!Array.isArray(twoDimArr)} isCross={twoDimArr === 1} history={props.history}/>
            <div className="grid grid-rows-3 divide-y divide-blue-200">
                {Array.isArray(twoDimArr) && twoDimArr.map((item, key) => {
                    return (
                        <div className="grid grid-cols-3 divide-x divide-blue-200" key={"out" + key}>
                            {item.map((i, index) => {
                                return (
                                    <div
                                        onClick={() => handleClick(key, index)}
                                        key={"in" + index}
                                        className={i === 0 ? "p-4 hover:cursor-pointer hover:bg-slate-400 flex justify-center items-center"
                                            : "flex justify-center items-center"}>
                                        {i === 0 ? '' : i === 1 ?
                                            <Cross width='32px' height='32px' fill="#d9004c" />
                                            :
                                            <Circle width='32px' height='32px' fill="#0033aa" strokeWidth={0} />}
                                    </div>
                                );
                            })}

                        </div>
                    );
                })
                }
            </div>
        </div>
    );
}

export default TicTacToeItem;