import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Navbar from "../components/navbar/Navbar"
import './resetpassword.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Navbar />
    <div className="bottom-page">
        <h1 id="notication-text">Page under development</h1>
        <a href="/test" id="page">Test page</a>
    </div>
  </StrictMode>,
)