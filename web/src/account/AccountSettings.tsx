import { useEffect, useState } from "react";
import BlueButton from "../components/buttons/BlueButton";
import TextField from "../components/textfield/Textfield";
import ToggleSwitch from "../components/toggleswitch/ToggleSwitch";


function AccountSettings() {
    enum ButtonState {
        Idle,
        Error,
        Success,
        Waiting
    }
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordButtonDisabled, setPasswordButtonDisabled] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [submitState, setSubmitState] = useState(ButtonState.Idle);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        const redirectToLogin = () => {
            setTimeout(() => {
                window.location.href = "/login"
            }, 3000);
        }
        const getIsLoggedIn = async () => {
            if(!loaded) {
                try {
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
            }
        };
        const getUserName =async () => {
            if (!loaded) {
                try {
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
            }
        };
        getIsLoggedIn().then(getUserName).then(() => {
            setLoaded(true);
        });
    });

    const onResetButtonPressed = async () => {
        setSubmitState(ButtonState.Waiting);
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

    const ChangeUserInfo = async () => {
        if (firstName == '' || lastName == '') {
            setSubmitState(ButtonState.Error);
        } else {
            try {
                var response = await fetch('/api/auth/user_info', {
                    method:"PUT",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "first_name": firstName,
                        "last_name": lastName
                    })
                });
                if (response.ok) {
                    setSubmitState(ButtonState.Success);
                }
            } catch (err) {
                setSubmitState(ButtonState.Error);
            }
        }
    }

    return <> 

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

                            <TextField onChange={(data: {value: string, isValid: boolean, error: string}) => {
                                setFirstName(data.value);
                                setSubmitState(ButtonState.Idle);
                            }} className="nameField input" id="firstName" label="" value={firstName} />
                        </td>
                        <td align="right" className="labelTd">
                            <div className="label">Last Name:</div>
                        </td>
                        <td>
                            <TextField onChange={(data: {value: string, isValid: boolean, error: string}) => {
                                setLastName(data.value);
                                setSubmitState(ButtonState.Idle);
                            }} className="nameField input" id="lastName" label="" value={lastName} />
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
                <BlueButton id='submit' style={(submitState == ButtonState.Error) ? {color: 'red'} : {}} onClick={ChangeUserInfo}>
                    {submitState == ButtonState.Error 
                        ? ((firstName == '' || lastName == '') ? "Name Cannot be Blank" : "An Error Occurred")
                    : submitState == ButtonState.Success ? "Profile Successfully Updated" : "Submit Changes"}
                </BlueButton>
            </>
        : 
        <>
            <h1 className="header" style={{marginBottom: "4%"}}>You have to be logged in to view account settings</h1>
            <div className="label">Redirecting to login...</div>
        </>}
    </div>
    
    </>
    
}

export default AccountSettings;