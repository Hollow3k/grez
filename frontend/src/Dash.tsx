import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dash(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const copyKey = () => {
        navigator.clipboard.writeText(user.token);
        alert("API Key copied! Paste this into VS Code.");
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };
    
    return(
        <>
        <div className="text-white">
            <h1>GREZ</h1>
            <h1>Welcome, {user?.username}</h1>
            <button className="bg-red-500" onClick={copyKey}>Copy API Key for VS Code</button>
            <button className="bg-gray-500 ml-4" onClick={handleLogout}>Logout</button>
        </div>
            
        </>
    )
}

export default Dash;