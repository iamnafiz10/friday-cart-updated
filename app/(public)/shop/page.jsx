'use client'

import {Suspense, useEffect, useRef, useState} from "react";
import ProductCard from "@/components/ProductCard";
import {MoveLeftIcon, FilterIcon, ChevronDownIcon} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {useSelector} from "react-redux";
import axios from "axios";
import Loading from "@/components/Loading";

function ShopContent() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search");
    const categoryParam = searchParams.get("category");
    const router = useRouter();

    // products from Redux (may be empty on refresh until populated)
    const productsFromRedux = useSelector((state) => (state.product && state.product.list) || []);
    const reduxLoadingFlag = useSelector((state) => (state.product ? state.product.loading : undefined));

    const [products, setProducts] = useState(productsFromRedux || []);
    const [checking, setChecking] = useState(true); // local loading/check state shown via <Loading/>
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const dropdownRef = useRef(null);
    const productsPerPage = 15;

    // Fetch categories once
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const {data} = await axios.get("/api/categories");
                if (!mounted) return;
                setCategories(data.categories || []);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        })();
        return () => (mounted = false);
    }, []);

    // Keep local `products` in sync with Redux when Redux becomes available
    useEffect(() => {
        if (productsFromRedux && productsFromRedux.length > 0) {
            setProducts(productsFromRedux);
        }
        // do not force overwrite if redux empty but we already fetched on our own
    }, [productsFromRedux]);

    // Decide when to stop showing Loading:
    // - If redux provides a loading flag, use it.
    // - If redux loading is undefined (slice may not expose it) then we fetch a quick check to see if products exist.
    useEffect(() => {
        let mounted = true;

        const checkProducts = async () => {
            // If Redux explicitly tells us it's loading, show Loading
            if (reduxLoadingFlag === true) {
                setChecking(true);
                return;
            }

            // If Redux explicitly finished loading (false), use redux list length
            if (reduxLoadingFlag === false) {
                setProducts(productsFromRedux || []);
                if (mounted) setChecking(false);
                return;
            }

            // reduxLoadingFlag is undefined — we don't know; do a server check so refresh shows Loading then resolves.
            setChecking(true);
            try {
                const {data} = await axios.get("/api/products");
                if (!mounted) return;
                const fetched = data.products || [];
                // If Redux has items (race), prefer Redux; otherwise use fetched
                if (!productsFromRedux || productsFromRedux.length === 0) {
                    setProducts(fetched);
                }
            } catch (err) {
                // network error — still stop Loading so user sees empty state or existing redux list
                console.error("Failed to fetch products for existence check:", err);
            } finally {
                if (mounted) setChecking(false);
            }
        };

        checkProducts();

        return () => {
            mounted = false;
        };
        // include productsFromRedux so that when Redux populates after async fetch, this effect can react
    }, [reduxLoadingFlag, productsFromRedux]);

    // Reset page on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory]);

    // Filtering logic
    const filteredProducts = (products || []).filter((product) => {
        const matchesSearch = search ? product.name.toLowerCase().includes(search.toLowerCase()) : true;
        const matchesCategory = selectedCategory
            ? product.category?.toLowerCase() === selectedCategory.toLowerCase()
            : true;
        return matchesSearch && matchesCategory;
    });

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const title = selectedCategory ? `${selectedCategory} Products` : search ? `Search Results` : "All Products";

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setFilterOpen(false);
        if (category) {
            router.push(`/shop?category=${encodeURIComponent(category)}`);
        } else {
            router.push(`/shop`);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const handleBack = () => {
        setSelectedCategory("");
        router.push("/shop");
        router.refresh();
        setCurrentPage(1);
    };

    // --- Render logic ---
    // 1) If still checking (show loader) -> show <Loading/>
    // 2) else if filteredProducts.length === 0 -> show No products found
    // 3) else -> render products grid and pagination
    if (checking) {
        // Show your Loading component during refresh / initial check
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loading/>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center my-6">
                    <h1 onClick={handleBack} className="text-2xl text-slate-500 flex items-center gap-2 cursor-pointer">
                        {(search || selectedCategory) && <MoveLeftIcon size={20}/>}
                        <span className="text-slate-700 font-medium">{title}</span>
                    </h1>

                    {/* Filter Dropdown */}
                    <div className="relative mt-3 sm:mt-0" ref={dropdownRef}>
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-2 bg-white border border-emerald-300 rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-50 focus:ring-1 focus:ring-emerald-300 transition-all"
                        >
                            <FilterIcon size={16}/>
                            {selectedCategory ? selectedCategory : "Filter by Category"}
                            <ChevronDownIcon size={16}
                                             className={`transition-transform ${filterOpen ? "rotate-180" : ""}`}/>
                        </button>

                        {filterOpen && (
                            <div
                                className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-md z-20">
                                <button
                                    onClick={() => handleCategoryChange("")}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                                        selectedCategory === "" ? "text-slate-800 font-semibold" : "text-slate-600"
                                    }`}
                                >
                                    All Products
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryChange(cat.name)}
                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                                            selectedCategory === cat.name ? "text-slate-800 font-semibold" : "text-slate-600"
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <p className="text-slate-400 text-center mt-12">No products found.</p>
                ) : (
                    <>
                        <div className="my-12 gap-6 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {paginatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product}/>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mb-20">
                                {Array.from({length: totalPages}).map((_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-4 py-2 rounded-md border text-sm ${
                                                currentPage === pageNum
                                                    ? "bg-slate-700 text-white border-slate-700"
                                                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function Shop() {
    return (
        <Suspense fallback={<div>Loading shop...</div>}>
            <ShopContent/>
        </Suspense>
    );
}