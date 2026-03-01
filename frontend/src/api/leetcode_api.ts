import api from './axios';

export interface LeetcodeSolvedStats {
    solvedProblem: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
}

export async function getLeetcodeSolved(username: string): Promise<LeetcodeSolvedStats> {
    const response = await api.get(`/leetcode/${username}`);
    return response.data;
}
