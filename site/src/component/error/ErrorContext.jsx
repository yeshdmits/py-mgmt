import React from 'react';

export const ErrorContext = ({ message, status, reset, action }) => {
    const handleClick = () => {
        reset()
    }
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
                <div className="text-gray-600 p-4 mb-4 text-8xl">
                    {status}
                </div>
                <div className="text-gray-400 p-4 mb-4">
                    {message}
                </div>
                <div
                    onClick={handleClick}
                    className="bg-violet-400 text-4xl align-middle text-center w-full h-[4rem] text-white px-4 py-2 rounded-lg cursor-pointer mt-10 hover:bg-blue-700 transition"
                >
                    {action}
                </div>
            </div>
        </>
    )
};