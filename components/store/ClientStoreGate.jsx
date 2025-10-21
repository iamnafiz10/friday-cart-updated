'use client';
import {useCurrentUser} from "@/lib/auth";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function ClientStoreGate({children}) {
    const {user, isLoaded} = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded) {
            if (!user) {
                router.push("/");
            } else if (!user.store) {
                router.push("/create-store");
            }
        }
    }, [isLoaded, user, router]);

    if (!isLoaded || !user || !user.store) return null;
    return children;
}