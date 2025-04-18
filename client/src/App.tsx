import { Routes, Route } from 'react-router-dom'
import './globals.css'
import Home from './page_structure/pages/Home'
import RootLayout from './page_structure/RootLayout'

function App() {

  return (
    <main className="flex h-screen">
      <Routes>
        <Route element={<RootLayout/>}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App
