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
    <div className = "signin-page">
        <div className = "signin-card">
            <h1 className = "signin-title">Sign In</h1>
            <div className = "input-container">
                <TextField
                    initialValue=""
                    label=""
                    checkEmail={true}
                    onChange={handleTextChange}/>
                <TextField 
                    initialValue=""
                    label=""
                    checkEmail={false}
                    onChange={handleTextChange}/>
            </div>        
        </div>
    </div>
    {/* <LoginInputs /> */}
</StrictMode>)