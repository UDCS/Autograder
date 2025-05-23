import { useEffect, useState } from "react";

function AnimatedLogo() {

    const [isAnimating, setIsAnimating] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [isAbbreviated, setIsAbbreviated] = useState(true)

    const animateLogo = () => {
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
                        if (i == 7) {
                            setIsAnimating(false)
                            setIsAbbreviated(false)
                            logo.innerHTML = "AUTOGRADER"
                        } else {
                            logo.innerHTML = logo.innerHTML + chars[i];

                        }
                    }, 200 + i*35);
                
                  }(i));
            }
        }
        
    }
    
    const removeLogoAnimation = () => {
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
                        if (i == 7) {
                            logo.innerHTML = "AG"
                            setIsAnimating(false)
                            setIsAbbreviated(true)
                        } else {
                            logo.innerHTML = logo.innerHTML.substring(0, logo.innerHTML.length - 2) + "G";

                        }
                    }, 200 + i*35);
                  }(i));
            }
        }
    }

    const whenHoverIn = () => {
        setIsHovering(true)
        if (!isAnimating) {
            setIsAnimating(true)
            animateLogo()
        }
    }

    const whenHoverOut = () => {
        setIsHovering(false)
        if (!isAnimating) {
            setIsAnimating(true)
            removeLogoAnimation()
        }
    }

    useEffect(() => {
        if (!isAnimating && !isAbbreviated != isHovering) {
            if (isHovering) whenHoverIn();
            else whenHoverOut();
        }
    })

    return <a id="logo" 
            onMouseOver={whenHoverIn} 
            onMouseOut={whenHoverOut} href="/">AG</a>
}

export default AnimatedLogo;