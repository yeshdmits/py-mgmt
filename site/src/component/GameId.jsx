import React, { useState } from "react";
import Copy from '../assets/copy.svg?react'
import CopySuccess from '../assets/copy-success.svg?react'
import { CopyToClipboard } from 'react-copy-to-clipboard';

const ShareButton = ({ shareText, shareUrl }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: document.title,
                    text: shareText,
                    url: shareUrl
                });
            } else {
                throw new Error('Web Share API is not supported in this browser.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Fallback or error handling
        }
    };

    if (!navigator.share) {
        return (<CopyToClipboard text={shareUrl}
            onCopy={() => setCopySuccess(true)}>
            <div className="hover:cursor-pointer hover:bg-slate-300 flex items-center rounded-r-xl p-2 bg-slate-200 border-solid border-t-1 border-b-1 border-r-1 border-black">
                {copySuccess ?
                    <CopySuccess width='16px' height='16px' />
                    :
                    <Copy width='16px' height='16px' />
                }
            </div>
        </CopyToClipboard>)
    }

    return (
        <div onClick={handleShare}>
            <div className="hover:cursor-pointer hover:bg-slate-300 flex items-center rounded-r-xl p-2 bg-slate-200 border-solid border-t-1 border-b-1 border-r-1 border-black">
                {copySuccess ?
                    <CopySuccess width='16px' height='16px' />
                    :
                    <Copy width='16px' height='16px' />
                }
            </div>
        </div>
    );
};



const GameId = (props) => {
    return (
        <div className="flex justify-center items-stretch m-2">
            <div className="text-sm hover:cursor-default rounded-l-xl p-2 bg-slate-100 border-solid border-t-1 border-b-1 border-l-1 border-black overflow-hidden whitespace-nowrap text-ellipsis">
                {props.gameId}
            </div>
            <ShareButton shareText="python-game" shareUrl={props.gameId} />

        </div>
    )
}

export default GameId;