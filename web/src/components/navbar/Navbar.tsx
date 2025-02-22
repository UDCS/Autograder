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

function Navbar(){
return (
    <nav className="navbar drop-shadow">
        <div className="nav-left">
           <a id="logo" onMouseOver={() => animateLogo()} onMouseOut={() => removeLogoAnimation()} href="/">AG</a>
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