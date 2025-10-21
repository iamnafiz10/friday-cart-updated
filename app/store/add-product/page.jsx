'use client'
import {assets} from "@/assets/assets"
import Image from "next/image"
import {useState, useRef, useEffect} from "react"
import {toast} from "react-hot-toast"
import {getToken as getCustomToken} from "@/lib/auth";
import axios from "axios"
import dynamic from "next/dynamic"
import {ChevronDown} from "lucide-react";

// Dynamically import Jodit (prevents SSR issues)
const JoditEditor = dynamic(() => import("jodit-react"), {ssr: false})

export default function StoreAddProduct() {

    const editor = useRef(null)
    const [images, setImages] = useState({1: null, 2: null, 3: null, 4: null})
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
    })
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)

    // ✅ Fetch categories from public API (no admin auth needed)
    const fetchCategories = async () => {
        try {
            const {data} = await axios.get('/api/categories')
            setCategories(data.categories || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load categories")
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const onChangeHandler = (e) => {
        setProductInfo({...productInfo, [e.target.name]: e.target.value})
    }

    const handleDescriptionChange = (content) => {
        setProductInfo({...productInfo, description: content})
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            if (!images[1] && !images[2] && !images[3] && !images[4]) {
                return toast.error('Please upload at least one image')
            }

            setLoading(true)
            const formData = new FormData()
            formData.append('name', productInfo.name)
            formData.append('description', productInfo.description)
            formData.append('mrp', productInfo.mrp)
            formData.append('price', productInfo.price)
            formData.append('category', productInfo.category)

            Object.keys(images).forEach((key) => {
                images[key] && formData.append('images', images[key])
            })

            const token = await getCustomToken();
            const {data} = await axios.post('/api/store/product', formData, {
                headers: {Authorization: `Bearer ${token}`},
            })

            toast.success(data.message)

            // Reset form
            setProductInfo({
                name: "",
                description: "",
                mrp: 0,
                price: 0,
                category: "",
            })
            setImages({1: null, 2: null, 3: null, 4: null})
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    const editorConfig = {
        readonly: false,
        placeholder: "Write your product description...",
        language: 'en',
        height: 300,
        toolbarSticky: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        spellcheck: true,
        useNativeSpellChecker: true,
        askBeforePasteFromWord: false,
        askBeforePasteHTML: false,
        processPasteHTML: true,
        defaultActionOnPaste: "insert_clear_html",
        disablePlugins: [
            'speechRecognize',
            'ai-assistant',
            'pasteStorage',
            'pasteFromWord'
        ],
        cleanHTML: {
            removeEmptyElements: false,
            replaceNBSP: false,
            fillEmptyParagraph: false,
        },
        buttons: [
            "bold", "italic", "underline", "strikethrough", "|",
            "ul", "ol", "|",
            "fontsize", "brush", "|",
            "align", "|",
            "link", "|",
            "undo", "redo", "eraser"
        ],
        removeButtons: [
            "speechRecognize", "ai-assistant", "file", "spellcheck"
        ],
    }

    return (
        <form
            onSubmit={e => toast.promise(onSubmitHandler(e), {loading: "Adding Product..."})}
            className="text-slate-500 mb-28"
        >
            <h1 className="text-2xl">
                Add New <span className="text-slate-800 font-medium">Products</span>
            </h1>
            <p className="mt-7">Product Images</p>

            <div className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image
                            width={300}
                            height={300}
                            className="h-15 w-auto border border-slate-200 rounded cursor-pointer"
                            src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area}
                            alt=""
                        />
                        <input
                            type="file"
                            accept="image/*"
                            id={`images${key}`}
                            onChange={e => setImages({...images, [key]: e.target.files[0]})}
                            hidden
                        />
                    </label>
                ))}
            </div>

            {/* Product Name */}
            <label className="flex flex-col gap-2 my-6">
                Name
                <input
                    type="text"
                    name="name"
                    onChange={onChangeHandler}
                    value={productInfo.name}
                    placeholder="Enter product name"
                    className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded"
                    required
                />
            </label>

            {/* Product Description */}
            <label className="flex flex-col gap-2 my-6">
                Description
                <div
                    className="max-w-2xl bg-white rounded border border-slate-200 relative p-1"
                    data-gramm="false"
                    data-gramm_editor="false"
                >
                    <JoditEditor
                        ref={editor}
                        value={productInfo.description}
                        config={editorConfig}
                        onBlur={handleDescriptionChange}
                    />
                </div>
            </label>

            {/* Prices */}
            <div className="flex gap-5">
                <label className="flex flex-col gap-2">
                    Actual Price (৳)
                    <input
                        type="number"
                        name="mrp"
                        onChange={onChangeHandler}
                        value={productInfo.mrp}
                        placeholder="0"
                        className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
                        required
                    />
                </label>
                <label className="flex flex-col gap-2">
                    Offer Price (৳)
                    <input
                        type="number"
                        name="price"
                        onChange={onChangeHandler}
                        value={productInfo.price}
                        placeholder="0"
                        className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
                        required
                    />
                </label>
            </div>

            {/* ✅ Dynamic Category Selector */}
            <label className="flex flex-col gap-2 my-6 relative w-full max-w-sm">
                Category
                <div className="relative">
                    <select
                        onChange={(e) => setProductInfo({...productInfo, category: e.target.value})}
                        value={productInfo.category}
                        required
                        className="w-full p-2.5 px-4 rounded-lg border border-emerald-300 bg-white text-slate-700 text-sm
                 outline-none cursor-pointer appearance-none transition-all
                 hover:border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="" disabled hidden>
                            Select a category
                        </option>
                        {categories.map((cat) => (
                            <option
                                key={cat.id ?? cat._id ?? cat.name}
                                value={cat.name}
                                className="hover:bg-emerald-50"
                            >
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    {/* 🔽 Dropdown Arrow Icon (Lucide) */}
                    <ChevronDown
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
                    />
                </div>
            </label>

            <button
                disabled={loading}
                className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition"
            >
                Add Product
            </button>
        </form>
    )
}