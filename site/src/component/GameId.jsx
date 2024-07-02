import React, { useState, useEffect } from "react";
import Copy from '../assets/copy.svg?react'
import CopySuccess from '../assets/copy-success.svg?react'
import { CopyToClipboard } from 'react-copy-to-clipboard';

const ShareButton = ({ shareText, shareUrl }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const handleCopy = () => {
        setCopySuccess(true)
    }

    useEffect(() => {
        if (copySuccess) {
            const timer = setTimeout(() => {
                setCopySuccess(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [copySuccess]);

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
            onCopy={handleCopy}>
            {copySuccess ?

                <div className="hover:cursor-pointer hover:bg-slate-300 flex justify-center items-center rounded-xl p-2 bg-slate-200 border-solid border-t-1 border-b-1 border-r-1 border-black">
                    Copied
                    <CopySuccess width='16px' height='16px' />
                </div>
                :
                <div className="hover:cursor-pointer hover:bg-slate-300 flex justify-center items-center rounded-xl p-2 bg-slate-200 border-solid border-t-1 border-b-1 border-r-1 border-black">

                    Share<Copy width='16px' height='16px' />
                </div>

            }
        </CopyToClipboard>)
    }

    return (
        <div onClick={handleShare}>
            <div className="hover:cursor-pointer hover:bg-slate-300 flex items-center rounded-r-xl p-2 bg-slate-200 border-solid border-t-1 border-b-1 border-r-1 border-black">
                Share<Copy width='16px' height='16px' />
            </div>
        </div>
    );
};



const GameId = (props) => {
    return (
        <div className="flex flex-col justify-center items-stretch m-2">
            <ShareButton shareText="python-game" shareUrl={props.gameId} />
        </div>
    )
}

export default GameId;