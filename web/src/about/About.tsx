import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Navbar from "../components/navbar/Navbar"
import Logo from "../components/logo/Logo"
import NoiseBackground from "../components/background/NoiseBackground"
import BlueButton from "../components/buttons/BlueButton"
import './about.css'

const LANGUAGES = [
  { name: "Python", detail: "Run on Python 3." },
  { name: "C", detail: "Compiled with gcc -O2, linked against libm." },
  { name: "Java", detail: "Compiled and run on OpenJDK 17." },
  { name: "Racket", detail: "Run on Racket — with a #lang line added if you forget one." },
];

const STEPS = [
  {
    title: "Submit",
    body: "Your code is saved against the question and the grader is queued. " +
      "Nothing is scheduled behind a shared job queue you have to wait your turn in.",
  },
  {
    title: "Isolate",
    body: "Each submission runs in its own disposable container as an unprivileged " +
      "user, in a scratch workspace that is destroyed afterwards. Student code runs " +
      "with a minimal, allow-listed environment, so it can never read the platform's " +
      "own credentials.",
  },
  {
    title: "Run",
    body: "Every test case gets its own time limit, set by the instructor, plus a hard " +
      "cap on how much output it can produce. Programs that hang are cut off and " +
      "reported as timeouts instead of taking the platform down with them.",
  },
  {
    title: "Report",
    body: "Output is normalized for line endings and trailing whitespace before it is " +
      "compared, so a stray newline never costs anyone a point. Each test case is " +
      "scored, and the results roll up into a grade.",
  },
];

function About() {
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
      <main className="about">
        <header className="about__head">
          <p className="about__eyebrow">About</p>
          <div id="logo-about" className="wordmark">
            <Logo />
          </div>
          <p className="about__tagline">
            An automated code-grading platform, built at the University of Dallas
            by the students who use it.
          </p>
        </header>

        <section className="glass about__panel">
          <h2 className="about__h2">Why we built it</h2>
          <p>
            Automated grading is only worth having if you can trust it. UD's computer
            science courses have leaned on outside grading platforms before, and when
            one of those platforms changes its pricing, changes its rules, or simply
            goes away, the coursework built on top of it goes with it.
          </p>
          <p>
            Autograder is the alternative: a grading platform the department runs
            itself, on its own terms, with no vendor standing between an instructor
            and their students' work. If something needs to change, the people who
            need it changed are the people who wrote it.
          </p>
        </section>

        <div className="about__row">
          <section className="glass about__panel">
            <h2 className="about__h2">For instructors</h2>
            <p>
              Set up a classroom with a course code, description, and term dates,
              then build the roster &mdash; students can be enrolled before they
              have even made an account. Assignments stay in draft until you make
              them visible, so nothing goes live before you are ready, and deadlines
              are stored as real instants in the course's own timezone rather than
              whatever the server happens to be set to.
            </p>
            <p>
              Every question carries its own starter code and reference solution, and
              its points are set per test case. Run your solution against the test
              cases and Autograder fills
              in the expected output for you. Grades roll up per student and per
              assignment, late submissions are flagged automatically, and any grade
              can be overridden by hand when a submission deserves it.
            </p>
          </section>

          <section className="glass about__panel">
            <h2 className="about__h2">For students</h2>
            <p>
              Write your solution in the browser &mdash; a real code editor, with
              syntax highlighting for every supported language &mdash; and submit.
              Grading starts immediately and the verdict appears as soon as it lands:
              passed, partial, or failed, with per-test-case feedback that tells you
              what actually went wrong.
            </p>
            <p>
              Hidden test cases stay hidden. You see the verdict and the points, not
              the instructor's inputs. Every attempt you make is kept, so your
              instructor can see how a solution got to where it is.
            </p>
          </section>
        </div>

        <section className="glass about__panel">
          <h2 className="about__h2">How grading works</h2>
          <ol className="about__steps">
            {STEPS.map((step, i) => (
              <li className="about__step" key={step.title}>
                <span className="about__step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="about__step-title">{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="glass about__panel">
          <h2 className="about__h2">Four languages</h2>
          <p>
            One platform for the whole sequence, from a first intro course to the
            harder ones later on.
          </p>
          <ul className="about__langs">
            {LANGUAGES.map((lang) => (
              <li className="about__lang" key={lang.name}>
                <span className="about__lang-name">{lang.name}</span>
                <span className="about__lang-detail">{lang.detail}</span>
              </li>
            ))}
          </ul>
          <p className="about__note">
            Racket support meant more than picking a compiler: the browser editor had
            no Racket mode, so we wrote one.
          </p>
        </section>

        <section className="glass about__panel">
          <h2 className="about__h2">Built by UD students</h2>
          <p>
            Autograder has been built by University of Dallas computer science
            students since September 2024 &mdash; the same students who submit to it.
            Sitting on both sides of the grader tends to sharpen your opinions about
            how it should behave.
          </p>
          <p>
            It ships as a single self-contained binary: a Go backend on PostgreSQL,
            with the React front end embedded directly in the executable, so deploying
            it is copying one file. Accounts are invitation-only and sessions are
            tracked server-side, so a classroom stays a classroom.
          </p>
        </section>

        <footer className="about__footer">
          <a href={loggedIn ? "/dashboard" : "/login"} className="about__cta">
            <BlueButton>{loggedIn ? "Go to Dashboard" : "Login"}</BlueButton>
          </a>
          <div className="about__links">
            <a href="/"><button className="ghost-btn">Home</button></a>
            <a href="/faq"><button className="ghost-btn">Help / FAQ</button></a>
          </div>
        </footer>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <About />
  </StrictMode>,
)
