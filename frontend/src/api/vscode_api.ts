import api from "./axios";

export async function get_coded_time(token: string): Promise<number> {
    const { data } = await api.post('/get_stats', { token });
    return data.coding.totalMinutes;
}

export async function getTodayStats(): Promise<any> {
    const { data } = await api.post('/get_stats');
    return data;
}