import React from "react";
import Cross from '../../assets/cross.svg?react'
import Circle from '../../assets/circle.svg?react'

const Winner = ({ winner }) => {
    return <>
        <div>
            {winner === 1 ?
                <Cross width='24px' height='24px' fill="#d9004c" />
                : winner === -1 ?
                    <Circle width='24px' height='24px' fill="#0033aa" stroke="#0033aa" strokeWidth={0} />
                    : "Draw"
            }
        </div>
    </>
}

export default Winner;