import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar"
import './login.css';
import LoginInputs from "./LoginInputs";


createRoot(document.getElementById("root")!).render(
<StrictMode>
    <Navbar />
    <LoginInputs />
</StrictMode>)