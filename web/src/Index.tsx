import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Navbar from "./components/navbar/Navbar"
import Logo from "./components/logo/Logo"
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Navbar />
    <div className="bottom-page">
      <h1 id="welcome-text">Welcome to</h1>
      <div id="logo-main">
        <Logo />
      </div>
      <a href="/test" id="page">Test page</a>
    </div>
  </StrictMode>,
)
