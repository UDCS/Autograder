import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar"
import TextField from "../components/textfield/Textfield";
import LoginInputs from "./LoginInputs";
import './login.css';

interface FormData {
    value: string;
    isValid: boolean;
    error: string;
  }

const handleTextChange = (data: FormData) => {
    console.log('Value:', data.value);
    console.log('Is Valid:', data.isValid);
    console.log('Error:', data.error);
  }

createRoot(document.getElementById("root")!).render(
<StrictMode>
    <Navbar />
    <div className="signin-page">
        <div className="signin-card">
            <h1 className="signin-title">Sign In</h1>
            <div className="input-container">
                <TextField
                    initialValue=""
                    label=""
                    email
                    onChange={handleTextChange}/>
                <TextField 
                    initialValue=""
                    label=""
                    password
                    onChange={handleTextChange}/>
            </div>       
            <a href="/reset-password" className="forgot-pw">Forgot Password?</a>
            <button className="submit-button">Sign In</button>
        </div>
    </div>
</StrictMode>)