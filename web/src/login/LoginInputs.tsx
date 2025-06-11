import { useEffect, useState } from "react";
import TextField from "../components/textfield/Textfield";

interface FormData {
    value: string;
    isValid: boolean;
    error: string;
}

function LoginInputs() {
    useEffect(() => {
        console.log("Hello, world!");
    });    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const login = async () => {

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({"email": username, "password": password})
            })
            if (!response.ok) {
                alert("Invalid Username or Password")
            }
            else {
                window.location.href="/dashboard"
            }
        } catch (error) {
            console.error("Error: ", error)
        }

    }
    return <div className="signin-page">
        <div className="signin-card">
            <h1 className="signin-title">Sign In</h1>
            <div className="input-container">
                <TextField
                    initialValue=""
                    label=""
                    email
                    onChange={(data: FormData): void => {
                        setUsername(data.value)
                    }}/>
                <TextField 
                    initialValue=""
                    label=""
                    password
                    onChange={(data: FormData) => {
                        setPassword(data.value)
                    }}/>
            </div>       
            <a href="/reset-password" className="forgot-pw">Forgot Password?</a>
            <button className="submit-button" onClick={login}>Sign In</button>
        </div>
    </div>
}

export default LoginInputs;