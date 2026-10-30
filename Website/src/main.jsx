import { StrictMode, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Office from './office.jsx'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import './lenis.js'
import { GitHubCalendar } from "react-github-calendar"

export const LoadingProgressReporter = () => {
  const { active, progress } = useProgress()

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('site:load-progress', {
      detail: { active, progress },
    }))
  }, [active, progress])

  return null
}

createRoot(document.getElementById('office')).render(
  <StrictMode>
    <Canvas
      style={{ pointerEvents: 'none' }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2.5], fov: 40 }}
      shadows
      gl={{
        toneMapping: 3, 
        toneMappingExposure: 0.8,
        outputColorSpace: 'srgb',
      }}
    >
      <LoadingProgressReporter />
      <Suspense fallback={null}>
        <Office />
      </Suspense>
    </Canvas>
  </StrictMode>,
)

createRoot(document.getElementById('stat1')).render(
  <GitHubCalendar
    username="chahalarsh"
    colorScheme='light'
    blockSize={14}
    blockMargin={4}
    fontSize={14}
  />
)
