'use client'

import {StarIcon, ShoppingCartIcon, ZapIcon} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {useDispatch, useSelector} from 'react-redux'
import {addToCart} from "@/lib/features/cart/cartSlice"
import {useRouter} from "next/navigation"
import toast from "react-hot-toast";

const ProductCard = ({product}) => {
    const dispatch = useDispatch();
    const router = useRouter();

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const cart = useSelector((state) => state.cart.cartItems || {});
    const quantity = cart[product.id] || 0;

    const rating =
        product.rating.length > 0
            ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
            : 0;

    const addToCartHandler = () => {
        dispatch(addToCart({productId: product.id}));
        // ✅ SHOW TOAST ONLY WHEN NEW ITEM ADDED
        if (quantity === 0) {
            toast.success("পণ্যটি কার্টে যোগ করা হয়েছে");
        }
    };

    const orderNowHandler = () => {
        dispatch(addToCart({productId: product.id}));
        router.push('/cart');
    };

    return (
        <div className="group bg-white rounded-lg transition duration-300 flex flex-col justify-between h-full">

            {/* Image */}
            <Link href={`/product/${product.id}`}>
                <div
                    className="bg-[#F5F5F5] h-[250px] rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                        width={500}
                        height={500}
                        src={product.images[0]}
                        alt={product.name || ""}
                        className="w-full h-full object-fill group-hover:scale-110 transition duration-500"
                    />
                </div>
            </Link>

            {/* Product Info — fixed height */}
            <div className="pt-2 min-h-[90px] flex flex-col justify-between">
                <Link href={`/product/${product.id}`}>
                    <p className="line-clamp-2 text-sm font-medium text-slate-700 min-h-[40px]">
                        {product.name}
                    </p>
                </Link>

                <div>
                    <div className="flex items-center gap-1 py-1">
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon
                                key={index}
                                size={14}
                                className="text-transparent"
                                fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                            />
                        ))}
                        <span className="text-xs text-green-500 font-bold">({product.rating.length})</span>
                    </div>

                    <p className="text-lg font-bold text-slate-900">
                        {currency}{product.price}
                    </p>
                </div>
            </div>

            {/* Buttons always bottom */}
            <div className="mt-3">
                <button
                    onClick={orderNowHandler}
                    className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-lg active:scale-95 transition"
                >
                    <ZapIcon size={14}/>
                    অর্ডার করুন
                </button>
                <button
                    onClick={() => quantity === 0 ? addToCartHandler() : router.push('/cart')}
                    className="mt-1 w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium py-2 rounded-lg active:scale-95 transition"
                >
                    <ShoppingCartIcon size={14}/>
                    {quantity === 0 ? "কার্টে রাখুন" : "কার্ট দেখুন"}
                </button>
            </div>
        </div>
    )
}

export default ProductCard