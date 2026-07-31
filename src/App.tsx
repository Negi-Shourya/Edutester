import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ChapterTests from './pages/ChapterTests'
import PaperTests from './pages/PaperTests'
import TestInterface from './pages/TestInterface'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chapter-tests" element={<ChapterTests />} />
          <Route path="/paper-tests" element={<PaperTests />} />
          <Route path="/test" element={<TestInterface />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
