import { useCallback, useEffect, useState } from "react";
import TextField from "../components/textfield/Textfield";
import "./Login.css";
import { Link } from "react-router";

interface FormData {
  value: string;
  isValid: boolean;
  error: string;
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password: password }),
      });
      if (!response.ok) {
        alert("Invalid Username or Password");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }, [username, password]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        login();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [login]);

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1 className="signin-title">Sign In</h1>
        <div className="input-container">
          <TextField
            initialValue=""
            label=""
            email
            onChange={(data: FormData): void => {
              setUsername(data.value);
            }}
          />
          <TextField
            initialValue=""
            label=""
            password
            onChange={(data: FormData) => {
              setPassword(data.value);
            }}
          />
        </div>
        <Link to="/i/reset" className="forgot-pw">
          Forgot Password?
        </Link>
        <button className="submit-button" onClick={login}>
          Sign In
        </button>
      </div>
    </div>
  );
}

export default Login;
