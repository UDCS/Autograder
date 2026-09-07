import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import auth from '../utils/auth'
import './dashboard.css'
import DashboardBody from './DashboardBody'

function DashboardApp() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      await auth.init()
      if (alive) setReady(true)
    })()

    return () => {
      alive = false
    }
  }, [])

  return ready ? <DashboardBody /> : null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DashboardApp />
  </StrictMode>,
)