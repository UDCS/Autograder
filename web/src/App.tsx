import { Routes, Route, Navigate } from "react-router";
import Home from "./home/Home";
import NavBar from "./components/navbar/NavBar";
import Login from "./login/Login";
import Signup from "./signup/Signup";
import About  from "./about/About";
import Assignment from "./assignment/Assignment";
import Account from "./account/AccountSettings";
import Classroom from "./classroom/Classroom";
import Dashboard from "./dashboard/Dashboard";
import Faq  from "./faq/FAQ";
import ResetPassword from "./resetpassword/ResetPassword";

function App() {
  return (
    <div className="app">
      <NavBar />
      <Routes>
        <Route path="/i" element={<Home />} />
        <Route path="/i/about" element={<About />} />
        <Route path="/i/account" element={<Account />} />
        <Route path="/i/assignment" element={<Assignment />} />
        <Route path="/i/classroom" element={<Classroom />} />
        <Route path="/i/dashboard" element={<Dashboard />} />
        <Route path="/i/faq" element={<Faq />} />
        <Route path="/i/login" element={<Login />} />
        <Route path="/i/reset" element={<ResetPassword />} />
        <Route path="/i/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/i" />} />
      </Routes>
    </div>
  );
}

export default App;
