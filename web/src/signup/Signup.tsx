import TextField from "../components/textfield/Textfield";
import PasswordField from "../components/textfield/PasswordField";
import "./Signup.css";
import { Link } from "react-router";

function Signup() {
  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Sign Up</h1>
        <div className="input-container">
          <TextField initialValue="First Name" />
          <TextField initialValue="Last Name" />
          <PasswordField initialValue="Create Password" />
          <PasswordField initialValue="Re-Type Password" />
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
