import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar";
import './account.css'
import BlueButton from "../components/bluebutton/BlueButton";
import TextField from "../components/textfield/Textfield";
import ToggleSwitch from "../components/toggleswitch/ToggleSwitch";

createRoot(document.getElementById('root')!).render(<div>
    <Navbar />
    <div id="accountRoot">
        <h1 className="header">Account Settings</h1>
        <table id="fieldsTable">
            <tr>
                <td align="right" className="labelTd">
                    <div className="label">First Name:</div>
                </td>
                <td>
                    <TextField className="nameField input" id="firstName" label=""/>
                </td>
                <td align="right" className="labelTd">
                    <div className="label">Last Name:</div>
                </td>
                <td>
                    <TextField className="nameField input" id="lastName" label=""/>
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
                    <BlueButton>Reset Password</BlueButton>
                </td>
            </tr>
            <tr>
                <td align="right" className="labelTd">
                    <div className="label">Light Mode</div>
                </td>
                <td colSpan={2} align="left" style={{paddingRight: "1%"}}>
                    <div className="colorTheme">    
                        <ToggleSwitch />
                        <div className="label" style={{marginLeft: "1%"}}>Dark Mode</div>
                    </div>
                </td>
                <td id='linkSentParent'>
                    <div id="linkSent">
                        Reset Password Link Sent!
                    </div>
                </td>
            </tr>
        </table>
        <BlueButton id='submit'>
            Submit Changes
        </BlueButton>
    </div>
</div>)