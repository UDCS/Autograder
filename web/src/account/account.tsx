import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar";
import './account.css'
import AccountSettings from "./AccountSettings";


createRoot(document.getElementById('root')!).render(<div>
    <Navbar />
    <AccountSettings />
</div>)