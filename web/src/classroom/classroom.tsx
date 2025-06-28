import { createRoot } from "react-dom/client";
import Navbar from "../components/navbar/Navbar";
import './classroom.css'
import TitleBanner from "../components/titlebanner/TitleBanner";


createRoot(document.getElementById('root')!).render(<div>
    <Navbar />
    <TitleBanner>Test classroom</TitleBanner>
</div>)