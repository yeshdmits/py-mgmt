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
        <SocketProvider>
          <div {...handlers} className="min-h-screen flex flex-col justify-start">
            <NavBar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
            <main className='flex grow'>
              <Routes>
                <Route path="/" element={
                  <Menu />
                } />
                <Route path="/play" element={
                  <GameOnline />
                } />
                <Route path="/join" element={
                  <LoadingDisplay />
                } />
                <Route path="/games" element={
                  <GameList isNavOpen={isNavOpen} />
                } />
              </Routes>
            </main>
          </div>
        </SocketProvider>
      </Router>
    </>
  )
}


export default App;