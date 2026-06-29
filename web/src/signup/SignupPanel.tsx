import { useEffect, useState } from "react";
import TextField, { TextFieldInput } from "../components/textfield/Textfield";

function SignupPanel() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");

    const alterStateFromTextfield = (alterState: (newValue: string) => void) => {
        return (data: TextFieldInput) => alterState(data.value);
    }

    const urlParams = new URLSearchParams(window.location.search);

    const inviteId = urlParams.get('id');
    const token = urlParams.get('token');
    const verifyInvite = async () => {
        var response = await fetch(`/api/auth/invite/${inviteId}/valid?token=${token}`)
        if (response.ok) {
            var json = await response.json();
            if (json['message'] !== 'true') {
                setError("Invalid invite");
            }
            console.log("valid invite");
        } else {
            setError("Invalid invite");
        }
        setLoading(false);
    }
    const registerUser = async () => {
        if (firstName === "") {
            alert("First Name cannot be empty")
        } else if (lastName === "") {
            alert("Last Name cannot be empty")
        } else if (password1 !== password2) {
            alert("Passwords do not match")
        } else {
            var response = await fetch(`/api/auth/register/${inviteId}?token=${token}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    password: password1
                })
            });
            if (!response.ok) {
                var json = await response.json();
                alert(json.error);
            } else {
                redirectToDashboard();
            }
        }
    }
    const redirectToDashboard = () => {
        window.location.href = "/dashboard"
    }
    useEffect(() => { 
        if (loading) {
            verifyInvite();
        }
    })


    return (
        <>
            {error 
            ?
            <div className="errorParent">
                <div className="error">
                    {error}
                </div>
            </div>
            :
            <div className="signup-page">
                <div className="signup-card">
                    <h1 className="signup-title">Sign Up</h1>
                    <div className="input-container">
                        <TextField
                            initialValue="First Name"
                            label=""
                            onChange={alterStateFromTextfield(setFirstName)}/>
                        <TextField
                            initialValue="Last Name"
                            label=""
                            onChange={alterStateFromTextfield(setLastName)}/>    
                        <TextField 
                            initialValue="Create Password"
                            label=""
                            type="password"
                            onChange={alterStateFromTextfield(setPassword1)}/>
                        <TextField 
                            initialValue="Re-Type Password"
                            label=""
                            type="password"
                            onChange={alterStateFromTextfield(setPassword2)}/>
                    </div>       
                    <a href="/faq" className="why-am-i-here">Why am I here?</a>
                    <button className="submit-button" onClick={registerUser}>Sign Up</button>
                </div>
            </div>
            }
        </>
    )
}
export default SignupPanel;