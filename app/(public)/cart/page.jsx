'use client'

import {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import {deleteItemFromCart, clearCart} from "@/lib/features/cart/cartSlice";
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import {Trash2Icon, ShoppingBasket} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const {cartItems} = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    // Prepare cart array with product details and calculate total
    const createCartArray = () => {
        const array = [];
        let total = 0;
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(p => p.id === key);
            if (product) {
                array.push({...product, quantity: value});
                total += product.price * value;
            }
        }
        setCartArray(array);
        setTotalPrice(total);
    };

    useEffect(() => {
        createCartArray();
    }, [cartItems, products]);

    // Empty cart state
    if (!cartArray || cartArray.length === 0) return (
        <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center text-slate-400 gap-4">
            <ShoppingBasket size={80} className="text-green-300"/>
            <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
            <Link href="/shop" className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">
                Add Products
            </Link>
        </div>
    );

    // Main cart page
    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto">
                {/* Title + Clear Cart */}
                <div className="block sm:flex mb-4 sm:mb-0 justify-between items-center">
                    <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" path='/shop'/>
                    <button
                        onClick={() => dispatch(clearCart())}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium active:scale-95 transition"
                    >
                        Clear Cart
                    </button>
                </div>
                <div className="note_text w-full overflow-hidden mb-3">
                    <marquee className="text-[14px]">
                        ঢাকার ভিতরে ডেলিভারি খরচ <b className="text-blue-500">৮০</b> টাকা এবং ঢাকার বাহিরে <b
                        className="text-blue-500">১৫০</b> টাকা
                    </marquee>
                </div>

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">
                    {/* Cart Items Table */}
                    <div className="w-full">
                        <table className="w-full text-slate-600 table-auto border-collapse">
                            <thead className="bg-slate-50 text-slate-700 uppercase text-sm max-sm:hidden">
                            <tr>
                                <th className="text-left py-3 px-4">Product</th>
                                <th className="text-center py-3 px-4">Quantity</th>
                                <th className="text-center py-3 px-4">Total Price</th>
                                <th className="text-center py-3 px-4 hidden sm:table-cell">Remove</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                            {cartArray.map((item, index) => (
                                <tr key={index}
                                    className="hover:bg-slate-50 transition-all duration-200 max-sm:flex max-sm:flex-col max-sm:gap-2 max-sm:rounded-lg max-sm:border max-sm:border-slate-200 max-sm:p-4 max-sm:shadow-sm max-sm:mb-3 max-sm:relative">
                                    {/* Product Info */}
                                    <td className="flex gap-3 items-start py-3 px-4 max-sm:p-0">
                                        <Link href={`/product/${item.id}`}
                                              className="bg-slate-100 rounded-md flex items-center justify-center w-16 h-16 shrink-0 hover:opacity-90 transition-all">
                                            <Image src={item.images[0]} alt={item.name} width={50} height={50}
                                                   className="object-contain h-14 w-auto"/>
                                        </Link>
                                        <div className="flex-1 mr-8 lg:mr-0">
                                            <p className="flex lg:hidden font-medium text-[15px] text-slate-700">{item.name}</p>
                                            <p className="hidden lg:flex font-medium text-[15px] text-slate-700 leading-tight">{item.name}</p>
                                            <p className="text-xs text-gray-400 my-1">{item.category}</p>
                                            <p className="text-sm font-semibold text-green-500">{currency}{item.price}</p>
                                        </div>
                                        <button
                                            onClick={() => dispatch(deleteItemFromCart({productId: item.id}))}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-full active:scale-95 transition-all sm:hidden absolute top-3 right-3"
                                        >
                                            <Trash2Icon size={18}/>
                                        </button>
                                    </td>

                                    {/* Quantity Counter */}
                                    <td className="text-center py-3 px-4 max-sm:p-0 max-sm:text-left">
                                        <Counter productId={item.id}/>
                                    </td>

                                    {/* Total Price */}
                                    <td className="text-center py-3 px-4 max-sm:p-0 max-sm:text-left font-semibold text-slate-700">
                                        {currency}{(item.price * item.quantity).toLocaleString()}
                                    </td>

                                    {/* Desktop Remove */}
                                    <td className="text-center py-3 px-4 hidden sm:table-cell">
                                        <button
                                            onClick={() => dispatch(deleteItemFromCart({productId: item.id}))}
                                            className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all"
                                        >
                                            <Trash2Icon size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Order Summary */}
                    <OrderSummary totalPrice={totalPrice} items={cartArray}/>
                </div>
            </div>
        </div>
    );
}