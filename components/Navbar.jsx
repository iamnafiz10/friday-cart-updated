'use client';
import {
    Search,
    ShoppingCart,
    X,
    UserCircle2,
    Settings,
    Package,
    LogOut
} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import toast from "react-hot-toast";
import ManageAccountModal from "@/components/ManageAccountModal";

const Navbar = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const cartCount = useSelector((state) => state.cart.total);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [user, setUser] = useState(null);
    const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const modalRef = useRef(null);
    const desktopDropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);

    // ✅ Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target)) setDesktopDropdownOpen(false);
            if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) setMobileDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent scroll when modal open
    useEffect(() => {
        document.body.style.overflow = isAuthOpen ? "hidden" : "auto";
    }, [isAuthOpen]);

    // Reset forms when closing modal
    const closeAuthModal = () => {
        setIsAuthOpen(false);
        setIsLogin(true);
        setLoginEmail("");
        setLoginPassword("");
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
    };

    // ✅ SIGNUP
    const handleSignup = async (e) => {
        e.preventDefault();
        if (signupPassword.length < 6) return toast.error("Password must be at least 6 characters");
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name: signupName, email: signupEmail, password: signupPassword}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Signup failed");

            // ✅ Fetch full user data including image
            const userRes = await fetch("/api/user/get", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: data.user.id}),
            });
            const userData = await userRes.json();

            const fullUser = userData.user || data.user;
            localStorage.setItem("user", JSON.stringify(fullUser));
            setUser(fullUser);
            toast.success("Account created successfully!");
            closeAuthModal();
            router.push("/");
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ LOGIN
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: loginEmail, password: loginPassword}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");

            // ✅ Fetch full user data including image
            const userRes = await fetch("/api/user/get", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: data.user.id}),
            });
            const userData = await userRes.json();

            const fullUser = userData.user || data.user;
            localStorage.setItem("user", JSON.stringify(fullUser));
            setUser(fullUser);

            toast.success("Welcome back!");
            closeAuthModal();
            router.push("/");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {method: "POST"});
            localStorage.removeItem("user");
            setUser(null);
            setDesktopDropdownOpen(false);
            setMobileDropdownOpen(false);
            toast.success("Signed out successfully!");
            router.push("/"); // Redirect to home page
        } catch (err) {
            console.error(err);
            toast.error("Failed to logout");
        }
    };

    const [manageAccountOpen, setManageAccountOpen] = useState(false);

    return (
        <>
            <nav className="relative bg-white shadow-sm">
                <div className="mx-6">
                    <div className="flex items-center justify-between max-w-7xl mx-auto py-4">
                        {/* Logo */}
                        <Link href="/" className="text-4xl font-semibold text-slate-700">
                            <span className="text-green-600">Friday</span>Cart
                            <span className="text-green-600 text-5xl leading-0">.</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                            <Link href="/">Home</Link>
                            <Link href="/shop">Shop</Link>
                            <Link href="/about">About</Link>
                            <Link href="/contact">Contact</Link>

                            {/* Search */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.push(`/shop?search=${search}`);
                                }}
                                className="hidden xl:flex items-center text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
                            >
                                <Search size={18} className="text-slate-600"/>
                                <input
                                    type="text"
                                    placeholder="Search products"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent outline-none placeholder-slate-600"
                                />
                            </form>

                            {/* Cart */}
                            <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                                <ShoppingCart size={18}/>
                                Cart
                                <span
                                    className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            </Link>

                            {/* Auth Section */}
                            {user ? (
                                <div className="relative" ref={desktopDropdownRef}>
                                    <button
                                        onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                                        className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-slate-100 transition"
                                    >
                                        {user.image && user.image.trim() !== "" ? (
                                            <img
                                                src={user.image}
                                                alt={user.name || "User"}
                                                className="w-8 h-8 rounded-full object-cover border border-green-100"
                                            />
                                        ) : (
                                            <UserCircle2 className="text-green-500" size={30}/>
                                        )}
                                    </button>

                                    {desktopDropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-3 w-64 backdrop-blur-xl bg-white/80 border border-green-100 shadow-lg rounded-2xl overflow-hidden animate-fadeIn z-50">
                                            <div
                                                className="absolute -top-2 right-5 w-4 h-4 bg-white/80 border-l border-t border-green-100 rotate-45"></div>

                                            {/* Header */}
                                            <div
                                                className="grid grid-cols-[auto_1fr] items-center gap-3 px-5 pt-4 pb-3 border-b border-green-100">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt="avatar"
                                                        className="w-9 h-9 rounded-full object-cover border border-green-100"
                                                    />
                                                ) : (
                                                    <UserCircle2 className="text-green-500" size={34}/>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-700 text-sm">{user.name}</p>
                                                    <p className="text-xs text-slate-500 break-all whitespace-normal">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Options */}
                                            <div
                                                className="flex flex-col text-sm text-slate-700 divide-y divide-green-100">
                                                <button
                                                    onClick={() => setManageAccountOpen(true)}
                                                    className="flex items-center gap-3 px-5 py-2.5 text-left hover:bg-green-50 transition"
                                                >
                                                    <Settings size={16} className="text-green-500"/>
                                                    Manage Account
                                                </button>
                                                <button
                                                    onClick={() => router.push("/orders")}
                                                    className="flex items-center gap-3 px-5 py-2.5 text-left hover:bg-green-50 transition"
                                                >
                                                    <Package size={16} className="text-green-500"/>
                                                    My Orders
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
                            ) : (
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="px-8 py-2 bg-green-500 hover:bg-green-600 transition text-white rounded-full"
                                >
                                    Login
                                </button>
                            )}
                        </div>

                        {/* Mobile Auth Section */}
                        <div className="sm:hidden flex items-center gap-3">
                            <Link href="/cart" className="relative text-slate-600">
                                <ShoppingCart size={22}/>
                                <span
                                    className="absolute -top-1 -right-2 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            </Link>

                            {user ? (
                                <div className="relative" ref={mobileDropdownRef}>
                                    <button
                                        onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                                        className="flex items-center justify-center"
                                    >
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt="user"
                                                className="w-8 h-8 rounded-full object-cover border border-green-100"
                                            />
                                        ) : (
                                            <UserCircle2 className="text-green-500" size={30}/>
                                        )}
                                    </button>
                                    {mobileDropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-3 w-56 backdrop-blur-xl bg-white/80 border border-green-100 shadow-lg rounded-2xl overflow-hidden animate-fadeIn z-50">
                                            <div
                                                className="grid grid-cols-[auto_1fr] items-center gap-3 px-4 pt-3 pb-2 border-b border-green-100">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt="avatar"
                                                        className="w-8 h-8 rounded-full object-cover border border-green-100"
                                                    />
                                                ) : (
                                                    <UserCircle2 className="text-green-500" size={30}/>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-700 text-sm">{user.name}</p>
                                                    <p className="text-xs text-slate-500 break-all whitespace-normal">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className="flex flex-col text-sm text-slate-700 divide-y divide-green-100">
                                                <button
                                                    onClick={() => setManageAccountOpen(true)}
                                                    className="flex items-center gap-3 px-5 py-2.5 text-left hover:bg-green-50 transition"
                                                >
                                                    <Settings size={16} className="text-green-500"/>
                                                    Manage Account
                                                </button>
                                                <button
                                                    onClick={() => router.push("/orders")}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-left hover:bg-green-50 transition"
                                                >
                                                    <Package size={15} className="text-green-500"/>
                                                    My Orders
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-left text-red-500 hover:bg-red-50 transition font-medium"
                                                >
                                                    <LogOut size={15}/>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="px-5 py-1.5 bg-green-500 hover:bg-green-600 text-sm transition text-white rounded-full"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            {isAuthOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div ref={modalRef}
                         className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-8 relative animate-fadeIn">
                        <button onClick={closeAuthModal}
                                className="absolute top-4 right-4 text-slate-500 hover:text-slate-700">
                            <X size={22}/>
                        </button>

                        <h2 className="text-2xl font-semibold text-center text-slate-700 mb-6">
                            {isLogin ? "Welcome Back 👋" : "Create Your Account"}
                        </h2>

                        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        className="border border-green-300 outline-none w-full py-2 px-2 text-[14px] rounded"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={isLogin ? loginEmail : signupEmail}
                                    onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)}
                                    className="border border-green-300 outline-none w-full py-2 px-2 text-[14px] rounded"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={isLogin ? loginPassword : signupPassword}
                                    onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)}
                                    className="border border-green-300 outline-none w-full py-2 px-2 text-[14px] rounded"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded bg-green-500 hover:bg-green-600 transition text-white"
                            >
                                {isLogin ? "Login" : "Signup"}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-600 mt-4">
                            {isLogin ? (
                                <>
                                    Don’t have an account?{" "}
                                    <button type="button" onClick={() => setIsLogin(false)}
                                            className="text-green-500 hover:underline">
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button type="button" onClick={() => setIsLogin(true)}
                                            className="text-green-500 hover:underline">
                                        Log in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Manage Account Modal */}
            <ManageAccountModal
                isOpen={manageAccountOpen}
                onClose={() => setManageAccountOpen(false)}
                user={user}
                setUser={setUser}
            />

            <style jsx>{`
              .animate-fadeIn {
                animation: fadeIn 0.25s ease-in-out;
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}</style>
        </>
    );
};

export default Navbar;