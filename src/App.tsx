// src/App.tsx (modified)
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/index'
import RoadmapRoute from './pages/roadmap'
import { useNavigationStore } from './store/navigationStore'

function App() {
  const { cursorStyle } = useNavigationStore()

  return (
    <Router>
      <div className="w-full h-screen" style={{ cursor: cursorStyle }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/roadmap" element={<RoadmapRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
