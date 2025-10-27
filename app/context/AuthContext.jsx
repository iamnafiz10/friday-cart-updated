'use client';
import {createContext, useContext, useEffect, useState} from 'react';
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    // ✅ Load user on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const openLogin = () => {
        setIsLogin(true);
        setAuthModalOpen(true);
    };

    const openSignup = () => {
        setIsLogin(false);
        setAuthModalOpen(true);
    };

    const closeAuthModal = () => setAuthModalOpen(false);

    // ✅ Login Method
    const login = async (email, password) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const userRes = await fetch("/api/user/get", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: data.user.id}),
            });
            const userData = await userRes.json();

            const fullUser = userData.user;
            localStorage.setItem("user", JSON.stringify(fullUser));
            setUser(fullUser);
            toast.success("Welcome back!");
            closeAuthModal();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ Signup Method
    const signup = async (name, email, password) => {
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name, email, password}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const userRes = await fetch("/api/user/get", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: data.user.id}),
            });
            const userData = await userRes.json();

            const fullUser = userData.user;
            localStorage.setItem("user", JSON.stringify(fullUser));
            setUser(fullUser);
            toast.success("Account created!");
            closeAuthModal();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ Logout Method
    const logout = async () => {
        await fetch("/api/auth/logout", {method: "POST"});
        localStorage.removeItem("user");
        setUser(null);
        toast.success("Logged out");
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));
    };
    return (
        <AuthContext.Provider
            value={{
                user,
                authModalOpen,
                isLogin,
                login,
                signup,
                logout,
                openLogin,
                openSignup,
                closeAuthModal,
                setIsLogin,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);