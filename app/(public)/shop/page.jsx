'use client'

import {Suspense, useEffect, useRef, useState} from "react"
import ProductCard from "@/components/ProductCard"
import {MoveLeftIcon, FilterIcon, ChevronDownIcon} from "lucide-react"
import {useRouter, useSearchParams} from "next/navigation"
import {useSelector} from "react-redux"
import axios from "axios"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get("search")
    const categoryParam = searchParams.get("category")
    const router = useRouter()

    const products = useSelector((state) => state.product.list)
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || "")
    const [currentPage, setCurrentPage] = useState(1)
    const [filterOpen, setFilterOpen] = useState(false)
    const dropdownRef = useRef(null)
    const productsPerPage = 12

    // ✅ Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const {data} = await axios.get("/api/categories")
                setCategories(data.categories || [])
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            }
        }
        fetchCategories()
    }, [])

    // ✅ Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [search, selectedCategory])

    // ✅ Filter products
    const filteredProducts = products.filter((product) => {
        const matchesSearch = search
            ? product.name.toLowerCase().includes(search.toLowerCase())
            : true
        const matchesCategory = selectedCategory
            ? product.category?.toLowerCase() === selectedCategory.toLowerCase()
            : true
        return matchesSearch && matchesCategory
    })

    // ✅ Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
    const startIndex = (currentPage - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    // ✅ Title
    const title = selectedCategory
        ? `${selectedCategory} Products`
        : search
            ? `Search Results`
            : "All Products"

    // ✅ Handle category change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        setFilterOpen(false)
        if (category) {
            router.push(`/shop?category=${encodeURIComponent(category)}`)
        } else {
            router.push(`/shop`)
        }
    }

    // ✅ Click outside dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setFilterOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // ✅ Pagination
    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({top: 0, behavior: "smooth"})
    }

    const handleBack = () => {
        setSelectedCategory("")
        router.push("/shop")
        router.refresh()
        setCurrentPage(1)
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center my-6">
                    <h1
                        onClick={handleBack}
                        className="text-2xl text-slate-500 flex items-center gap-2 cursor-pointer"
                    >
                        {(search || selectedCategory) && <MoveLeftIcon size={20}/>}
                        <span className="text-slate-700 font-medium">{title}</span>
                    </h1>

                    {/* ✅ Filter Dropdown */}
                    <div className="relative mt-3 sm:mt-0" ref={dropdownRef}>
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-2 bg-white border border-emerald-300 rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-50 focus:ring-1 focus:ring-emerald-300 transition-all"
                        >
                            <FilterIcon size={16}/>
                            {selectedCategory ? selectedCategory : "Filter by Category"}
                            <ChevronDownIcon
                                size={16}
                                className={`transition-transform ${filterOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {filterOpen && (
                            <div
                                className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-md z-20"
                            >
                                <button
                                    onClick={() => handleCategoryChange("")}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                                        selectedCategory === ""
                                            ? "text-slate-800 font-semibold"
                                            : "text-slate-600"
                                    }`}
                                >
                                    All Products
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryChange(cat.name)}
                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                                            selectedCategory === cat.name
                                                ? "text-slate-800 font-semibold"
                                                : "text-slate-600"
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
                        <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-10">
                            {paginatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product}/>
                            ))}
                        </div>

                        {/* ✅ Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mb-20">
                                {Array.from({length: totalPages}).map((_, index) => {
                                    const pageNum = index + 1
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
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<div>Loading shop...</div>}>
            <ShopContent/>
        </Suspense>
    )
}