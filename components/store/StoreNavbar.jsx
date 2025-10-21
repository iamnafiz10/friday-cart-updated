'use client';
import Link from "next/link";
import {useCurrentUser} from "@/lib/auth";

const StoreNavbar = () => {
    const {user, isLoaded} = useCurrentUser();

    if (!isLoaded) return null; // Wait until user is loaded

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {method: "POST"});
            window.location.href = "/"; // Redirect to home after logout
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>cart
                <span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Store
                </p>
            </Link>

            <div className="flex items-center gap-3">
                {user ? (
                    <>
                        <p>Hi, {user.name}</p>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1 rounded-md bg-red-500 text-white text-sm hover:bg-red-600 transition-all"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link
                        href="/"
                        className="px-3 py-1 rounded-md bg-green-500 text-white text-sm hover:bg-green-600 transition-all"
                    >
                        Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default StoreNavbar;