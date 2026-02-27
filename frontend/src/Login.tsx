import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            await login({ username, password });
            navigate("/dashboard");
        } catch (error: any) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            alert("Your credentials failed.");
        }
    };

    return(
        <>
        <div className="flex flex-col items-center text-center justify-center">
            <h1 className="font-['Quicksand'] mt-30 bg-linear-to-br from-black/45 to-white bg-clip-text text-transparent text-[12rem] font-bold ">LOG IN</h1>
            <div className="relative mt-15">
                <p className="absolute -top-9 bg-white px-1 font-['Quicksand'] bg-linear-to-br from-black/45 to-white bg-clip-text text-transparent text-2xl">Username:</p>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="h-15 w-170 text-3xl pl-5 bg-linear-to-br from-zinc-800 to-white"></input>
            </div>
            <div className="relative mt-18">
                <p className="absolute -top-9 bg-white px-1 font-['Quicksand'] bg-linear-to-br from-black/45 to-white bg-clip-text text-transparent text-2xl">Password:</p>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-15 w-170 text-3xl pl-5 bg-linear-to-br from-zinc-800 to-white"></input>
                <p className="flex absolute -bottom-9 right-0 bg-white px-1 font-['Quicksand'] bg-linear-to-br from-black/45 to-white bg-clip-text text-transparent text-2xl">New User ?<Link className="bg-linear-to-br from-black/50 to-red-500 bg-clip-text text-transparent hover:text-white" to="/signup">&nbsp;Sign up</Link></p>
            </div>
            <button onClick={handleSubmit} className="font-['Quicksand'] text-2xl bg-linear-to-br from-black/10 to-white w-60 h-15 rounded-4xl opacity-75 mt-25 hover:opacity-100 hover:cursor-pointer ">Submit</button>
        </div>
        </>
    )
}

export default Login;