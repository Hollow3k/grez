import axios from 'axios';
import * as vscode from 'vscode';
import { HeartbeatPayload } from './types';

// const define = {
//   'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || 'http://localhost:5000/api')
// };

const API_BASE_URL = 'http://localhost:5000/api';

export async function sendHeartbeat(payload : HeartbeatPayload) {
    try{
        const token  = "INSERT_TOKEN"
        
        const response = await axios.post(`${API_BASE_URL}/heartbeat`, payload, {
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${token}`
            },
            timeout: 5000
        });

        if (response.status === 201 || response.status === 200){
            console.log(`[GREZ] Heartbeat synced : ${payload.project}`);
        } 
    } catch (error:any) {
        if (error.response) {
            console.error(`[GREZ] Server Error: ${error.response.status}`);
        } else if (error.request) {
            console.error(`[GREZ] Network Error: Could not reach backend.`);
        } else {
            console.error(`[GREZ] Error: ${error.message}`);
        }
    }
}