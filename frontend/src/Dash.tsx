import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTodayStats } from './api/vscode_api';
import { syncMyLeetcodeStats, updateLeetcodeUsername, getUserProfile } from './api/leetcode_api';
import { syncMyGithubStats, updateGithubUsername } from './api/github_api';
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
    
    // GitHub state
    const [githubUsername, setGithubUsername] = useState('');
    const [storedGithubUsername, setStoredGithubUsername] = useState<string | null>(null);
    const [githubStats, setGithubStats] = useState<any>(null);
    const [loadingGithub, setLoadingGithub] = useState(false);
    const [syncingGithub, setSyncingGithub] = useState(false);

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
                
                // Set GitHub stats if available
                if (statsData.github) {
                    setGithubStats(statsData.github);
                }

                // Fetch user profile to get leetcodeUsername and githubUsername
                const profileData = await getUserProfile();
                if (profileData.user.leetcodeUsername) {
                    setStoredUsername(profileData.user.leetcodeUsername);
                }
                if (profileData.user.githubUsername) {
                    setStoredGithubUsername(profileData.user.githubUsername);
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
    
    // GitHub handlers
    const handleGithubSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (githubUsername.trim()) {
            try {
                setLoadingGithub(true);
                await updateGithubUsername(githubUsername.trim());
                setStoredGithubUsername(githubUsername.trim());
                setGithubUsername('');
                alert('GitHub username saved! Click "Sync Now" to fetch your stats.');
            } catch (error: any) {
                console.error('Failed to update GitHub username:', error);
                const errorMsg = error.response?.data?.message || 'Failed to save username. Please try again.';
                alert(errorMsg);
            } finally {
                setLoadingGithub(false);
            }
        }
    };

    const handleSyncGithubNow = async () => {
        try {
            setSyncingGithub(true);
            const result = await syncMyGithubStats();
            setGithubStats(result.stats);
            
            // Refresh today's stats to get updated data
            const statsData = await getTodayStats();
            if (statsData.github) {
                setGithubStats(statsData.github);
            }
            
            alert('GitHub stats synced successfully!');
        } catch (error: any) {
            console.error('Failed to sync GitHub stats:', error);
            const errorMsg = error.response?.data?.message || 'Failed to sync stats. Make sure your GitHub username is correct.';
            alert(errorMsg);
        } finally {
            setSyncingGithub(false);
        }
    };

    const handleResetGithubUsername = () => {
        if (confirm('Do you want to change your GitHub username?')) {
            setStoredGithubUsername(null);
            setGithubStats(null);
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

            {/* GitHub Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">GitHub Stats</h2>
                {!storedGithubUsername ? (
                    <form onSubmit={handleGithubSubmit} className="mt-4">
                        <input
                            type="text"
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            placeholder="Enter your GitHub username"
                            className="px-4 py-2 text-blue-300 rounded"
                        />
                        <button 
                            type="submit" 
                            className="bg-blue-500 ml-2 px-4 py-2 rounded"
                            disabled={loadingGithub}
                        >
                            {loadingGithub ? 'Saving...' : 'Save'}
                        </button>
                    </form>
                ) : (
                    <div className="mt-4">
                        <p>GitHub Username: <span className="font-bold">{storedGithubUsername}</span></p>
                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={handleSyncGithubNow} 
                                className="bg-green-500 px-4 py-2 rounded"
                                disabled={syncingGithub}
                            >
                                {syncingGithub ? 'Syncing...' : 'Sync Now'}
                            </button>
                            <button 
                                onClick={handleResetGithubUsername} 
                                className="bg-red-500 px-4 py-2 rounded"
                            >
                                Change Username
                            </button>
                        </div>
                        {githubStats && (
                            <div className="mt-4 bg-gray-800 p-4 rounded">
                                <h3 className="text-xl font-bold mb-2">Today's GitHub Activity</h3>
                                <p>Total Commits: <span className="font-bold text-green-400">{githubStats.commits || 0}</span></p>
                                <p>Top Repository: <span className="font-bold text-blue-400">{githubStats.topRepo || 'No activity'}</span></p>
                                {githubStats.lastSynced && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        Last synced: {new Date(githubStats.lastSynced).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <h1 className="text-white mt-6">Time spent coding today: {Math.floor(codedTime/60)} Hrs {codedTime%60} mins</h1>
            
        </div>
            
        </>
    )
}

export default Dash;