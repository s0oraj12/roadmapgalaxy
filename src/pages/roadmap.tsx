// src/pages/roadmap.tsx
import { useEffect } from 'react'
import { useNavigationStore } from '../store/navigationStore'
import RoadmapPage from '../components/RoadmapPage'

const RoadmapRoute = () => {
  const { setCurrentScene } = useNavigationStore()
  
  useEffect(() => {
    setCurrentScene('roadmap')
  }, [setCurrentScene])

  return <RoadmapPage />
}

export default RoadmapRoute
