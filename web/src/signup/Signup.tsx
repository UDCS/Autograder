import TextField from "../components/textfield/Textfield";
import "./Signup.css";
import { Link } from "react-router";

interface FormData {
  value: string;
  isValid: boolean;
  error: string;
}

const handleTextChange = (data: FormData) => {
  console.log("Value:", data.value);
  console.log("Is Valid:", data.isValid);
  console.log("Error:", data.error);
};

function Signup() {
  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Sign Up</h1>
        <div className="input-container">
          <TextField
            initialValue="First Name"
            label=""
            onChange={handleTextChange}
          />
          <TextField
            initialValue="Last Name"
            label=""
            onChange={handleTextChange}
          />
          <TextField
            initialValue="Create Password"
            label=""
            type="password"
            onChange={handleTextChange}
          />
          <TextField
            initialValue="Re-Type Password"
            label=""
            type="password"
            onChange={handleTextChange}
          />
        </div>
        <Link to="/i/faq" className="why-am-i-here">
          Why am I here?
        </Link>
        <button className="submit-button">Sign Up</button>
      </div>
    </div>
  );
}

export default Signup;
