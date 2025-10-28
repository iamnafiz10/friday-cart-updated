'use client';
import {useState, useRef, useEffect} from "react";
import Link from "next/link";
import {useRouter, usePathname} from "next/navigation";
import {useSelector} from "react-redux";
import {
    Search,
    ShoppingCart,
    UserCircle2,
    Settings,
    Package,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import ManageAccountModal from "@/components/ManageAccountModal";
import {useAuth} from "@/app/context/AuthContext";

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const cartCount = useSelector((state) => state.cart.total || 0);
    const {user, openLogin, logout} = useAuth();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [manageAccountOpen, setManageAccountOpen] = useState(false);
    const [userStore, setUserStore] = useState(null);
    const [search, setSearch] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Fetch user store
    useEffect(() => {
        if (user) {
            fetch(`/api/store/get?userId=${user.id}`)
                .then((res) => res.json())
                .then((data) => setUserStore(data.store))
                .catch((err) => console.error(err));
        } else setUserStore(null);
    }, [user]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent scroll when manage account modal is open
    useEffect(() => {
        document.body.style.overflow = manageAccountOpen ? "hidden" : "auto";
    }, [manageAccountOpen]);

    const handleLogout = async () => {
        await logout();
        setDropdownOpen(false);
        router.push("/");
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (search.trim() !== "") router.push(`/shop?search=${search}`);
        setMobileMenuOpen(false);
    };

    const handleMobileLinkClick = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="relative bg-white shadow-sm z-50">
                <div className="mx-4 sm:mx-6">
                    <div className="flex items-center justify-between max-w-7xl mx-auto py-4 gap-4 sm:gap-6 flex-wrap">

                        {/* Logo */}
                        <Link href="/" className="text-2xl md:text-3xl font-semibold text-slate-700 flex-shrink-0">
                            <span className="text-green-600">Friday</span>Cart
                            <span className="text-green-600 text-5xl leading-0">.</span>
                        </Link>

                        {/* Desktop Navigation & Search */}
                        <div className="hidden sm:flex items-center gap-6 text-slate-700 font-medium flex-1">
                            <div className="flex gap-6">
                                <Link href="/"
                                      className={`hover:text-green-500 ${pathname === '/' ? 'text-green-500' : ''}`}>Home</Link>
                                <Link href="/shop"
                                      className={`hover:text-green-500 ${pathname === '/shop' ? 'text-green-500' : ''}`}>Shop</Link>
                                <Link href="/about"
                                      className={`hover:text-green-500 ${pathname === '/about' ? 'text-green-500' : ''}`}>About</Link>
                                <Link href="/contact"
                                      className={`hover:text-green-500 ${pathname === '/contact' ? 'text-green-500' : ''}`}>Contact</Link>
                            </div>
                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex items-center text-sm gap-2 bg-slate-100 px-4 py-2 rounded-full flex-1 max-w-xl min-w-[200px]"
                            >
                                <Search size={18} className="text-slate-600"/>
                                <input
                                    type="text"
                                    placeholder="Search products"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent outline-none placeholder-slate-600 text-sm"
                                />
                            </form>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center gap-3 sm:gap-6 ml-auto">

                            {/* Mobile menu toggle */}
                            <button
                                className="sm:hidden p-2 rounded-full hover:bg-slate-100 transition"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X size={22}/> : <Menu size={22}/>}
                            </button>

                            {/* Cart */}
                            <Link href="/cart" className="relative flex items-center">
                                <ShoppingCart size={22} className="text-slate-700"/>
                                <span
                                    className="absolute -top-1 -right-2 text-[10px] font-semibold text-white rounded-full w-4 h-4 flex items-center justify-center bg-black">
                                    {cartCount}
                                </span>
                            </Link>

                            {/* User / Login */}
                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 transition"
                                    >
                                        {user.image ? (
                                            <img src={user.image}
                                                 className="w-8 h-8 rounded-full object-cover border border-green-100"/>
                                        ) : (
                                            <UserCircle2 size={28} className="text-green-500"/>
                                        )}
                                    </button>

                                    {dropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-3 w-64 backdrop-blur-xl bg-white/80 border border-green-100 shadow-lg rounded-2xl overflow-hidden animate-fadeIn z-50">
                                            <div
                                                className="absolute -top-2 right-5 w-4 h-4 bg-white/80 border-l border-t border-green-100 rotate-45"></div>

                                            <div
                                                className="grid grid-cols-[auto_1fr] items-center gap-3 px-5 pt-4 pb-3 border-b border-green-100">
                                                {user.image ? (
                                                    <img src={user.image}
                                                         className="w-9 h-9 rounded-full object-cover border border-green-100"/>
                                                ) : (
                                                    <UserCircle2 size={34} className="text-green-500"/>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-700 text-sm">{user.name}</p>
                                                    <p className="text-xs text-slate-500 break-all whitespace-normal">{user.email}</p>
                                                </div>
                                            </div>

                                            <div
                                                className="flex flex-col text-sm text-slate-700 divide-y divide-green-100">
                                                <button onClick={() => setManageAccountOpen(true)}
                                                        className="flex items-center gap-3 px-5 py-2.5 text-left hover:bg-green-50 transition">
                                                    <Settings size={16} className="text-green-500"/> Manage Account
                                                </button>
                                                <Link href="/orders"
                                                      className="flex items-center gap-3 px-5 py-2.5 text-left hover:bg-green-50 transition">
                                                    <Package size={16} className="text-green-500"/> My Orders
                                                </Link>
                                                {userStore && (
                                                    <Link href="/store"
                                                          className="flex items-center gap-3 px-5 py-2.5 text-left hover:bg-green-50 transition">
                                                        <Package size={16} className="text-green-500"/> My Store
                                                    </Link>
                                                )}
                                                {user.isAdmin && (
                                                    <Link href="/admin"
                                                          className="flex items-center gap-3 px-5 py-2.5 text-left hover:bg-green-50 transition">
                                                        <Settings size={16} className="text-green-500"/> Admin Panel
                                                    </Link>
                                                )}
                                                <button onClick={handleLogout}
                                                        className="flex items-center gap-3 px-5 py-2.5 text-left text-red-500 hover:bg-red-50 transition font-medium">
                                                    <LogOut size={16}/> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button onClick={openLogin}
                                        className="px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition">Login</button>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div ref={mobileMenuRef}
                             className="sm:hidden absolute top-full left-0 w-full bg-white border-t border-green-500 shadow-lg animate-slideDown z-50 p-4 pb-2 flex flex-col gap-3">
                            <form onSubmit={handleSearchSubmit}
                                  className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                                <Search size={18} className="text-slate-600"/>
                                <input
                                    type="text"
                                    placeholder="Search products"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent outline-none placeholder-slate-600 text-sm"
                                />
                            </form>

                            <Link href="/" onClick={handleMobileLinkClick}
                                  className={`ml-2 my-1 pb-2 border-b border-green-100 text-[14px] hover:text-green-500 ${pathname === '/' ? 'text-green-500' : ''}`}>Home</Link>
                            <Link href="/shop" onClick={handleMobileLinkClick}
                                  className={`ml-2 my-1 pb-2 border-b border-green-100 text-[14px] hover:text-green-500 ${pathname === '/shop' ? 'text-green-500' : ''}`}>Shop</Link>
                            <Link href="/about" onClick={handleMobileLinkClick}
                                  className={`ml-2 my-1 pb-2 border-b border-green-100 text-[14px] hover:text-green-500 ${pathname === '/about' ? 'text-green-500' : ''}`}>About</Link>
                            <Link href="/contact" onClick={handleMobileLinkClick}
                                  className={`ml-2 my-1 pb-2 border-b border-green-100 text-[14px] hover:text-green-500 ${pathname === '/contact' ? 'text-green-500' : ''}`}>Contact</Link>
                        </div>
                    )}
                </div>
            </nav>

            <ManageAccountModal
                isOpen={manageAccountOpen}
                onClose={() => setManageAccountOpen(false)}
                user={user}
                setUser={() => {
                }}
            />

            <style jsx>{`
              .animate-fadeIn {
                animation: fadeIn 0.18s ease-in-out;
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              .animate-slideDown {
                animation: slideDown 0.25s ease-in-out forwards;
              }

              @keyframes slideDown {
                0% {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
        </>
    );
};

export default Navbar;