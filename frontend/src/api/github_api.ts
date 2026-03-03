import axiosInstance from './axios';

// Sync GitHub stats
export const syncMyGithubStats = async () => {
    const response = await axiosInstance.post('/github/sync');
    return response.data;
};

// Update GitHub username
export const updateGithubUsername = async (githubUsername: string) => {
    const response = await axiosInstance.put('/user/github-username', {
        githubUsername
    });
    return response.data;
};
