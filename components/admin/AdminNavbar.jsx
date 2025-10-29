'use client'

import Image from "next/image"
import Link from "next/link"
import {useState, useRef, useEffect} from "react"
import {useRouter} from "next/navigation"
import {UserCircle2, Settings, LogOut} from "lucide-react"
import {useCurrentUser} from "@/lib/auth"
import toast from "react-hot-toast"
import ManageAccountModal from "@/components/ManageAccountModal"
import {useAuth} from "@/app/context/AuthContext";

const AdminNavbar = () => {
    const router = useRouter()
    const {user: currentUser} = useCurrentUser()
    const [user, setUser] = useState(currentUser)
    const {logout} = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [manageAccountOpen, setManageAccountOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        setUser(currentUser)
    }, [currentUser])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])


    const handleLogout = async () => {
        try {
            await logout();
            setDropdownOpen(false);
            router.push("/");
        } catch (err) {
            console.error(err);
            toast.error("Failed to logout");
        }
    };

    return (
        <>
            <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
                {/* Logo */}
                <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                    <span className="text-green-600">go</span>cart
                    <span className="text-green-600 text-5xl leading-0">.</span>
                    <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                        Admin
                    </p>
                </Link>

                {/* User Section */}
                {user && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="rounded-full w-10 h-10 overflow-hidden border border-slate-300 hover:bg-slate-100 transition flex items-center justify-center"
                        >
                            {user.image && user.image.trim() !== "" ? (
                                <Image
                                    src={user.image}
                                    alt="Admin"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <UserCircle2 className="text-green-500 w-9 h-9"/>
                            )}
                        </button>

                        {dropdownOpen && (
                            <div
                                className="absolute right-0 mt-3 w-64 backdrop-blur-xl bg-white/80 border border-green-100 shadow-lg rounded-2xl overflow-hidden animate-fadeIn z-50">
                                <div
                                    className="absolute -top-2 right-5 w-4 h-4 bg-white/80 border-l border-t border-green-100 rotate-45"></div>

                                {/* Header: Avatar + Name + Email */}
                                <div
                                    className="grid grid-cols-[auto_1fr] items-center gap-3 px-5 pt-4 pb-3 border-b border-green-100">
                                    {user.image && user.image.trim() !== "" ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name}
                                            width={36}
                                            height={36}
                                            className="w-9 h-9 rounded-full object-cover border border-green-100"
                                        />
                                    ) : (
                                        <UserCircle2 className="text-green-500 w-9 h-9"/>
                                    )}
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm">{user.name}</p>
                                        <p className="text-xs text-slate-500 break-all whitespace-normal">{user.email}</p>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="flex flex-col text-sm text-slate-700 divide-y divide-green-100">
                                    <button
                                        onClick={() => {
                                            setManageAccountOpen(true)
                                            setDropdownOpen(false)
                                        }}
                                        className="flex items-center gap-3 px-5 py-2.5 text-left hover:bg-green-50 transition"
                                    >
                                        <Settings size={16} className="text-green-500"/>
                                        Manage Account
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-5 py-2.5 text-left text-red-500 hover:bg-red-50 transition font-medium"
                                    >
                                        <LogOut size={16}/>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Manage Account Modal */}
            <ManageAccountModal
                isOpen={manageAccountOpen}
                onClose={() => setManageAccountOpen(false)}
                user={user}
                setUser={setUser}
            />
        </>
    )
}

export default AdminNavbar