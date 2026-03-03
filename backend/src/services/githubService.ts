import axios from 'axios';

export const fetchGithubStats = async (username: string) => {
    if (!username) return { commits: 0, topRepo: "No handle set" };

    try {
        const { data: events } = await axios.get(
            `https://api.github.com/users/${username}/events/public`,
            {
                headers: {
                    // This pulls the token from your .env
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        const today = new Date().toISOString().split('T')[0];
        const todayPushes = events.filter((event: any) => 
            event.type === 'PushEvent' && event.created_at.startsWith(today)
        );

        const repoActivity: Record<string, number> = {};
        let totalCommits = 0;

        todayPushes.forEach((event: any) => {
            const repoName = event.repo.name;
            const commitCount = event.payload.commits.length;
            totalCommits += commitCount;
            repoActivity[repoName] = (repoActivity[repoName] || 0) + commitCount;
        });

        const topRepo = Object.entries(repoActivity).reduce((a, b) => 
            (a[1] > b[1] ? a : b), 
            ["No activity", 0]
        )[0];

        return { commits: totalCommits, topRepo };
    } catch (error: any) {
        // If the token is invalid or user doesn't exist
        console.error("GitHub API Error:", error.response?.status || error.message);
        return { commits: 0, topRepo: "Data unavailable" };
    }
};