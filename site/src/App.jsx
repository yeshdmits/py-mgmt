import React, { useState } from 'react'
import "./output.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './component/menu/Menu';
import NavBar from './component/menu/NavBar';
import LoadingDisplay from './component/LoadingDisplay';
import GameOnline from './component/game/GameOnline';
import { SocketProvider } from './context/SocketContext';
import { useSwipeable } from 'react-swipeable';
import GameList from './component/game/GameList';
import { ApiProvider } from './context/ApiContext';

const App = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const handlers = useSwipeable({
    onSwipedLeft: () => setIsNavOpen(false),
    onSwipedRight: () => setIsNavOpen(true),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <>
      <Router>
        <ApiProvider>
          <SocketProvider>
            <div {...handlers} className="min-h-screen flex flex-col justify-start">
              <NavBar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
              <main className='flex grow'>
                <Routes>
                  <Route path="/" element={
                    <GameList isNavOpen={isNavOpen}/>
                  } />
                  <Route path="/play/:gameId" element={
                    <GameOnline />
                  } />
                  <Route path="/join/:gameId" element={
                    <LoadingDisplay />
                  } />
                </Routes>
              </main>
            </div>
          </SocketProvider>
        </ApiProvider>
      </Router>
    </>
  )
}


export default App;