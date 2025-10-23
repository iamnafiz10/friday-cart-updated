'use client'
import Image from "next/image";
import {DotIcon} from "lucide-react";
import {useSelector} from "react-redux";
import Rating from "./Rating";
import {useState} from "react";
import RatingModal from "./RatingModal";
import Link from "next/link";

const OrderItem = ({order}) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const [ratingModal, setRatingModal] = useState(null);
    const {ratings} = useSelector(state => state.rating);

    // ✅ Handle missing/deleted address gracefully
    const address = order.address;
    const isAddressDeleted = !address;
    const shippingAddress = order.shippingAddress;

    // ✅ Prepare which address to show (fallback)
    const finalAddress = !isAddressDeleted ? address : shippingAddress
        ? {
            name: shippingAddress.name,
            fullAddress: shippingAddress.fullAddress,
            phone: shippingAddress.phone,
            city: shippingAddress.city,
        }
        : null;

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <Link
                                    href={`/product/${item.product.id}`}
                                    className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md hover:opacity-90 transition"
                                >
                                    <Image
                                        className="h-14 w-auto"
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        width={50}
                                        height={50}
                                    />
                                </Link>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base">
                                        {item.product.name}
                                    </p>
                                    <p>
                                        {currency}{item.price} Qty: {item.quantity}
                                    </p>
                                    <p className="mb-1">
                                        {new Date(order.createdAt).toDateString()}
                                    </p>

                                    {/* 🟢 Rating system */}
                                    <div>
                                        {ratings.find(
                                            rating =>
                                                order.id === rating.orderId &&
                                                item.product.id === rating.productId
                                        ) ? (
                                            <Rating
                                                value={
                                                    ratings.find(
                                                        rating =>
                                                            order.id === rating.orderId &&
                                                            item.product.id === rating.productId
                                                    ).rating
                                                }
                                            />
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setRatingModal({
                                                        orderId: order.id,
                                                        productId: item.product.id,
                                                    })
                                                }
                                                className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" && "hidden"}`}
                                            >
                                                Rate Product
                                            </button>
                                        )}
                                    </div>

                                    {ratingModal && (
                                        <RatingModal
                                            ratingModal={ratingModal}
                                            setRatingModal={setRatingModal}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                {/* 🟢 Total */}
                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                {/* 🟢 Address Section (fallback included) */}
                <td className="text-left max-md:hidden">
                    {!finalAddress ? (
                        <p className="text-red-500">Address not available</p>
                    ) : (
                        <>
                            <p><b>Name:</b> {finalAddress.name}</p>
                            <p><b>Address:</b> {finalAddress.fullAddress}</p>
                            <p><b>Mobile:</b> {finalAddress.phone}</p>
                            <p className="text-green-500 mt-1">{finalAddress.city}</p>
                        </>
                    )}
                </td>

                {/* 🟢 Status */}
                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 
              ${order.status === "ORDER_PLACED"
                            ? "text-black bg-slate-100"
                            : order.status === "CONFIRMED"
                                ? "text-blue-600 bg-blue-100"
                                : order.status === "CANCELLED"
                                    ? "text-red-600 bg-red-100"
                                    : order.status === "SHIPPED"
                                        ? "text-yellow-600 bg-yellow-100"
                                        : order.status === "DELIVERED"
                                            ? "text-green-600 bg-green-100"
                                            : "text-slate-500 bg-slate-100"
                        }`}
                    >
                        <DotIcon size={10} className="scale-250"/>
                        {order.status.split("_").join(" ").toLowerCase()}
                    </div>
                </td>
            </tr>

            {/* 🟠 Mobile view */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    {!finalAddress ? (
                        <p className="text-red-500 italic">Address not available</p>
                    ) : (
                        <>
                            <p><b>Name:</b> {finalAddress.name}</p>
                            <p><b>Address:</b> {finalAddress.fullAddress}</p>
                            <p><b>Mobile:</b> {finalAddress.phone}</p>
                            <p className="text-green-500 mt-1">{finalAddress.city}</p>
                            {isAddressDeleted && (
                                <p className="text-xs text-yellow-600 italic">
                                    (Original address deleted — showing stored shipping info)
                                </p>
                            )}
                        </>
                    )}
                </td>
                <td>
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 
              ${order.status === "ORDER_PLACED"
                            ? "text-black bg-slate-100"
                            : order.status === "CONFIRMED"
                                ? "text-blue-600 bg-blue-100"
                                : order.status === "CANCELLED"
                                    ? "text-red-600 bg-red-100"
                                    : order.status === "SHIPPED"
                                        ? "text-yellow-600 bg-yellow-100"
                                        : order.status === "DELIVERED"
                                            ? "text-green-600 bg-green-100"
                                            : "text-slate-500 bg-slate-100"
                        }`}
                    >
                        <DotIcon size={10} className="scale-250"/>
                        {order.status.replace(/_/g, " ").toLowerCase()}
                    </div>
                </td>
            </tr>

            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto"/>
                </td>
            </tr>
        </>
    );
};

export default OrderItem;