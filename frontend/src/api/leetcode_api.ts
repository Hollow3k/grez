export interface LeetcodeSolvedStats {
    solvedProblem: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
}

export async function getLeetcodeSolved(username: string): Promise<LeetcodeSolvedStats> {
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch leetcode stats');
    }
    
    const data = await response.json();
    return data;
}
