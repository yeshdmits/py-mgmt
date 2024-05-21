import React, { useEffect } from 'react'
import "./output.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './component/menu/Menu';
import NavBar from './component/menu/NavBar';
import LoadingDisplay from './component/LoadingDisplay';
import GameOnline from './component/game/GameOnline';
import { SocketProvider } from './context/SocketContext';
import { CookiesProvider } from 'react-cookie';
import { ErrorContextProvider } from './context/ErrorContext';

const App = () => {

  useEffect(() => {
  }, []);

  return (
    <>
      <Router>
        <CookiesProvider defaultSetOptions={{ path: '/' }}>
          <SocketProvider>
            <div className="min-h-screen flex flex-col justify-start">
              <NavBar />
              <main className='flex grow'>
                <ErrorContextProvider>
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
                  </Routes>
                </ErrorContextProvider>
              </main>
            </div>
          </SocketProvider>
        </CookiesProvider>
      </Router>
    </>
  )
}


export default App;