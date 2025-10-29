"use client";
import {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {fetchCategories} from "@/lib/features/category/categorySlice";
import {useRouter} from "next/navigation";

export default function CategoriesMarquee() {
    const dispatch = useDispatch();
    const router = useRouter();

    const {list: categories} = useSelector((state) => state.category);

    // ✅ Always fetch latest categories on mount
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    if (!categories || categories.length === 0) {
        return (
            <div className="text-center text-slate-400 py-10">
                No categories found.
            </div>
        );
    }

    const repeated = Array(10).fill(categories).flat();

    return (
        <div className="relative w-full overflow-hidden select-none sm:my-20">
            <div
                className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"/>
            <div className="flex animate-scroll">
                <div className="flex flex-nowrap gap-4 px-4">
                    {repeated.map((cat, i) => (
                        <button
                            key={i}
                            onClick={() =>
                                router.push(
                                    `/shop?category=${encodeURIComponent(cat.name)}`
                                )
                            }
                            className="px-5 py-2 bg-slate-100 rounded-lg text-slate-500 text-xs sm:text-sm hover:bg-slate-600 hover:text-white active:scale-95 transition-all duration-300 whitespace-nowrap"
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
            <div
                className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"/>
            <style jsx>{`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }

              .animate-scroll {
                animation: scroll 70s linear infinite;
              }
            `}</style>
        </div>
    );
}