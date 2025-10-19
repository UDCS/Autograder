import { useEffect, useState } from "react";
import AnimatedLogo from "./AnimatedLogo";
import { Link } from "react-router";
import "./Navbar.css";

// TODO: The text within the navbar is somehow not centered vertically. This is a problem to fix later
function Navbar() {
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const getIsLoggedIn = async () => {
      try {
        const response = await fetch("/api/auth/valid_login");
        if (response.ok) {
          const json = await response.json();
          setLoggedIn(json["message"] == "true");
        }
      } catch (err) {
        console.error("Fetch error: ", err);
      }
    };
    getIsLoggedIn();
  });

  return (
    <nav className="navbar drop-shadow">
      <div className="nav-left">
        <AnimatedLogo />
      </div>
      <div className="nav-right">
        <Link className="nav-item" to="/i/about">
          About Us
        </Link>
        <Link className="nav-item" to="/i/faq">
          Help/FAQ
        </Link>
        {!isLoggedIn ? (
          <Link className="nav-item" to="/i/login">
            Login
          </Link>
        ) : (
          <>
            <Link className="nav-item" to="/i/dashboard">
              Dashboard
            </Link>
            <Link className="nav-item" to="/i/account">
              Account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
