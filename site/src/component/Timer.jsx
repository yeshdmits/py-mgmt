import React, { useEffect, useRef, useState } from "react";

const Timer = (props) => {
    const [intervalRef, setIntervalRef] = useState(null);
    const [seconds, setSeconds] = useState((props.expireAt - new Date()) / 1000)
    useEffect(() => {
        if (props.isActive) {
            if (seconds <= 0) {
                clearInterval(intervalRef);
                props.handleEndGame();
            } else {
                setIntervalRef(setInterval(() => {
                    setSeconds((props.expireAt - new Date()) / 1000);
                }, 1000))
            }
        } else {
            clearInterval(intervalRef);
        }
    })

    const formatSeconds = (seconds) => {
        if (seconds <= 0) {
            clearInterval(intervalRef);
            return '00:00';
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    };

    return (
        <div className="timer-display">
            <h1>{formatSeconds(seconds)}</h1>
        </div>
    );
}

export default Timer;