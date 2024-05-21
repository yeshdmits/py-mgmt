import React, { useEffect, useRef, useState } from "react";

const Timer = (props) => {
    const intervalRef = useRef(null);
    const [seconds, setSeconds] = useState((props.expireAt - new Date())/1000)
    useEffect(() => {
        if (props.isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds((props.expireAt - new Date())/1000);
            }, 1000)
        }
    })

    const formatSeconds = (seconds) => {
        if (seconds <= 0) {
            return '0:00';
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    };

    return (
        <div className="timer-display">
            <h1>{formatSeconds(seconds)}s</h1>
        </div>
    );
}

export default Timer;