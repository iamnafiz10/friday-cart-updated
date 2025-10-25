'use client';

import Loading from "@/components/Loading";
import {CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon, UserCircle2} from "lucide-react";
import Image from "next/image";
import {useEffect, useState} from "react";
import {getToken as getCustomToken} from "@/lib/auth";
import axios from "axios";
import toast from "react-hot-toast";

export default function Dashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
        totalConfirmedOrders: 0,
        totalShippedOrders: 0,
        totalCancelledOrders: 0,
        totalDeliveredOrders: 0,
    });
    const [hasStore, setHasStore] = useState(true);

    const dashboardCardsData = [
        {title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon},
        {title: 'Total Earnings', value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon},
        {title: 'Total Ratings', value: dashboardData.ratings.length, icon: StarIcon},
        {title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon},
        {title: 'Confirmed Orders', value: dashboardData.totalConfirmedOrders, icon: TagsIcon},
        {title: 'Shipped Orders', value: dashboardData.totalShippedOrders, icon: TagsIcon},
        {title: 'Cancelled Orders', value: dashboardData.totalCancelledOrders, icon: TagsIcon},
        {title: 'Delivered Orders', value: dashboardData.totalDeliveredOrders, icon: TagsIcon},
    ];

    const fetchDashboardData = async () => {
        try {
            const token = await getCustomToken();
            const {data} = await axios.get('/api/store/dashboard', {
                headers: {Authorization: `Bearer ${token}`}
            });

            if (!data?.dashboardData) {
                setHasStore(false);
                return;
            }

            setDashboardData(data.dashboardData);
        } catch (error) {
            if (error?.response?.status === 403) {
                setHasStore(false);
            } else {
                toast.error(error?.response?.data?.error || error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return <Loading/>;

    if (!hasStore) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
                Dashboard data not available
            </h1>
            <p className="mt-2 text-slate-500">You need to create a store to access your dashboard.</p>
        </div>
    );

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 my-10 mt-4">
                {dashboardCardsData.map((card, index) => (
                    <div key={index}
                         className={`flex items-center justify-between border border-slate-200 p-3 px-6 rounded-lg
                           ${
                             card.title === "Delivered Orders" ? "text-green-600 bg-green-100" :
                                 card.title === "Cancelled Orders" ? "text-red-600 bg-red-100" :
                                     card.title === "Shipped Orders" ? "text-yellow-600 bg-yellow-100" :
                                         card.title === "Confirmed Orders" ? "text-blue-600 bg-blue-100" :
                                             "bg-white text-slate-600"
                         }
                         `}>
                        <div className="flex flex-col gap-3 text-xs">
                            <p>{card.title}</p>
                            <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                        </div>
                        <card.icon size={50} className="w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full"/>
                    </div>
                ))}
            </div>

            <h2>Total Reviews</h2>
            <div className="mt-5">
                {dashboardData.ratings.map((review, index) => (
                    <div key={index}
                         className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl">
                        <div>
                            <div className="flex gap-3">
                                {review.user?.image ? (
                                    <Image
                                        src={review.user.image}
                                        alt={review.user.name || "User Avatar"}
                                        className="w-10 aspect-square rounded-full object-cover"
                                        width={100}
                                        height={100}
                                    />
                                ) : (
                                    <UserCircle2 size={40} className="text-green-500"/>
                                )}
                                <div>
                                    <p className="font-medium">{review.user.name}</p>
                                    <p className="font-light text-gray-400 text-[12px]">{new Date(review.createdAt).toDateString()}</p>
                                </div>
                            </div>

                            {/* ⭐ Rating Stars */}
                            <div className="flex mt-2 gap-1">
                                {Array.from({length: 5}).map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`${i < review.rating ? "text-green-500 fill-current" : "text-gray-300"}`}
                                        size={16}
                                    />
                                ))}
                            </div>

                            {/* 📝 Review Text */}
                            <p className="mt-2 text-slate-500 max-w-xs leading-6">{review.review}</p>

                            {/* 🔗 View Product Button */}
                            <button
                                onClick={() => window.open(`/product/${review.productId}`, "_blank")}
                                className="mt-2 bg-transparent hover:bg-green-500 hover:text-white border border-green-500 text-green-500 px-3 py-2 rounded-md transition-colors"
                            >
                                See Product
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}