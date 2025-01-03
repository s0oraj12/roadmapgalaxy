// src/pages/index.tsx
import { useEffect } from 'react'
import { useNavigationStore } from '../store/navigationStore'
import Scene from '../components/galaxy/Scene'

const HomePage = () => {
  const { setCurrentScene } = useNavigationStore()
  
  useEffect(() => {
    setCurrentScene('galaxy')
  }, [setCurrentScene])

  return <Scene />
}

export default HomePage
