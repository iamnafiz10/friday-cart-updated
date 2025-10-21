'use client';
import {useCurrentUser} from "@/lib/auth";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";

export default function ClientStoreGate({children}) {
    const {user, isLoaded} = useCurrentUser();
    const router = useRouter();
    const [storeValid, setStoreValid] = useState(null);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            router.replace("/");
            return;
        }

        const checkStore = async () => {
            try {
                const res = await axios.get("/api/store/me");
                if (res.data.store) {
                    setStoreValid(true);
                } else {
                    setStoreValid(false);
                    router.replace("/create-store");
                }
            } catch (err) {
                console.error("[ClientStoreGate]", err);
                setStoreValid(false);
                router.replace("/create-store");
            }
        };

        checkStore();
    }, [isLoaded, user, router]);

    if (!isLoaded || storeValid === null) return null;
    if (!storeValid) return null;

    return children;
}