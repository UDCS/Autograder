import { useEffect, useState } from 'react';
import './Navbar.css'
import '/global.css'

function animateLogo() {
    var chars = ["U", "T", "O", "R", "A", "D", "E", "R"]
    let logo = document.getElementById("logo")!;
    for (var i = 0; i < 8; i++) {
        if(i <= 2){
            (function(i){
                window.setTimeout(function(){
                    logo.innerHTML = logo.innerHTML.substring(0, logo.innerHTML.length - 1) + chars[i] + logo.innerHTML.substring(logo.innerHTML.length - 1);
                }, 200 + i*35);
            
            }(i));
        } else if(i > 2){
            (function(i){
                window.setTimeout(function(){
                    logo.innerHTML = logo.innerHTML + chars[i];
                }, 200 + i*35);
            
              }(i));
        }
    }
}

function removeLogoAnimation() {
    let logo = document.getElementById("logo")!;
    for (var i = 0; i < 8; i++) {
        if(i < 6){
            (function(i){
                window.setTimeout(function(){
                    logo.innerHTML = logo.innerHTML.substring(0, logo.innerHTML.length - 1);
                }, 200 + i*35);
            
            }(i));
        } else if(i >= 6){
            (function(i){
                window.setTimeout(function(){
                    logo.innerHTML = logo.innerHTML.substring(0, logo.innerHTML.length - 2) + "G";
                }, 200 + i*35);
            
              }(i));
        }
    }
}

// The text within the navbar is somehow not centered. This is a problem to fix later
function Navbar(){

    const [isLoggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const getIsLoggedIn = async () => {
            try {
                var response = await fetch('/api/auth/jwt_token_is_valid');
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
            <a id="logo" onMouseOver={() => animateLogo()} onMouseOut={() => removeLogoAnimation()} href="/">AG</a>
            </div>
            <div className= "nav-right">
                <a id="nav-item" href="/about">About Us</a>
                <a id= "nav-item" href="/faq">Help/FAQ</a>
                {!isLoggedIn ? 
                    <a id= "nav-item" href="/login">Login</a>
                    : 
                    <a id= "nav-item" href="/account">Account</a>
                }
            </div>
        </nav>
    );
}

export default Navbar;