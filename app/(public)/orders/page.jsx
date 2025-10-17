'use client';
import PageTitle from "@/components/PageTitle";
import {useEffect, useState, useRef} from "react";
import OrderItem from "@/components/OrderItem";
import {useAuth, useUser} from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import Loading from "@/components/Loading";
import {FilterIcon, ChevronDownIcon} from "lucide-react";

export default function Orders() {
    const {getToken} = useAuth();
    const {user, isLoaded} = useUser();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterOpen, setFilterOpen] = useState(false);
    const dropdownRef = useRef(null);
    const ordersPerPage = 10;
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = await getToken();
                const {data} = await axios.get("/api/orders", {
                    headers: {Authorization: `Bearer ${token}`},
                });

                const sortedOrders = data.orders.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
                setLoading(false);
            } catch (error) {
                toast.error(error?.response?.data?.error || error.message);
            }
        };
        if (isLoaded) {
            if (user) {
                fetchOrders();
            } else {
                router.push("/");
            }
        }
    }, [isLoaded, user, getToken, router]);

    // ✅ Handle filter change
    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setFilterOpen(false);
        if (status === "All") {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter((order) => order.status === status);
            setFilteredOrders(filtered);
        }
        setCurrentPage(1);
    };

    // ✅ Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isLoaded || loading) return <Loading/>;

    const hasPlacedOrder = orders.some((order) => order.status === "ORDER_PLACED");

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    // ✅ Empty state message
    const emptyMessages = {
        ORDER_PLACED: "You have no placed orders.",
        CONFIRMED: "You have no confirmed orders.",
        SHIPPED: "You have no shipped orders.",
        DELIVERED: "You have no delivered orders.",
        CANCELLED: "You have no cancelled orders.",
        All: "You have no orders.",
    };

    return (
        <div className="min-h-[70vh] mx-6 relative">
            {/* ✅ Bangla Alert */}
            {hasPlacedOrder && (
                <div className="max-w-3xl mx-auto my-10 animate-fadeIn">
                    <div
                        className="bg-gradient-to-r from-green-100 via-emerald-50 to-green-100 border border-emerald-200 rounded-xl shadow-md p-6 text-center">
                        <p className="text-[18px] text-emerald-700 font-semibold">
                            আমাদের কল সেন্টার থেকে ফোন করে আপনার অর্ডারটি কনফার্ম করা হবে।
                        </p>
                        <p className="text-red-500 text-sm sm:text-base leading-relaxed mt-2">
                            ফেইক অর্ডার শনাক্ত করতে আমরা আপনাদের{" "}
                            <span className="font-bold text-green-500">IP Address</span> রেখে দিচ্ছি। <br/>
                            যে ফেইক অর্ডার করবে, তার বিরুদ্ধে আইনগত পদক্ষেপ নেওয়া হবে।
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-black font-semibold">
                            আল্লাহ তায়ালা আমাদের হালাল উপার্জন ও সততার পথে রাখুন। 🤲
                        </p>
                    </div>
                </div>
            )}

            {/* ✅ Orders + Filter Header */}
            {orders.length > 0 ? (
                <div className="mb-20 mt-10 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <PageTitle
                            heading="My Orders"
                            text={`Showing total ${filteredOrders.length} orders`}
                            linkText={"Go to home"}
                        />

                        {/* ✅ Custom Filter Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="flex items-center gap-2 bg-white border border-emerald-300 rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-50 focus:ring-1 focus:ring-emerald-300 transition-all"
                            >
                                <FilterIcon size={16}/>
                                {filterStatus === "All" ? "Filter Orders" : filterStatus.replace("_", " ")}
                                <ChevronDownIcon size={16}
                                                 className={`transition-transform ${filterOpen ? "rotate-180" : ""}`}/>
                            </button>

                            {filterOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-44 bg-white border border-emerald-100 rounded-lg shadow-md z-20">
                                    {["All", "ORDER_PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleFilterChange(status)}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 ${
                                                filterStatus === status ? "text-emerald-600 font-semibold" : "text-gray-700"
                                            }`}
                                        >
                                            {status === "All"
                                                ? "All Orders"
                                                : status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ✅ Orders Table */}
                    {filteredOrders.length > 0 ? (
                        <>
                            <table
                                className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4 mt-6">
                                <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentOrders.map((order) => (
                                    <OrderItem order={order} key={order.id}/>
                                ))}
                                </tbody>
                            </table>

                            {/* ✅ Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-12 gap-2">
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${
                                                currentPage === index + 1
                                                    ? "bg-emerald-600 text-white border-emerald-600"
                                                    : "bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center mt-12 text-slate-500 text-lg font-medium">
                            {emptyMessages[filterStatus]}
                        </div>
                    )}
                </div>
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
                </div>
            )}

            {/* ✅ Animation */}
            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .animate-fadeIn {
                animation: fadeIn 0.7s ease-in-out;
              }
            `}</style>
        </div>
    );
}