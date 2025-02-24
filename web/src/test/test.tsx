import { StrictMode } from "react";
import { createRoot } from 'react-dom/client'
import styled from "styled-components"
import Select from 'react-select'
import Navbar from "../components/navbar/Navbar"
import './test.css'

const Button = styled.button`
  background-color: black;
  color: white;
  font-size: 20px;
  padding: 10px 60px;
  border-radius: 5px;
  margin: 10px 0px;
  cursor: pointer;

  &:disabled {
    color: grey;
    opacity: 0.7;
    cursor: default;
  }
`;

const roleOptions = [
    {value: "student", label: "Student"},
    {value: "assistant", label: "Assistant"},
    {value: "instructor", label: "Instructor"},
];

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Navbar />
        <div className="addStudentFields">
            <input placeholder="Enter an email"/>
            <Select options={roleOptions} placeholder="Select a role" id="dropdown"/>
        </div>
        <Button id="sendButton">Send Email</Button>
    </StrictMode>
  )