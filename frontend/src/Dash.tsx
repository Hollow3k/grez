import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import { get_coded_time } from './api/vscode_api';
import { getLeetcodeSolved } from './api/leetcode_api';
import type { LeetcodeSolvedStats } from './api/leetcode_api';
import { useEffect, useState } from 'react';

function Dash(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [codedTime, setCodedTime] = useState(0);
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const [storedUsername, setStoredUsername] = useState<string | null>(null);
    const [solvedQuestions, setSolvedQuestions] = useState<LeetcodeSolvedStats | null>(null);
    const [loadingLeetcode, setLoadingLeetcode] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const time = await get_coded_time(user.token);
                setCodedTime(time);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, [user.token]);

    useEffect(() => {
        const stored = localStorage.getItem('leetcodeUsername');
        if (stored) {
            setStoredUsername(stored);
        }
    }, []);

    useEffect(() => {
        const fetchLeetcodeStats = async () => {
            if (!storedUsername) return;
            
            setLoadingLeetcode(true);
            try {
                const data = await getLeetcodeSolved(storedUsername);
                setSolvedQuestions(data);
            } catch (error) {
                console.error('Failed to fetch leetcode stats:', error);
            } finally {
                setLoadingLeetcode(false);
            }
        };
        
        fetchLeetcodeStats();
    }, [storedUsername]);

    const copyKey = () => {
        navigator.clipboard.writeText(user.token);
        alert("API Key copied! Paste this into VS Code.");
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleLeetcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (leetcodeUsername.trim()) {
            localStorage.setItem('leetcodeUsername', leetcodeUsername.trim());
            setStoredUsername(leetcodeUsername.trim());
            setLeetcodeUsername('');
        }
    };

    const handleResetUsername = () => {
        localStorage.removeItem('leetcodeUsername');
        setStoredUsername(null);
        setSolvedQuestions(null);
    };
    
    return(
        <>
        <div className="text-white">
            <h1>GREZ</h1>
            <h1>Welcome, {user?.username}</h1>
            <button className="bg-red-500" onClick={copyKey}>Copy API Key for VS Code</button>
            <button className="bg-gray-500 ml-4" onClick={handleLogout}>Logout</button>
            
            {!storedUsername ? (
                <form onSubmit={handleLeetcodeSubmit} className="mt-4">
                    <input
                        type="text"
                        value={leetcodeUsername}
                        onChange={(e) => setLeetcodeUsername(e.target.value)}
                        placeholder="Enter leetcode username"
                        className="px-4 py-2 text-black rounded"
                    />
                    <button type="submit" className="bg-blue-500 ml-2 px-4 py-2 rounded">
                        Save
                    </button>
                </form>
            ) : (
                <div className="mt-4">
                    <p>Leetcode Username: {storedUsername}</p>
                    <button onClick={handleResetUsername} className="bg-red-500 px-4 py-2 rounded mt-2">
                        Reset Username
                    </button>
                    {loadingLeetcode ? (
                        <p className="mt-2">Loading leetcode stats...</p>
                    ) : solvedQuestions ? (
                        <div className="mt-2">
                            <p>Total Solved: {solvedQuestions.solvedProblem || 0}</p>
                            <p>Easy: {solvedQuestions.easySolved || 0}</p>
                            <p>Medium: {solvedQuestions.mediumSolved || 0}</p>
                            <p>Hard: {solvedQuestions.hardSolved || 0}</p>
                        </div>
                    ) : null}
                </div>
            )}

            <h1 className="text-white">Time spent coding today : {Math.floor(codedTime/60)} Hrs {codedTime%60} mins</h1>
            
        </div>
            
        </>
    )
}

export default Dash;