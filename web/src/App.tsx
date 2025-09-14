import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./home/Home";
import NavBar from "./components/navbar/NavBar";
import Login from "./login/Login";
import Signup from "./signup/Signup";
import About  from "./about/About";
import Account from "./account/AccountSettings";
import Assignment from "./assignment/Assignment";
import Classroom from "./classroom/Classroom";
import Dashboard from "./dashboard/Dashboard";
import Faq  from "./faq/FAQ";
import ResetPassword from "./resetpassword/ResetPassword";

function App() {
  return (
    <div className="app">
      <NavBar />
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/assignment" element={<Assignment />} />
        <Route path="/classroom" element={<Classroom />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="" />} />
      </Routes>
    </div>
  );
}

export default App;
