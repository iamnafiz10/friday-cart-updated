'use client'
import {useEffect, useState} from "react"
import {toast} from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import {useCurrentUser, getToken as getCustomToken} from "@/lib/auth";
import axios from "axios";
import {Edit, Trash2, Trash2Icon} from "lucide-react";

export default function StoreManageProducts() {
    const {user} = useCurrentUser();
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {
        try {
            const token = await getCustomToken();
            const {data} = await axios.get('/api/store/product', {
                headers: {Authorization: `Bearer ${token}`},
            });
            setProducts(data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
        setLoading(false);
    };

    const toggleStock = async (productId) => {
        try {
            const token = await getCustomToken();
            const {data} = await axios.post('/api/store/stock-toggle', {productId}, {
                headers: {Authorization: `Bearer ${token}`},
            });
            setProducts(prev => prev.map(p => p.id === productId ? {...p, inStock: !p.inStock} : p))
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    }

    const deleteProduct = async (id) => {
        const confirmed = confirm("Are you sure you want to delete this product?");
        if (!confirmed) return;

        try {
            const token = await getCustomToken();
            await axios.delete(`/api/store/product?id=${id}`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            toast.success("Product deleted successfully!");

            setProducts(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    };

    useEffect(() => {
        if (user) fetchProducts()
    }, [user])

    if (loading) return <Loading/>

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">
                Manage <span className="text-slate-800 font-medium">Products</span>
            </h1>

            <table className="w-full max-w-4xl text-left ring ring-slate-200 rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">MRP</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-center">Stock</th>
                    <th className="px-4 py-3 text-center">Action</th>
                </tr>
                </thead>

                <tbody className="text-slate-700">
                {products.map((product) => (
                    <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">
                            <div className="flex gap-2 items-center">
                                <Image width={40} height={40}
                                       className="p-1 shadow rounded"
                                       src={product.images[0]}
                                       alt=""/>
                                {product.name}
                            </div>
                        </td>

                        <td className="px-4 py-3 font-semibold">{currency}{product.mrp.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold">{currency}{product.price.toLocaleString()}</td>

                        <td className="px-4 py-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                <input type="checkbox"
                                       className="sr-only peer"
                                       onChange={() =>
                                           toast.promise(toggleStock(product.id), {
                                               loading: "Updating..."
                                           })
                                       }
                                       checked={product.inStock}/>
                                <div
                                    className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                <span
                                    className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                            </label>
                        </td>

                        <td className="px-4 py-3 text-center flex gap-3 justify-center">
                            <button
                                onClick={() => deleteProduct(product.id)}
                                className="text-red-600"
                            >
                                <Trash2Icon size={18}/>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}