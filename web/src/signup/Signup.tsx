import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar"
import TextField from "../components/textfield/Textfield";
import './signup.css';

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
    <div className="signup-page">
        <div className="signup-card">
            <h1 className="signup-title">Sign Up</h1>
            <div className="input-container">
                <TextField
                    initialValue="First Name"
                    label=""
                    onChange={handleTextChange}/>
                <TextField
                    initialValue="Last Name"
                    label=""
                    onChange={handleTextChange}/>    
                <TextField 
                    initialValue="Create Password"
                    label=""
                    password
                    onChange={handleTextChange}/>
                <TextField 
                    initialValue="Re-Type Password"
                    label=""
                    password
                    onChange={handleTextChange}/>
            </div>       
            <a href="/faq" className="why-am-i-here">Why am I here?</a>
            <button className="submit-button">Sign Up</button>
        </div>
    </div>
</StrictMode>)