import { Routes, Route } from 'react-router-dom'
import './globals.css'
import Home from './_root/pages/Home'
import RootLayout from './_root/RootLayout'
import TestPage from './_root/pages/TestPage'
import Game from './_root/pages/Game'

function App() {
  
  return (
    <main className="flex h-screen">
      <Routes>
        <Route element={<RootLayout/>}>
          <Route index element={<Home />} />
          <Route path="/game/:game_id" element={<Game />} />
          <Route path="/test" element={<TestPage />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App
