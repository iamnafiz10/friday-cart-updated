'use client';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import axios from 'axios';
import {deleteItemFromCart} from '@/lib/features/cart/cartSlice';
import {useAuth} from '@/app/context/AuthContext';
import {getToken as getCustomToken} from '@/lib/auth';

const OrderSummary = ({totalPrice, items}) => {
    const {user, openLogin} = useAuth();
    const dispatch = useDispatch();
    const router = useRouter();
    const currency = '৳';

    // Payment Method
    const [paymentMethod, setPaymentMethod] = useState('COD');

    // Address Fields
    const [address, setAddress] = useState({
        name: '',
        fullAddress: '',
        phone: '',
        city: '',
    });

    const handleAddressChange = (e) => {
        setAddress({...address, [e.target.name]: e.target.value});
    };

    // Coupon
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        if (!user) {
            toast.error('কুপন ব্যবহার করতে লগইন করুন');
            openLogin();
            return;
        }

        try {
            const token = await getCustomToken();
            const {data} = await axios.post(
                '/api/coupon',
                {code: couponCodeInput},
                {headers: {Authorization: `Bearer ${token}`}}
            );
            setCoupon(data.coupon);
            toast.success('Coupon Applied');
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("অর্ডার করতে লগ ইন করুন");
            openLogin();
            return;
        }

        if (!address.name.trim()) {
            toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
            return;
        }

        if (!address.fullAddress.trim()) {
            toast.error("আপনার জেলা/থানা/গ্রাম লিখুন");
            return;
        }

        if (!address.phone.trim()) {
            toast.error("আপনার ফোন নম্বর লিখুন");
            return;
        }

        if (!address.city.trim()) {
            toast.error("আপনার শহর নির্বাচন করুন");
            return;
        }

        const token = await getCustomToken();
        const orderData = {address, items, paymentMethod};
        if (coupon) orderData.couponCode = coupon.code;

        const {data} = await axios.post("/api/orders", orderData, {
            headers: {Authorization: `Bearer ${token}`},
        });

        toast.success(data.message);
        items.forEach(item => dispatch(deleteItemFromCart({productId: item.id})));
        router.push("/orders");
    };

    // Shipping fee
    const shippingFee = address.city === 'Inside Dhaka' ? 80 : 150;
    const discount = coupon ? (coupon.discount / 100) * totalPrice : 0;
    const finalTotal = totalPrice - discount + shippingFee;

    return (
        <div
            className="w-full lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7">
            <h2 className="text-xl font-medium text-slate-600">Payment Summary</h2>

            {/* Payment Method */}
            <p className="text-slate-400 text-xs my-4">Payment Method</p>
            <div className="flex gap-2 items-center">
                <input
                    type="radio"
                    id="COD"
                    onChange={() => setPaymentMethod('COD')}
                    checked={paymentMethod === 'COD'}
                    className="accent-gray-500"
                />
                <label htmlFor="COD" className="cursor-pointer font-semibold">
                    COD <span className="text-green-500">(প্রোডাক্ট হাতে পেয়ে টাকা দিন)</span>
                </label>
            </div>

            {/* Address */}
            <div className="my-4 py-4 border-y border-green-500 text-slate-400">
                <p className="font-medium text-slate-600 pb-3">Delivery Address</p>
                <div className="grid gap-3">
                    <input
                        name="name"
                        value={address.name}
                        onChange={handleAddressChange}
                        className="p-2 px-3 text-black border border-black-500 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        type="text"
                        placeholder="আপনার নাম লিখুন"
                        required
                    />
                    <input
                        name="fullAddress"
                        value={address.fullAddress}
                        onChange={handleAddressChange}
                        className="p-2 px-3 text-black border border-black-500 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        type="text"
                        placeholder="জেলা / থানা / গ্রাম"
                        required
                    />
                    <input
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        className="p-2 px-3 text-black border border-black-500 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        type="number"
                        placeholder="মোবাইল"
                        required
                    />
                    <select
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        className="p-2 px-3 border border-green-500 rounded text-green-500 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none cursor-pointer bg-white"
                        required
                    >
                        <option value="" disabled hidden>স্থান নির্বাচন করুন</option>
                        <option value="Inside Dhaka">ঢাকার ভিতরে</option>
                        <option value="Outside Dhaka">ঢাকার বাহিরে</option>
                    </select>
                </div>
            </div>

            {/* Coupon & Subtotal */}
            <div className="pb-4 border-b border-slate-200">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-1 text-slate-400">
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className="flex flex-col gap-1 font-medium text-right">
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p className="text-blue-500">{currency}{shippingFee.toLocaleString()}</p>
                        {coupon && <p>{`-${currency}${discount.toFixed(2)}`}</p>}
                    </div>
                </div>

                {!coupon && (
                    <form onSubmit={handleCouponCode} className="flex justify-center gap-3 mt-3">
                        <input
                            onChange={(e) => setCouponCodeInput(e.target.value)}
                            value={couponCodeInput}
                            type="text"
                            placeholder="Coupon Code"
                            className="border border-slate-400 p-1.5 rounded w-full outline-none"
                        />
                        <button
                            className="bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all">
                            Apply
                        </button>
                    </form>
                )}
            </div>

            {/* Total */}
            <div className="flex justify-between py-4">
                <p>Total:</p>
                <p className="font-medium text-right text-green-500 font-semibold">
                    {currency}{finalTotal.toLocaleString()}
                </p>
            </div>

            {/* Place Order */}
            <button
                onClick={handlePlaceOrder}
                className="w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all"
            >
                Place Order
            </button>
        </div>
    );
};

export default OrderSummary;