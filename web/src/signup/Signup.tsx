import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar"
import './signup.css';
import SignupPanel from "./SignupPanel";




createRoot(document.getElementById("root")!).render(
<StrictMode>
    <Navbar />
    <SignupPanel />
</StrictMode>)