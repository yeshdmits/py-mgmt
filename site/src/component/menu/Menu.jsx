import React from "react";

const menuItemCss = "mt-4 flex items-center justify-center border rounded-lg text-white bg-violet-400 hover:cursor-pointer hover:bg-green-400 hover:text-gray-100 h-[4rem] w-[90vw]";

const Menu = (props) => {
    return (
        <>
            <div className="flex grow pt-8">
                <div className="flex flex-col items-center justify-start grow">
                    <div
                        className={menuItemCss}
                        onClick={props.allGames}>
                        Home
                    </div>
                    <div
                        className={menuItemCss}
                        onClick={props.create}>
                        Play with friend
                    </div>
                    <div
                        className={menuItemCss}
                        onClick={props.join}>
                        Play with Bot
                    </div>
                </div>
            </div>
        </>
    )
}

export default Menu;