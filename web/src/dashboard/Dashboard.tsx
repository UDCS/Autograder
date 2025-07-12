import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './dashboard.css'
import DashboardBody from './DashboardBody'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DashboardBody />
  </StrictMode>,
)