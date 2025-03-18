import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar";
import LoginInputs from "./LoginInputs";
import TextField from "../components/textfield/Textfield";
import "./login.css";

// const [name, setName] = useState('')
// const [error, setError] = useState(false)

// const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setName(e.target.value)
// }

// const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     if (!name.trim()) {
//     setError(true)
//     } else {
//     setError(false)
//     }
// }

createRoot(document.getElementById("root")!).render(
<StrictMode>
    <Navbar />
    {/* <LoginInputs /> */}
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-title">Sign In</div>
        <div className="input-container email">
          <div className="input-text">Email</div>
        </div>
        <div className="input-container password">
          <div className="input-text">Password</div>
        </div>
        <div className="forgot-password">Forgot Password?</div>
        <div className="signin-button">
          <div className="button-text">Sign in</div>
        </div>
      </div>
    </div>
    {/* <TextField 
        initialValue="Enter an email"
        label="Email"
        checkEmail={true}/> */}
</StrictMode>)