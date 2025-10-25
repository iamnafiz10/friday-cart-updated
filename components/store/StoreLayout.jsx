'use client';
import {useEffect, useState} from "react";
import Loading from "../Loading";
import SellerSidebar from "./StoreSidebar";
import StoreNavbar from "./StoreNavbar";
import axios from "axios";
import Link from "next/link";

const StoreLayout = ({children}) => {
    const [storeInfo, setStoreInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await axios.get("/api/store/me");
                setStoreInfo(res.data.store);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, []);

    if (loading) return <Loading/>;

    if (!storeInfo)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
                    You are not authorized to access this page
                </h1>
                <Link
                    href="/create-store"
                    className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full"
                >
                    Create Store
                </Link>
            </div>
        );

    // ✅ Show message when store is rejected
    if (storeInfo.status === "rejected")
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl sm:text-4xl font-semibold text-red-500">
                    The admin rejected your store.
                </h1>
                <p className="mt-3 text-slate-500 max-w-md">
                    The admin rejected your store.<br/>
                    Please <Link href='/contact' className="text-green-500 underline">contact</Link> support to
                    continue.
                </p>
            </div>
        );

    return (
        <div className="flex flex-col h-screen">
            <StoreNavbar store={storeInfo}/>
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo}/>
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default StoreLayout;