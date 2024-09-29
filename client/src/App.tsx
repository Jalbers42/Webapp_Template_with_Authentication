import { Routes, Route } from 'react-router-dom'
import './globals.css'
import Home from './page_structure/pages/Home'
import RootLayout from './page_structure/RootLayout'
import TestPage from './page_structure/pages/TestPage'
import Game from './page_structure/pages/Game'

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
