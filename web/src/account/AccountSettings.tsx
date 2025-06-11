import { useEffect, useState } from "react";
import BlueButton from "../components/bluebutton/BlueButton";
import TextField from "../components/textfield/Textfield";
import ToggleSwitch from "../components/toggleswitch/ToggleSwitch";

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function AccountSettings() {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordButtonDisabled, setPasswordButtonDisabled] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        const redirectToLogin = () => {
            setTimeout(() => {
                window.location.href = "/login"
            }, 3000);
        }
        const getIsLoggedIn = async () => {
            try {
                await delay(100);
                var response = await fetch('/api/auth/valid_login');
                if (response.ok) {
                    var json = await response.json();
                    var loggedIn = json['message'] == 'true';
                    if (!loggedIn) {
                        setIsLoggedIn(false);
                        redirectToLogin();
                    }
                }
            } catch (err){
                setIsLoggedIn(false);
                redirectToLogin();
            }
        };
        getIsLoggedIn().then(async () => {
            try {
                await delay(100);
                var response = await fetch('/api/auth/user_name');
                if (response.ok) {
                    var json = await response.json();
                    var firstName = json['FirstName'];
                    var lastName = json['LastName'];
                    setFirstName(firstName);
                    setLastName(lastName);
                } else {
                    console.log(response);
                }
            } catch (err){
                console.log(err);
            }
            setLoading(false);
        });
    });

    const onResetButtonPressed = async () => {
        try {
            var response = await fetch('/api/auth/password', {method: "POST"});
            if (response.ok) {
                setPasswordButtonDisabled(true);
                setPasswordMessage("Password reset link sent!")
            } else {
                console.log(response.status)
                setPasswordMessage("Password reset link failed to send.")
            }
        } catch (err) {
            setPasswordMessage("Password reset link failed to send.");
        }
    }

    return <> 
    {loading ? <></> : 
        <div id="accountRoot">
        {isLoggedIn ? 
            <>
                <h1 className="header">Account Settings</h1>
                <table id="fieldsTable">
                    <tr>
                        <td align="right" className="labelTd">
                            <div className="label">First Name:</div>
                        </td>
                        <td>
                            <TextField className="nameField input" id="firstName" label="" value={firstName} />
                        </td>
                        <td align="right" className="labelTd">
                            <div className="label">Last Name:</div>
                        </td>
                        <td>
                            <TextField className="nameField input" id="lastName" label="" value={lastName} />
                        </td>
                    </tr>
                    <tr>
                        <td align="right" className="labelTd">
                            <div className="label">Password:</div>
                        </td>
                        <td colSpan={2}>
                            <div className="lastUpdated">last updated September 1st 2024</div>
                        </td>
                        <td>
                            <BlueButton disabled={passwordButtonDisabled} onClick={onResetButtonPressed}>Reset Password</BlueButton>
                        </td>
                    </tr>
                    <tr>
                        <td align="right" className="labelTd">
                            <div className="label">Light Mode</div>
                        </td>
                        <td colSpan={2} align="left" style={{ paddingRight: "1%" }}>
                            <div className="colorTheme">
                                <ToggleSwitch />
                                <div className="label" style={{ marginLeft: "1%" }}>Dark Mode</div>
                            </div>
                        </td>
                        <td id='linkSentParent'>
                            <div id="linkSent">
                                {passwordMessage}
                            </div>
                        </td>
                    </tr>
                </table>
                <BlueButton id='submit'>
                    Submit Changes
                </BlueButton>
            </>
        : 
        <>
            <h1 className="header" style={{marginBottom: "4%"}}>You have to be logged in to view account settings</h1>
            <div className="label">Redirecting to login...</div>
        </>}
    </div>
    }
    </>
    
}

export default AccountSettings;