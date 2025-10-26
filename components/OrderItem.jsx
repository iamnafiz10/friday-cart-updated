'use client';
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

    const address = order.address;
    const shippingAddress = order.shippingAddress;
    const isAddressDeleted = !address;

    const finalAddress = !isAddressDeleted
        ? address
        : shippingAddress
            ? {
                name: shippingAddress.name,
                fullAddress: shippingAddress.fullAddress,
                phone: shippingAddress.phone,
                city: shippingAddress.city,
            }
            : null;

    return (
        <>
            {/* ===== Desktop Table View ===== */}
            <tr className="text-sm hidden md:table-row">
                <td className="text-left">
                    <div className="flex flex-col gap-6 w-[100%]">
                        {order.orderItems.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-4">
                                <Link
                                    href={`/product/${item.product.id}`}
                                    className="min-w-18 min-h-18 w-18 h-18 bg-slate-100 flex items-center justify-center rounded-md hover:opacity-90 transition shrink-0"
                                >
                                    <Image
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        width={80}
                                        height={80}
                                        className="object-cover w-12 h-12"
                                    />
                                </Link>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base break-words">{item.product.name}</p>
                                    <p>{currency}{item.price} Qty: {item.quantity}</p>
                                    <p className="mb-1 text-[12px]">{new Date(order.createdAt).toDateString()}</p>

                                    {/* Rating */}
                                    <div>
                                        {ratings.find(r => r.orderId === order.id && r.productId === item.product.id) ? (
                                            <Rating
                                                value={ratings.find(r => r.orderId === order.id && r.productId === item.product.id).rating}/>
                                        ) : (
                                            <button
                                                onClick={() => setRatingModal({
                                                    orderId: order.id,
                                                    productId: item.product.id
                                                })}
                                                className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" && "hidden"}`}
                                            >
                                                Rate Product
                                            </button>
                                        )}
                                    </div>

                                    {ratingModal &&
                                        <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal}/>}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                {/* Total */}
                <td className="text-center max-md:hidden text-green-500 font-bold">{currency}{order.total}</td>

                {/* Address */}
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

                {/* Status */}
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
                        <DotIcon size={10}/>
                        {order.status.replace(/_/g, ' ').toLowerCase()}
                    </div>
                </td>
            </tr>

            {/* ===== Mobile Card View ===== */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    <div className="bg-white shadow rounded-lg p-4 mb-4 border border-slate-200 flex flex-col gap-3">
                        {/* Products */}
                        {order.orderItems.map((item) => (
                            <div key={item.product.id} className="flex gap-3 items-center">
                                <Link href={`/product/${item.product.id}`}
                                      className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-slate-100">
                                    <Image
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                    />
                                </Link>
                                <div className="flex-1 flex flex-col justify-between">
                                    <p className="font-semibold text-slate-700 text-base break-words">{item.product.name}</p>
                                    <p className="text-sm text-slate-500">{currency}{item.price} |
                                        Qty: {item.quantity}</p>
                                    <p className="text-xs text-slate-400">{new Date(order.createdAt).toDateString()}</p>

                                    {ratings.find(r => r.orderId === order.id && r.productId === item.product.id) ? (
                                        <Rating
                                            value={ratings.find(r => r.orderId === order.id && r.productId === item.product.id).rating}/>
                                    ) : (
                                        <button
                                            onClick={() => setRatingModal({
                                                orderId: order.id,
                                                productId: item.product.id
                                            })}
                                            className={`text-green-500 text-xs hover:bg-green-50 px-2 py-1 rounded ${order.status !== "DELIVERED" && "hidden"}`}
                                        >
                                            Rate Product
                                        </button>
                                    )}
                                    {ratingModal &&
                                        <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal}/>}
                                </div>
                            </div>
                        ))}

                        {/* Summary */}
                        <div className="border-t border-slate-200 pt-2 flex flex-col gap-1">
                            <p className="text-slate-600 text-sm font-medium">Total: <span
                                className="text-green-500 font-bold">{currency}{order.total}</span></p>
                            <p className="text-slate-600 text-sm font-medium">Status:
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs 
                  ${order.status === "ORDER_PLACED" ? "bg-slate-100 text-black" :
                                    order.status === "CONFIRMED" ? "bg-blue-100 text-blue-600" :
                                        order.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                                            order.status === "SHIPPED" ? "bg-yellow-100 text-yellow-600" :
                                                order.status === "DELIVERED" ? "bg-green-100 text-green-600" :
                                                    "bg-slate-100 text-slate-500"}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
                            </p>
                        </div>

                        {/* Address */}
                        {finalAddress ? (
                            <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                                <p className="font-semibold text-slate-700">Delivery Address</p>
                                <p><b>Name:</b> {finalAddress.name}</p>
                                <p><b>Address:</b> {finalAddress.fullAddress}</p>
                                <p><b>Mobile:</b> {finalAddress.phone}</p>
                                <p className="text-green-600"><b>City:</b> {finalAddress.city}</p>
                            </div>
                        ) : (
                            <p className="text-red-500 italic mt-1">Address not available</p>
                        )}
                    </div>
                </td>
            </tr>
        </>
    );
};

export default OrderItem;