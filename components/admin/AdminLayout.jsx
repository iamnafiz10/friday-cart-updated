'use client';
import Link from "next/link";
import {ArrowRightIcon} from "lucide-react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import {useCurrentUser} from "@/lib/auth";

export default function AdminLayout({children}) {
    const {user, isLoaded} = useCurrentUser();

    if (!isLoaded) return null;

    // If not admin or not logged in
    if (!user || !user.isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
                    You are not authorized to access this page
                </h1>
                <Link
                    href="/"
                    className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full"
                >
                    Go to home <ArrowRightIcon size={18}/>
                </Link>
            </div>
        );
    }

    // ✅ Admin content
    return (
        <div className="flex flex-col h-screen">
            <AdminNavbar/>
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar/>
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    );
}