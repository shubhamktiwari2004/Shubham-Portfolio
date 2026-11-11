
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './lenis.js'
import { GitHubCalendar } from "react-github-calendar"

// Notify the existing page loader that the scene is no longer required.
const LoadingProgressReporter = () => {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('site:load-progress', {
      detail: {
        active: false,
        progress: 100,
      },
    }))
  }, [])

  return null
}

// Render GitHub contribution calendar
const githubContainer = document.getElementById('stat1')

if (githubContainer) {
  createRoot(githubContainer).render(
    <StrictMode>
      <>
        <LoadingProgressReporter />
        <GitHubCalendar
          username="shubhamktiwari2004"
          colorScheme="light"
          blockSize={14}
          blockMargin={4}
          fontSize={14}
        />
      </>
    </StrictMode>
  )
}
