'use client';
import {PlusIcon, SquarePenIcon, XIcon} from 'lucide-react';
import React, {useEffect, useRef, useState} from 'react';
import AddressModal from './AddressModal';
import {useDispatch, useSelector} from 'react-redux';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import {useCurrentUser, getToken as getCustomToken} from '@/lib/auth';
import axios from 'axios';
import {fetchAddress, deleteAddress} from '@/lib/features/address/addressSlice';
import {deleteItemFromCart} from '@/lib/features/cart/cartSlice';

const OrderSummary = ({totalPrice, items}) => {
    const {user, isLoaded} = useCurrentUser(); // custom auth
    const dispatch = useDispatch();
    const currency = '৳'; // Always use BDT Taka symbol
    const router = useRouter();

    // address list from redux
    const addressList = useSelector((state) => state.address.list || []);

    // local UI states (kept your original layout)
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

    // track previous address count so we can detect new address additions
    const prevAddressCount = useRef(addressList.length);

    // ---------------------------
    // Fetch addresses on mount
    // ---------------------------
    // This ensures addresses persist after page refresh.
    useEffect(() => {
        const loadAddresses = async () => {
            if (!user) return; // wait for user to be loaded / logged in
            try {
                const token = await getCustomToken();
                // dispatch fetchAddress thunk — we pass token object that the thunk expects
                // NOTE: fetchAddress thunk signature in slice expects { token }
                dispatch(fetchAddress({token}));
            } catch (err) {
                console.error('Failed to load addresses', err);
            }
        };
        loadAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // only run when user object changes

    // ---------------------------
    // Handle coupon code (unchanged)
    // ---------------------------
    const handleCouponCode = async (event) => {
        event.preventDefault();
        try {
            if (!user) return toast('Please login to proceed');
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

    // ---------------------------
    // Place Order (Removed Cart Product Which One User Ordered)
    // ---------------------------
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        try {
            if (!user) return toast('Please login to place an order');
            if (!selectedAddress) return toast('Please select an address');

            const token = await getCustomToken();
            const orderData = {
                addressId: selectedAddress.id,
                items,
                paymentMethod,
            };

            if (coupon) orderData.couponCode = coupon.code;

            const {data} = await axios.post('/api/orders', orderData, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (paymentMethod === 'STRIPE') {
                window.location.href = data.session.url;
            } else {
                toast.success(data.message);

                // 🧹 Remove ordered products from cart (Redux + localStorage)
                items.forEach((item) => {
                    dispatch(deleteItemFromCart({productId: item.id}));
                });

                // ✅ Redirect to /orders
                router.push('/orders');
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    };

    // ---------------------------
    // Delete address (uses token & updates redux via thunk)
    // ---------------------------
    const handleDeleteAddress = async (id) => {
        try {
            const token = await getCustomToken();
            // dispatch deleteAddress thunk which expects {id, token}
            await dispatch(deleteAddress({id, token})).unwrap();

            // If deleted address was selected, reset selection
            if (selectedAddress?.id === id) setSelectedAddress(null);
            toast.success('Address deleted successfully');
            // No need to manually remove from addressList — thunk updates redux state
        } catch (error) {
            // thunk returns a friendly message in state.error or throws it via unwrap
            const message = error || 'Failed to delete address';
            toast.error(message);
        }
    };

    // ---------------------------
    // Shipping cost, discount, final total (unchanged)
    // ---------------------------
    let shippingFee = 150;
    if (selectedAddress) {
        if (selectedAddress.city === 'Inside Dhaka') shippingFee = 80;
        else if (selectedAddress.city === 'Outside Dhaka') shippingFee = 150;
    }

    const discount = coupon ? (coupon.discount / 100) * totalPrice : 0;
    const finalTotal = totalPrice - discount + shippingFee;

    // ---------------------------
    // Auto-select newest address when addressList changes
    // - if new address added, select it
    // - if no selection and addresses exist, pick newest
    // ---------------------------
    useEffect(() => {
        const prevCount = prevAddressCount.current;
        const currentCount = addressList.length;

        // New address was added (array increased)
        if (currentCount > prevCount && !showAddressModal) {
            const newest =
                addressList
                    .slice()
                    .sort((a, b) => {
                        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return tb - ta; // newest first
                    })[0] || addressList[addressList.length - 1];
            setSelectedAddress(newest || null);
        }

        prevAddressCount.current = currentCount;
    }, [addressList, showAddressModal]);

    // If no selection but addresses exist (e.g. after refresh), pick newest
    useEffect(() => {
        if (!selectedAddress && addressList.length > 0) {
            const newest =
                addressList
                    .slice()
                    .sort((a, b) => {
                        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return tb - ta;
                    })[0] || addressList[addressList.length - 1];
            setSelectedAddress(newest || null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addressList]);

    if (!isLoaded) return null; // Wait for user data

    return (
        <div
            className="w-full lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7">
            <h2 className="text-xl font-medium text-slate-600">Payment Summary</h2>
            <p className="text-slate-400 text-xs my-4">Payment Method</p>

            {/* Payment Method Selection */}
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

            <div className="flex gap-2 items-center mt-3">
                <p className="cursor-pointer font-semibold text-[12px]">
                    ঢাকার ভিতরে শিপিং চার্জ <span className="text-blue-500">৮০</span> টাকা ঢাকার বাহিরে{' '}
                    <span className="text-blue-500">১৫০</span> টাকা।
                </p>
            </div>

            {/* Address Section */}
            <div className="my-4 py-4 border-y border-slate-200 text-slate-400">
                <p>Address</p>
                {selectedAddress ? (
                    <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-10">
                            <p>
                                {selectedAddress.name}
                                <span
                                    className="text-black"> {selectedAddress.city}</span>, {selectedAddress.fullAddress}
                            </p>
                        </div>
                        <div className="col-span-2 ml-auto">
                            {/* Keep your edit behavior — clicking this clears selection and shows list */}
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className="cursor-pointer"
                                           size={18}/>
                        </div>
                    </div>
                ) : (
                    <div>
                        {addressList.length > 0 && (
                            <div className="my-3 space-y-2">
                                {addressList
                                    .slice()
                                    .sort((a, b) => {
                                        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                                        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                                        return tb - ta; // newest first
                                    })
                                    .map((address) => (
                                        <div
                                            key={address.id}
                                            className={`grid grid-cols-12 justify-between items-center border border-slate-300 rounded p-2 cursor-pointer hover:bg-slate-100 ${
                                                selectedAddress?.id === address.id ? 'bg-slate-200' : ''
                                            }`}
                                            onClick={() => setSelectedAddress(address)}
                                        >
                                            <div className="col-span-10">
                                                <p className="text-sm">
                                                    {address.name}, <span
                                                    className="text-black">{address.city}</span>, {address.fullAddress}
                                                </p>
                                            </div>
                                            <div className="col-span-2 ml-auto">
                                                <XIcon
                                                    size={16}
                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAddress(address.id);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                        <button
                            className="flex items-center gap-1 text-slate-600 mt-1"
                            onClick={() => setShowAddressModal(true)}
                        >
                            Add Address <PlusIcon size={18}/>
                        </button>
                    </div>
                )}
            </div>

            {/* Coupon Section */}
            <div className="pb-4 border-b border-slate-200">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-1 text-slate-400">
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className="flex flex-col gap-1 font-medium text-right">
                        <p>
                            {currency}
                            {totalPrice.toLocaleString()}
                        </p>
                        <p className="text-blue-500">
                            {currency}
                            {shippingFee.toLocaleString()}
                        </p>
                        {coupon && <p>{`-${currency}${discount.toFixed(2)}`}</p>}
                    </div>
                </div>

                {!coupon ? (
                    <form
                        onSubmit={(e) =>
                            toast.promise(handleCouponCode(e), {
                                loading: 'Checking Coupon...',
                            })
                        }
                        className="flex justify-center gap-3 mt-3"
                    >
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
                ) : (
                    <div className="w-full flex items-center justify-center gap-2 text-xs mt-2">
                        <p>
                            Code: <span className="font-semibold ml-1">{coupon.code.toUpperCase()}</span>
                        </p>
                        <p>{coupon.description}</p>
                        <XIcon
                            size={18}
                            onClick={() => setCoupon('')}
                            className="hover:text-red-700 transition cursor-pointer"
                        />
                    </div>
                )}
            </div>

            {/* Total */}
            <div className="flex justify-between py-4">
                <p>Total:</p>
                <p className="font-medium text-right text-green-500 font-semibold">
                    {currency}
                    {finalTotal.toLocaleString()}
                </p>
            </div>

            <button
                onClick={(e) => toast.promise(handlePlaceOrder(e), {loading: 'Placing Order...'})}
                className="w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all"
            >
                Place Order
            </button>

            {/* AddressModal — supports onSuccess callback if implemented in modal */}
            {showAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowAddressModal}
                    onSuccess={(newAddress) => {
                        // If modal gives us the new address directly, select it immediately.
                        if (newAddress) {
                            setSelectedAddress(newAddress);
                            toast.success('New address added & selected');
                        }
                        // close modal (modal may already close itself)
                        setShowAddressModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default OrderSummary;
