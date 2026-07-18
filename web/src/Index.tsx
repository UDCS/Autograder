import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Navbar from "./components/navbar/Navbar"
import Logo from "./components/logo/Logo"
import NoiseBackground from "./components/background/NoiseBackground"
import BlueButton from "./components/buttons/BlueButton"
import './index.css'

function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetch('/api/auth/valid_login');
        if (response.ok) {
          const json = await response.json();
          if (alive) setLoggedIn(json['message'] === 'true');
        }
      } catch (err) {
        console.error("Fetch error: ", err);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <>
      <NoiseBackground />
      <Navbar />
      <main className="home">
        <header className="home__head">
          <h1 id="welcome-text">Welcome to</h1>
          <div id="logo-main">
            <Logo />
          </div>
        </header>

        <section className="glass hero">
          <p className="hero__desc">
            Autograder is an automated code-grading platform for the classroom.
            Instructors build assignments with custom test cases; students submit
            solutions in the language of their choice and get instant, consistent
            feedback and grades.
          </p>
          <a href={loggedIn ? "/dashboard" : "/login"} className="hero__cta">
            <BlueButton>{loggedIn ? "Go to Dashboard" : "Login"}</BlueButton>
          </a>
          <div className="hero__links">
            <a href="/faq"><button className="ghost-btn">Help / FAQ</button></a>
            <a href="/about"><button className="ghost-btn">About Us</button></a>
          </div>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
