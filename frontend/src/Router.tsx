import { BrowserRouter as Routerr, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing";
import Login from "./Login";
import Signup from "./Signup";
import Dash from "./Dash";
import type { JSX } from "react";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return children;
};
    
function Router(){

    

    return(
        <Routerr>
            <Routes>
                <Route path="/" element={<Landing/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/dashboard" element=
                   {
                    <ProtectedRoute>
                        <Dash/>
                    </ProtectedRoute>
                    }>
                </Route>
            </Routes>
        </Routerr>
    )
}

export default Router;