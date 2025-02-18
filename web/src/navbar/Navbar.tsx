import React from 'react';
import './Navbar.css'

//When you hover over the logo it animates out
function animateLogo() {
    var chars = ["A", "I", "T", "R", "E"]
    let logo = document.getElementById("logo")!;
    for (var i = 0; i < 5; i++) {
        //Create a closure to protect the value of i
        (function(i){
            window.setTimeout(function(){
                logo.innerHTML = logo.innerHTML + chars[i];
            }, 200 - i*35);
        
          }(i));
    }
}

//Undoes the animation when the user stops hovering over the logo
function removeLogoAnimation() {
    let logo = document.getElementById("logo")!;
    for (var i = 0; i < 5; i++) {
    //Create a closure to protect the value of i
        (function(i){
            window.setTimeout(function(){
                logo.innerHTML = logo.innerHTML.substring(0, logo.innerHTML.length - 1);
                console.log(logo.innerHTML);
            }, 200 - i*35);
        }(i));
    }
    // logo.innerHTML = "IN";
}

function Navbar(){
return (
    <nav className="navbar">
        <div className="nav-left">
           <a id="logo" href="/">AUTOGRADER</a>
        </div>
        <div className= "nav-right">
            <a id="nav-item" href="/about">About Us</a>
            <a id= "nav-item" href="/faq">Help/FAQ</a>
            <a id= "nav-item" href="/login">Login</a>
            
        </div>
    </nav>
    );
}

export default Navbar;