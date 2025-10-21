"use client";
import {useState, useEffect} from "react";

// -------------------
// CLIENT-SIDE HOOK
// -------------------
export function useCurrentUser() {
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me"); // your API returns JSON { user }
                const data = await res.json();
                setUser(data.user || null);
            } catch (err) {
                console.error("Failed to load user:", err);
                setUser(null);
            } finally {
                setIsLoaded(true);
            }
        }

        fetchUser();
    }, []);

    return {user, isLoaded};
}

// -------------------
// GET JWT TOKEN (for client-side API calls)
// -------------------
export async function getToken() {
    try {
        const res = await fetch("/api/auth/token"); // returns { token: string }
        if (!res.ok) throw new Error("Failed to get token");
        const data = await res.json();
        return data.token || null;
    } catch (err) {
        console.error("Failed to get token:", err);
        return null;
    }
}