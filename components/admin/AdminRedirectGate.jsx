"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";

export default function AdminRedirectGate({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function verifyAdmin() {
            try {
                const {data} = await axios.get("/api/auth/me");
                const user = data?.user;

                if (user?.isAdmin) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                    router.replace("/"); // redirect if not admin
                }
            } catch (err) {
                console.error("Admin check failed:", err);
                setIsAuthorized(false);
                router.replace("/");
            }
        }

        verifyAdmin();
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center text-gray-500">
                Checking admin access...
            </div>
        );
    }

    if (!isAuthorized) return null;

    return children;
}