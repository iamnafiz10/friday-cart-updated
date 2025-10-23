'use client'

import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import {deleteItemFromCart, clearCart} from "@/lib/features/cart/cartSlice";
import {Trash2Icon, ShoppingCart, ShoppingBasket} from "lucide-react"; // 🔹 ShoppingCart icon added
import Image from "next/image";
import Link from "next/link";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const {cartItems} = useSelector(state => state.cart); // 🔹 cart items from Redux
    const products = useSelector(state => state.product.list); // 🔹 all products from Redux
    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]); // 🔹 cart items with product details
    const [totalPrice, setTotalPrice] = useState(0); // 🔹 total price calculation
    const [loading, setLoading] = useState(true); // 🔹 loading state on page refresh

    // 🔹 Convert cartItems (object) to array with product details
    const createCartArray = () => {
        setTotalPrice(0);
        const array = [];
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(product => product.id === key);
            if (product) {
                array.push({...product, quantity: value});
                setTotalPrice(prev => prev + product.price * value); // 🔹 calculate total
            }
        }
        setCartArray(array);
    };

    // 🔹 Delete single product from cart
    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({productId}));
    };

    // 🔹 Clear all items from cart
    const handleClearCart = () => {
        dispatch(clearCart());
    };

    // 🔹 When cart items or products change, recalculate cart array and total price
    useEffect(() => {
        setLoading(true); // 🔹 start loading
        if (products.length > 0) {
            createCartArray(); // 🔹 create cart array with product details
            setLoading(false); // 🔹 finished loading
        }
    }, [cartItems, products]);

    // 🔹 Show loading state when cart data is being prepared
    if (loading) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <h1 className="text-2xl sm:text-4xl font-semibold">Your Cart Data is Loading...</h1>
            </div>
        );
    }

    // 🔹 Show empty cart message with icon
    if (cartArray.length === 0) {
        return (
            <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center text-slate-400 gap-4">
                <ShoppingBasket size={80} className="text-green-300"/>
                <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
            </div>
        );
    }

    // 🔹 Main cart page with table and order summary
    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto">
                {/* Title + Clear Cart */}
                <div className="flex justify-between items-center mb-5">
                    <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" path='/shop'/>
                    <button
                        onClick={handleClearCart}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium active:scale-95 transition"
                    >
                        Clear Cart
                    </button>
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
                                <tr
                                    key={index}
                                    className={`
                                            hover:bg-slate-50 transition-all duration-200
                                            max-sm:flex max-sm:flex-col max-sm:gap-2
                                            max-sm:rounded-lg max-sm:border max-sm:border-slate-200 max-sm:p-4 max-sm:shadow-sm max-sm:mb-3
                                            max-sm:relative
                                        `}
                                >
                                    {/* Product Info */}
                                    <td className="flex gap-3 items-start py-3 px-4 max-sm:p-0">
                                        <Link
                                            href={`/product/${item.id}`}
                                            className="bg-slate-100 rounded-md flex items-center justify-center w-16 h-16 shrink-0 hover:opacity-90 transition-all"
                                        >
                                            <Image
                                                src={item.images[0]}
                                                className="object-contain h-14 w-auto"
                                                alt={item.name}
                                                width={50}
                                                height={50}
                                            />
                                        </Link>

                                        <div className="flex-1">
                                            <p className="font-medium text-slate-700">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.category}</p>
                                            <p className="text-sm font-semibold">{currency}{item.price}</p>
                                        </div>

                                        {/* Mobile Remove Button */}
                                        <button
                                            onClick={() => handleDeleteItemFromCart(item.id)}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-full active:scale-95 transition-all sm:hidden absolute top-3 right-3"
                                            aria-label={`Remove ${item.name}`}
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

                                    {/* Desktop Remove Button */}
                                    <td className="text-center py-3 px-4 hidden sm:table-cell">
                                        <button
                                            onClick={() => handleDeleteItemFromCart(item.id)}
                                            className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all"
                                            aria-label={`Remove ${item.name}`}
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