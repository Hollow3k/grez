import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTodayStats } from './api/vscode_api';
import { syncMyLeetcodeStats, updateLeetcodeUsername, getUserProfile } from './api/leetcode_api';
import { useEffect, useState } from 'react';

function Dash(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [codedTime, setCodedTime] = useState(0);
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const [storedUsername, setStoredUsername] = useState<string | null>(null);
    const [leetcodeStats, setLeetcodeStats] = useState<any>(null);
    const [loadingLeetcode, setLoadingLeetcode] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Fetch profile and stats on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch today's stats (includes both coding time and leetcode stats)
                const statsData = await getTodayStats();
                setCodedTime(statsData.coding?.totalMinutes || 0);
                
                // Set leetcode stats if available
                if (statsData.leetcode) {
                    setLeetcodeStats(statsData.leetcode);
                }

                // Fetch user profile to get leetcodeUsername
                const profileData = await getUserProfile();
                if (profileData.user.leetcodeUsername) {
                    setStoredUsername(profileData.user.leetcodeUsername);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, [user.token]);

    const copyKey = () => {
        navigator.clipboard.writeText(user.token);
        alert("API Key copied! Paste this into VS Code.");
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleLeetcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (leetcodeUsername.trim()) {
            try {
                setLoadingLeetcode(true);
                await updateLeetcodeUsername(leetcodeUsername.trim());
                setStoredUsername(leetcodeUsername.trim());
                setLeetcodeUsername('');
                alert('LeetCode username saved! Click "Sync Now" to fetch your stats.');
            } catch (error: any) {
                console.error('Failed to update leetcode username:', error);
                const errorMsg = error.response?.data?.message || 'Failed to save username. Please try again.';
                alert(errorMsg);
            } finally {
                setLoadingLeetcode(false);
            }
        }
    };

    const handleSyncNow = async () => {
        try {
            setSyncing(true);
            const result = await syncMyLeetcodeStats();
            setLeetcodeStats(result.stats);
            
            // Refresh today's stats to get updated data
            const statsData = await getTodayStats();
            if (statsData.leetcode) {
                setLeetcodeStats(statsData.leetcode);
            }
            
            alert('Stats synced successfully!');
        } catch (error: any) {
            console.error('Failed to sync leetcode stats:', error);
            const errorMsg = error.response?.data?.message || 'Failed to sync stats. Make sure your LeetCode username is correct.';
            alert(errorMsg);
        } finally {
            setSyncing(false);
        }
    };

    const handleResetUsername = () => {
        if (confirm('Do you want to change your LeetCode username?')) {
            setStoredUsername(null);
            setLeetcodeStats(null);
        }
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
                        placeholder="Enter your LeetCode username"
                        className="px-4 py-2 text-blue-300 rounded"
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-500 ml-2 px-4 py-2 rounded"
                        disabled={loadingLeetcode}
                    >
                        {loadingLeetcode ? 'Saving...' : 'Save'}
                    </button>
                </form>
            ) : (
                <div className="mt-4">
                    <p>LeetCode Username: <span className="font-bold">{storedUsername}</span></p>
                    <div className="flex gap-2 mt-2">
                        <button 
                            onClick={handleSyncNow} 
                            className="bg-green-500 px-4 py-2 rounded"
                            disabled={syncing}
                        >
                            {syncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                        <button 
                            onClick={handleResetUsername} 
                            className="bg-red-500 px-4 py-2 rounded"
                        >
                            Change Username
                        </button>
                    </div>
                    {leetcodeStats && (
                        <div className="mt-4 bg-gray-800 p-4 rounded">
                            <h3 className="text-xl font-bold mb-2">LeetCode Stats</h3>
                            <p>Total Solved: <span className="font-bold">{leetcodeStats.totalSolved || 0}</span></p>
                            <p>Easy: <span className="text-green-400">{leetcodeStats.easySolved || 0}</span></p>
                            <p>Medium: <span className="text-yellow-400">{leetcodeStats.mediumSolved || 0}</span></p>
                            <p>Hard: <span className="text-red-400">{leetcodeStats.hardSolved || 0}</span></p>
                            {leetcodeStats.lastSynced && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Last synced: {new Date(leetcodeStats.lastSynced).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <h1 className="text-white mt-6">Time spent coding today: {Math.floor(codedTime/60)} Hrs {codedTime%60} mins</h1>
            
        </div>
            
        </>
    )
}

export default Dash;