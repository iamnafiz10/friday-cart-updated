'use client';

import Link from "next/link";
import Image from "next/image";
import {useState, useRef, useEffect} from "react";
import {useRouter} from "next/navigation";
import {UserCircle2, LogOut} from "lucide-react";
import toast from "react-hot-toast";
import {useAuth} from "@/app/context/AuthContext";

const StoreNavbar = ({store}) => {
    const router = useRouter();
    const {user: currentUser, logout} = useAuth(); // ✅ use AuthContext
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ Use central AuthContext logout
    const handleLogout = async () => {
        try {
            await logout(); // ✅ handles cookie + state + router.refresh()

            setDropdownOpen(false);
            router.push("/"); // ✅ redirect AFTER logout refresh is done
        } catch (err) {
            console.error(err);
            toast.error("Failed to logout");
        }
    };

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 bg-white z-[999]">
            {/* Logo */}
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">Friday</span>cart
                <span className="text-green-600 text-5xl leading-0">.</span>

                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full text-white bg-green-500">
                    Store
                </p>
            </Link>

            {/* ✅ Only show user dropdown if store exists & user logged in */}
            {store && currentUser && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="rounded-full w-10 h-10 overflow-hidden border border-slate-300 hover:bg-slate-100 transition flex items-center justify-center"
                        aria-label="User Menu"
                    >
                        {store.logo ? (
                            <Image
                                src={store.logo}
                                alt={store.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <UserCircle2 className="text-green-500 w-9 h-9"/>
                        )}
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                        <div
                            className="absolute right-0 mt-3 w-64 backdrop-blur-xl bg-white/80 border border-green-100 shadow-lg rounded-2xl overflow-hidden animate-fadeIn z-50">
                            <div
                                className="absolute -top-2 right-5 w-4 h-4 bg-white/80 border-l border-t border-green-100 rotate-45"/>

                            {/* Header */}
                            <div
                                className="grid grid-cols-[auto_1fr] items-center gap-3 px-5 pt-4 pb-3 border-b border-green-100">
                                {store.logo ? (
                                    <Image
                                        src={store.logo}
                                        alt={store.name}
                                        width={36}
                                        height={36}
                                        className="w-9 h-9 rounded-full object-cover border border-green-100"
                                    />
                                ) : (
                                    <UserCircle2 className="text-green-500 w-9 h-9"/>
                                )}
                                <div>
                                    <p className="font-semibold text-slate-700 text-sm">
                                        {store.name}
                                    </p>
                                    <p className="text-xs text-slate-500 break-all">
                                        {currentUser.email}
                                    </p>
                                </div>
                            </div>

                            {/* Sign Out */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-[14px] gap-3 px-5 py-2.5 text-left text-red-500 hover:bg-red-50 transition font-medium w-full"
                            >
                                <LogOut size={16}/> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StoreNavbar;