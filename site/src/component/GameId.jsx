import React, { useState } from "react";
import Copy from '../assets/copy.svg?react'
import CopySuccess from '../assets/copy-success.svg?react'
import {CopyToClipboard} from 'react-copy-to-clipboard';

const GameId = (props) => {
    const [copySuccess, setCopySuccess] = useState(false);
    return (
        <div className="flex justify-center items-stretch">
            <div className="text-sm hover:cursor-default rounded-l-xl p-2 bg-slate-100 border-solid border-t-1 border-b-1 border-l-1 border-black">
                {props.gameId}
            </div>
            <CopyToClipboard text={props.gameId}
                onCopy={() => setCopySuccess(true)}>
                <div className="hover:cursor-pointer hover:bg-slate-300 flex items-center rounded-r-xl p-2 bg-slate-200 border-solid border-t-1 border-b-1 border-r-1 border-black">
                {copySuccess ?
                    <CopySuccess width='16px' height='16px' />
                    :
                    <Copy width='16px' height='16px' />
                }
            </div>
                </CopyToClipboard>
        </div>
    )
}

export default GameId;