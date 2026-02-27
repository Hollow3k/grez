import React, {createContext, useState, useEffect, useContext} from "react";
import api from '../api/axios';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({children} : {children: React.ReactNode}) => {
    const [user,setUser] = useState<any>(null);
    const [loading,setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('grez_token');
        const username = localStorage.getItem('grez_username');
        if(token){
            setUser({token, username});
        }
        setLoading(false);
    }, []);

    
    const login = async (credentials: any) => {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('grez_token', data.token);
        localStorage.setItem('grez_username', credentials.username);
        setUser({ token: data.token, username: credentials.username });
        return data;
    };

    const signup = async (userData: any) => {
        const { data } = await api.post('/auth/signup', userData);
        localStorage.setItem('grez_token', data.token);
        localStorage.setItem('grez_username', userData.username);
        setUser({ token: data.token, username: userData.username });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('grez_token');
        localStorage.removeItem('grez_username');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, signup}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);