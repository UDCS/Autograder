import { useState } from "react";
import { Field } from "./Field.tsx"

function LoginInputs() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState("")
    const login = async () => {

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({"email": username, "password": password})
            })
            if (!response.ok) setResult("Login Failed")
            else {
                const data = response.json()
                console.log("success: ", data)
                setResult("Login Success")
            }
        } catch (error) {
            console.error("Error: ", error)
        }

    }
    return (
        <div className="w-[250px] h-[250px]  border border-black break-all">
            <Field type="email" placeholder="Username or email" update={setUser}></Field>
            {Field("password", "Password", setPassword)}
            <button onClick={login} className="bg-green-500 text-stone-50">Submit</button>
            <br />
            {result == "Login Success" ? 
                <p className="text-green-500">Login Success</p>
            : result == "Login Failed" ? 
                <p className="text-red-500">Login Failed</p>
            : <></>
            }
        </div>
    )
}

export default LoginInputs;