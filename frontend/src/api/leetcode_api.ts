import api from './axios';

export interface LeetcodeSolvedStats {
    solvedProblem: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
}

// Manually sync authenticated user's LeetCode stats to database
export async function syncMyLeetcodeStats(): Promise<{ message: string; stats: any }> {
    const response = await api.post('/leetcode/sync');
    return response.data;
}

// Update user's LeetCode username
export async function updateLeetcodeUsername(leetcodeUsername: string): Promise<any> {
    const response = await api.put('/user/leetcode-username', { leetcodeUsername });
    return response.data;
}

// Get user profile (includes leetcodeUsername)
export async function getUserProfile(): Promise<any> {
    const response = await api.get('/user/profile');
    return response.data;
}
