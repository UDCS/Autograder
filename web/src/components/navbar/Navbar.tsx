import { useEffect, useState } from 'react';
import './Navbar.css'
import '/global.css'
import AnimatedLogo from './AnimatedLogo';


// The text within the navbar is somehow not centered vertically. This is a problem to fix later
function Navbar(){

    const [isLoggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const getIsLoggedIn = async () => {
            try {
                var response = await fetch('/api/auth/valid_login');
                if (response.ok) {
                    var json = await response.json();
                    setLoggedIn(json['message'] == 'true');
                }
            } catch (err){
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
            <div className= "nav-right">
                <a className="nav-item" href="/about">About Us</a>
                <a className= "nav-item" href="/faq">Help/FAQ</a>
                {!isLoggedIn ? 
                    <a className= "nav-item" href="/login">Login</a>
                    :
                    <> 
                        <a className= "nav-item" href="/account">Account</a>
                    </>
                }
            </div>
        </nav>
    );
}

export default Navbar;