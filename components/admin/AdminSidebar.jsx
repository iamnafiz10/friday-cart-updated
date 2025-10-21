'use client'

import {usePathname} from "next/navigation"
import {
    HomeIcon,
    PlusSquareIcon,
    ShieldCheckIcon,
    StoreIcon,
    TicketPercentIcon
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {useCurrentUser} from "@/lib/auth"
import {useEffect, useState} from "react"

const AdminSidebar = () => {
    const {user: currentUser, isLoaded} = useCurrentUser()
    const [user, setUser] = useState(currentUser)
    const pathname = usePathname()

    // ✅ Sync from useCurrentUser()
    useEffect(() => {
        setUser(currentUser)
    }, [currentUser])

    // ✅ Also listen for localStorage updates (when profile updated in modal)
    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = JSON.parse(localStorage.getItem("user"))
            if (updatedUser) setUser(updatedUser)
        }

        // Listen for both local and cross-tab updates
        window.addEventListener("storage", handleStorageChange)
        window.addEventListener("user-updated", handleStorageChange) // custom event

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("user-updated", handleStorageChange)
        }
    }, [])

    if (!user) return null

    const sidebarLinks = [
        {name: 'Dashboard', href: '/admin', icon: HomeIcon},
        {name: 'Stores', href: '/admin/stores', icon: StoreIcon},
        {name: 'Categories', href: '/admin/categories', icon: PlusSquareIcon},
        {name: 'Approve Store', href: '/admin/approve', icon: ShieldCheckIcon},
        {name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon},
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                {user.image && user.image.trim() !== "" ? (
                    <Image
                        className="w-14 h-14 rounded-full"
                        src={user.image}
                        alt={user.name || "User"}
                        width={80}
                        height={80}
                    />
                ) : (
                    <div
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-green-500 text-white font-bold text-xl">
                        {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                )}
                <p className="text-slate-700">{user.name || "User"}</p>
            </div>

            <div className="max-sm:mt-6">
                {sidebarLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href ? 'bg-slate-100 sm:text-slate-600' : ''}`}
                    >
                        <link.icon size={18} className="sm:ml-5"/>
                        <p className="max-sm:hidden">{link.name}</p>
                        {pathname === link.href && (
                            <span
                                className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default AdminSidebar