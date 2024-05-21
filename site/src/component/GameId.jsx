import React, { useState } from "react";
import Copy from '../assets/copy.svg?react'
import CopySuccess from '../assets/copy-success.svg?react'

const GameId = (props) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const copyToClipboard = async () => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(props.gameId);
                console.log("Copied to clipboard");
                setCopySuccess(true);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = props.gameId;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                console.log("Copied to clipboard (fallback)");
                setCopySuccess(true);
            }
        } catch (err) {
            console.log(err)

            setCopySuccess(false);
        }

        setTimeout(() => {
            setCopySuccess(false);
        }, 3000);
    };

    return (
        <div className="flex justify-center items-stretch">
            <div className="text-sm hover:cursor-default rounded-l-xl p-2 bg-slate-100 border-solid border-t-1 border-b-1 border-l-1 border-black">
                {props.gameId}
            </div>
            <div className="hover:cursor-pointer hover:bg-slate-300 flex items-center rounded-r-xl p-2 bg-slate-200 border-solid border-t-1 border-b-1 border-r-1 border-black"
                onClick={copyToClipboard}>
                {copySuccess ?
                    <CopySuccess width='16px' height='16px' />
                    :
                    <Copy width='16px' height='16px' />
                }
            </div>
        </div>
    )
}

export default GameId;