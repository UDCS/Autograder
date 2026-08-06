import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Navbar from "../components/navbar/Navbar"
import Logo from "../components/logo/Logo"
import NoiseBackground from "../components/background/NoiseBackground"
import BlueButton from "../components/buttons/BlueButton"
import FaqItem from './FaqItem'
import './FAQ.css'

/* Answers are JSX rather than strings because several need inline code, lists,
   or more than one paragraph. Sections render in order as glass panels. */
const SECTIONS = [
  {
    title: "Getting started",
    items: [
      {
        q: "I got an email inviting me to Autograder. What is this?",
        a: <>
          <p>
            Autograder is the platform your instructor uses for programming
            assignments. You write your solution in the browser, submit it, and it
            is run against the instructor's test cases and graded automatically —
            usually within seconds.
          </p>
          <p>
            The email means an instructor has added you to one of their courses.
            Follow the link in it to create your account, and your classes will
            already be waiting for you.
          </p>
        </>,
      },
      {
        q: "How do I get an account?",
        a: <>
          <p>
            You cannot sign yourself up. An instructor or an administrator invites
            you by email address, and that email contains a link that creates your
            account.
          </p>
          <p>
            Invitation links are valid for <strong>7 days</strong>. If yours has
            expired, ask your instructor to have a new one sent.
          </p>
        </>,
      },
      {
        q: "My invitation link says \"Invalid invite\".",
        a: <>
          <p>That means the link is no longer usable. The usual reasons:</p>
          <ul>
            <li>It is more than 7 days old.</li>
            <li>You have already used it to create your account — try signing in instead.</li>
            <li>
              You were invited more than once. If you received two invitation
              emails, <strong>only the first link works</strong>.
            </li>
          </ul>
          <p>Ask your instructor to check with an administrator and re-issue it.</p>
        </>,
      },
      {
        q: "What are the password rules?",
        a: <>
          <p>
            Between 8 and 64 characters, with at least one uppercase letter, one
            lowercase letter, one digit, and one special character.
          </p>
          <p>
            The accepted special characters are exactly these:{" "}
            <code>! @ # ~ $ % ^ &amp; * ( ) _ + {"{"} {"}"} " : ; ' ? / &gt; . &lt; ,</code>
          </p>
          <p className="faq__warn">
            Watch out: <code>-</code> <code>=</code> <code>[</code> <code>]</code>{" "}
            <code>\</code> <code>|</code> and <code>`</code> do <strong>not</strong>{" "}
            count as special characters. A password like <code>Passw0rd-</code> will
            be rejected even though it looks like it should qualify.
          </p>
        </>,
      },
      {
        q: "I forgot my password.",
        a: <>
          <p>
            Use <strong>Forgot Password?</strong> on the sign-in page. If you are
            already signed in, there is a <strong>Reset Password</strong> button in
            Account Settings.
          </p>
          <p>
            You will get an email with a reset link. It is valid for 7 days and can
            only be used once. For your privacy the confirmation message looks the
            same whether or not an account exists for that address, so it is not a
            way to check whether someone is registered.
          </p>
        </>,
      },
      {
        q: "Why was I signed out?",
        a: <p>
          Sessions are short-lived, so a tab left open for a while will ask you to
          sign in again. Your work is not lost — code you have typed is saved
          automatically as you go.
        </p>,
      },
    ],
  },
  {
    title: "Using Autograder as a student",
    items: [
      {
        q: "How do I join a class?",
        a: <>
          <p>
            You don't, and there is <strong>no join code</strong> to enter. Your
            instructor adds you to the class by email address, and it appears on
            your dashboard automatically.
          </p>
          <p>
            If a class is missing, the usual cause is an address mismatch: your
            enrolment only connects if you registered with the exact address your
            instructor typed. Check with them which one they used.
          </p>
        </>,
      },
      {
        q: "Where are my assignments?",
        a: <>
          <p>
            Your dashboard groups your classes into <strong>Enrolled</strong> (term
            hasn't started), <strong>Active</strong>, and{" "}
            <strong>Expired</strong>, based on the dates your instructor set. Open a
            class to see its assignments, and click one to open its questions.
          </p>
          <p>
            You only see assignments the instructor has published. Anything still in
            draft is invisible to you.
          </p>
        </>,
      },
      {
        q: "Do I have to save my work?",
        a: <>
          <p>
            No — there is no Save button. Your code is saved automatically a few
            seconds after you stop typing, and periodically while you type.
            Submitting saves it too.
          </p>
          <p className="faq__warn">
            There is no "saved" indicator, so give it a moment before closing the
            tab on something you just finished typing.
          </p>
        </>,
      },
      {
        q: "Can I run my code before submitting it?",
        a: <p>
          Not currently. Submitting is the only way to run your code, and there is
          no scratch pad for trying your own inputs. Since there is no limit on
          submissions, submitting <em>is</em> how you test — but you will get more
          out of it by running your code locally first.
        </p>,
      },
      {
        q: "Can I choose which language to use?",
        a: <p>
          No. Each question is set to one language by your instructor, shown above
          the editor as <code>Language: python</code>. Autograder supports Python,
          C, Java, and Racket, but which one a given question uses is not your
          choice.
        </p>,
      },
      {
        q: "How many times can I submit?",
        a: <>
          <p>As many times as you like. There is no attempt limit and no cooldown.</p>
          <p className="faq__warn">
            But each submission <strong>replaces</strong> your previous result,
            including a worse one. Autograder does not keep your best attempt, so
            don't submit an experiment you haven't checked.
          </p>
        </>,
      },
      {
        q: "What does \"Reset Starter Code\" do?",
        a: <p className="faq__warn">
          It replaces everything in the editor with the starter code your
          instructor provided — immediately, with no confirmation prompt. Your work
          is not recoverable afterwards, so copy it somewhere first if you might
          want it back.
        </p>,
      },
      {
        q: "Can I see my earlier submissions?",
        a: <p>
          Not at the moment. You see the score and feedback from your most recent
          submission. Your instructor can see the full history of your attempts, so
          ask them if you need to know what an earlier one scored.
        </p>,
      },
      {
        q: "What happens if I submit after the deadline?",
        a: <>
          <p>
            Late submissions are accepted and graded normally. Nothing is blocked,
            and Autograder does not deduct any marks by itself — but your instructor
            sees the submission flagged as late, and how they handle that is up to
            them.
          </p>
          <p>
            Assignments are due at <strong>11:59:59 pm US Central time</strong> on
            the date shown in your class sidebar.
          </p>
        </>,
      },
    ],
  },
  {
    title: "Understanding your results",
    items: [
      {
        q: "How is my code graded?",
        a: <p>
          Each test case runs your program once, feeding that test case's input to
          it on standard input, then compares what your program prints to the
          expected output. Each test case is worth points, and your score for the
          question is the total of the ones that pass.
        </p>,
      },
      {
        q: "What counts as matching output?",
        a: <>
          <p>Before comparing, Autograder tidies both sides a little. It ignores:</p>
          <ul>
            <li>Windows vs. Unix line endings.</li>
            <li>Trailing spaces and tabs at the end of a line.</li>
            <li>Blank lines at the very start or very end of your output.</li>
          </ul>
          <p>Everything else has to match exactly. In particular these all matter:</p>
          <ul>
            <li>Spaces <em>inside</em> a line — <code>1 2 3</code> is not <code>1&nbsp;&nbsp;2&nbsp;&nbsp;3</code>.</li>
            <li>Upper and lower case.</li>
            <li>Blank lines in the middle of your output.</li>
          </ul>
        </>,
      },
      {
        q: "My output looks right but the test still failed.",
        a: <>
          <p>Three causes account for almost all of these:</p>
          <ul>
            <li>
              <strong>Invisible whitespace</strong> inside a line — a double space,
              or a tab where a space was expected.
            </li>
            <li>
              <strong>Your program exited with an error status.</strong> A test fails
              even with perfect output if the program didn't finish cleanly — an
              uncaught exception, <code>sys.exit(1)</code>, or{" "}
              <code>return 1</code> from <code>main</code> all count.
            </li>
            <li>
              <strong>Too much output.</strong> Anything past about a megabyte is cut
              off, which then reads as a wrong answer. Remove debug printing before
              you submit.
            </li>
          </ul>
        </>,
      },
      {
        q: "What does a hidden test case show me?",
        a: <>
          <p>
            Only the verdict and the points, like{" "}
            <code>Test "edge cases" (hidden): FAILED (0/10 points)</code>. The
            input, the expected output, and your output are all withheld.
          </p>
          <p className="faq__warn">
            One consequence worth knowing: if every test case on a question is
            hidden, error messages and compile errors are withheld too, so a failing
            submission gives you nothing to go on. If you are stuck with no
            explanation at all, ask your instructor to make one test case visible.
          </p>
        </>,
      },
      {
        q: "Why does it say Timeout?",
        a: <p>
          Your program ran longer than the time limit for that test case. Each test
          case has its own limit, set by your instructor, so a slow or looping
          program only loses the cases it actually hits — the rest still run and
          still count.
        </p>,
      },
      {
        q: "Are there gotchas for particular languages?",
        a: <>
          <ul>
            <li>
              <strong>Java</strong> — your public class must be named{" "}
              <code>Main</code>. Any other name is a compile error.
            </li>
            <li>
              <strong>Racket</strong> — if you leave out <code>#lang racket</code>{" "}
              it is added for you. Don't put a comment above it, though, or you will
              end up with two <code>#lang</code> lines.
            </li>
            <li>
              <strong>C</strong> — compiled with <code>gcc -O2</code> and linked
              against the maths library, so you don't need to do anything special to
              use <code>math.h</code>.
            </li>
            <li>
              <strong>Python</strong> — run with <code>python3</code>. Only the
              standard library is available.
            </li>
          </ul>
        </>,
      },
      {
        q: "My submission says \"error\". What did I do?",
        a: <p>
          Nothing — that status means the grader itself could not run your
          submission, most often because the question has no test cases yet. It is
          not a verdict on your code. Let your instructor know.
        </p>,
      },
    ],
  },
  {
    title: "For instructors and TAs",
    items: [
      {
        q: "How do I create a course?",
        a: <p>
          Use <strong>+ Create New Classroom</strong> on your dashboard — available
          to instructors and administrators. You set a name, a course code (up to 16
          characters), start and end dates, and a description. A blank assignment is
          created alongside it so you have somewhere to start.
        </p>,
      },
      {
        q: "How do I add students?",
        a: <>
          <p>
            Manage Classroom → <strong>Students</strong> →{" "}
            <strong>+ Add Student</strong>, then type an email address and save.
            Students who don't have an account yet are invited automatically and
            join the class the moment they register, so you can build a full roster
            before term starts.
          </p>
          <p className="faq__warn">
            Two limitations to plan around: it is one address at a time — there is
            no CSV import or bulk paste — and a pending enrolment only connects if
            the student registers with the <em>exact</em> address you entered.
          </p>
        </>,
      },
      {
        q: "How do I add a co-instructor?",
        a: <p>
          Not through the interface, currently. The classroom roster only offers the
          student and assistant roles. Granting someone the instructor role has to
          be done by an administrator through the API.
        </p>,
      },
      {
        q: "What can a TA (assistant) do?",
        a: <p className="faq__warn">
          Less than intended, at the moment. Assistants are granted most instructor
          permissions by the server, but the Manage Classroom screens are currently
          restricted to instructors and administrators — so in practice an assistant
          cannot manage a classroom today. Note also that assistants appear in the
          gradebook alongside students.
        </p>,
      },
      {
        q: "How do I publish an assignment?",
        a: <p>
          Each assignment has a visibility setting: <strong>Draft</strong> or{" "}
          <strong>Visible</strong>. Draft assignments are invisible to students and
          cannot be opened even with a direct link, so you can build one in the open
          without anyone seeing it. Switch it to Visible to release it.
        </p>,
      },
      {
        q: "How do points work?",
        a: <p>
          Points are set <strong>per test case</strong>, and a question is worth the
          total of its test cases. There is no separate question-level points field.
          A question with no test cases is worth nothing and will report an error
          when a student submits, so add at least one before publishing.
        </p>,
      },
      {
        q: "Do I have to type the expected output by hand?",
        a: <>
          <p>
            No. Write a reference solution in the <strong>Solution</strong> tab,
            then use <strong>Generate Expected Output</strong> to run it against a
            test case's input and fill in the expected output for you. It asks
            before overwriting anything you have already entered.
          </p>
          <p>
            <strong>Run Tests on Solution</strong> checks your solution against every
            test case at once — a good sanity check before publishing. Neither
            button touches student grades, though both do save the question.
          </p>
        </>,
      },
      {
        q: "Can I export grades to a spreadsheet?",
        a: <p className="faq__warn">
          Not currently — there is no CSV or spreadsheet export. Grades are viewable
          in Manage Classroom → <strong>Grades</strong>, which you can pivot by
          assignment or by student.
        </p>,
      },
      {
        q: "Can I change a grade by hand?",
        a: <p>
          Yes. On a student's row, tick <strong>Manual Grade</strong>, enter a score,
          and press <strong>Update Grade</strong>. The automatically computed score
          is kept underneath, so unticking the box restores it — an override is never
          destructive.
        </p>,
      },
      {
        q: "Can I re-run grading for a student?",
        a: <p>
          Yes, with <strong>Resubmit Code</strong> on their row. It re-grades their
          current code and updates the score, but deliberately does not add an entry
          to their submission history or flag them as late, so your re-runs never
          look like their attempts.
        </p>,
      },
      {
        q: "Can I duplicate an assignment or copy one between classes?",
        a: <p>
          Not yet. Test cases can be copied within a question, but there is no
          duplicate for assignments or questions, no copying between classrooms, and
          no assignment templates.
        </p>,
      },
      {
        q: "Can I write shell-script test cases?",
        a: <p>
          No. Autograder currently supports one kind of test case: supply input,
          compare the program's output to what you expect. Multi-line input is fine,
          and each test case has its own points, time limit, and hidden setting.
        </p>,
      },
      {
        q: "Does Autograder email students about anything else?",
        a: <p>
          No. It sends exactly two kinds of email: account invitations and password
          resets. There are no deadline reminders, no "your submission has been
          graded" notices, and no grade notifications — so tell your class where to
          look rather than expecting Autograder to nudge them.
        </p>,
      },
      {
        q: "What can't I delete?",
        a: <>
          <p>
            An assignment must always have at least one question, and a question at
            least one test case, so the delete option is unavailable when only one
            is left. The same applies to the last assignment in a classroom.
          </p>
          <p className="faq__warn">
            Deleting an assignment permanently destroys the code, grades, and
            submission history your students accumulated under it. There is no undo.
          </p>
        </>,
      },
    ],
  },
];

const ALL_KEYS = SECTIONS.flatMap((section, s) => section.items.map((_, i) => `${s}-${i}`));

function Faq() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

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

  const toggle = (key: string) => {
    setOpenKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Expanding everything is what keeps the browser's own find-in-page useful.
  const allOpen = openKeys.size === ALL_KEYS.length;
  const toggleAll = () => setOpenKeys(allOpen ? new Set() : new Set(ALL_KEYS));

  return (
    <>
      <NoiseBackground />
      <Navbar />
      <main className="faq">
        <header className="faq__head">
          <p className="faq__eyebrow">Help</p>
          <div id="logo-faq" className="wordmark">
            <Logo />
          </div>
          <p className="faq__tagline">
            Answers to the questions we get asked most. If yours isn't here, ask
            your instructor.
          </p>
        </header>

        <div className="faq__controls">
          <button type="button" className="faq__toggle-all" onClick={toggleAll}>
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>

        {SECTIONS.map((section, s) => (
          <section className="glass faq__panel" key={section.title}>
            <h2 className="faq__h2">{section.title}</h2>
            <div className="faq__items">
              {section.items.map((item, i) => {
                const key = `${s}-${i}`;
                return (
                  <FaqItem
                    key={key}
                    q={item.q}
                    open={openKeys.has(key)}
                    onToggle={() => toggle(key)}
                  >
                    {item.a}
                  </FaqItem>
                );
              })}
            </div>
          </section>
        ))}

        <p className="faq__note">
          Still stuck? Ask your instructor &mdash; they can see your submissions and
          test results in full detail, including the parts hidden from you.
          Instructors: contact your department administrator.
        </p>

        <footer className="faq__footer">
          <a href={loggedIn ? "/dashboard" : "/login"} className="faq__cta">
            <BlueButton>{loggedIn ? "Go to Dashboard" : "Login"}</BlueButton>
          </a>
          <div className="faq__links">
            <a href="/"><button className="ghost-btn">Home</button></a>
            <a href="/about"><button className="ghost-btn">About Us</button></a>
          </div>
        </footer>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Faq />
  </StrictMode>,
)
