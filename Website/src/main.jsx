import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import Office from './office.jsx'
import { Canvas } from '@react-three/fiber'
import './lenis.js'
import { GitHubCalendar } from "react-github-calendar"

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
