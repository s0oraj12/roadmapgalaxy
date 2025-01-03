import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Scene from './components/galaxy/Scene';
import RoadmapPage from './components/RoadmapPage';

function App() {
  return (
    <Router>
      <div className="w-full h-screen">
        <Routes>
          <Route path="/" element={<Scene />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

