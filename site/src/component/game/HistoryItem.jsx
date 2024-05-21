import React from "react";
import Cross from '../../assets/cross.svg?react'
import Circle from '../../assets/circle.svg?react'

const HistoryItem = (props) => {
    if (props.showItem) {
        return (
            <div className="relative w-full h-full">
                <div className="absolute top-0 left-0 w-full h-full z-10 flex justify-center items-center">
                    {
                        props.isCross ?
                            <Cross width='60px' height='60px' fill="#d9004c" />
                            :
                            <Circle width='60px' height='60px' fill="#0033aa" stroke="#0033aa" strokeWidth={0} />
                    }
                </div>

                <div className="relative opacity-30 grid grid-rows-3 divide-y divide-blue-200">
                    {
                        props.history.map((item, key) => {
                            return (
                                <div className="grid grid-cols-3 divide-x divide-blue-200" key={"out" + key}>
                                    {item.map((i, index) => {
                                        return (
                                            <div
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
}

export default HistoryItem;