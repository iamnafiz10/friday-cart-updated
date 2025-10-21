'use client'
import {XIcon} from "lucide-react"
import {useState} from "react"
import {toast} from "react-hot-toast"
import { useCurrentUser, getToken as getCustomToken } from "@/lib/auth";
import {useDispatch} from "react-redux"
import axios from "axios"
import {addAddress} from "@/lib/features/address/addressSlice"

const AddressModal = ({setShowAddressModal}) => {

    const { user, isLoaded } = useCurrentUser();
    const dispatch = useDispatch();

    const [address, setAddress] = useState({
        name: '',
        fullAddress: '',
        phone: '',
        city: '',
        country: 'Bangladesh',
    });

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ If user is not logged in → show toast + close modal
        if (!user) {
            toast.error("Please login your account first");
            setShowAddressModal(false);
            return;
        }

        try {
            const token = await getCustomToken();

            const res = await axios.post(
                '/api/address',
                {address},
                {headers: {Authorization: `Bearer ${token}`}}
            );

            const data = res.data;

            if (res.status === 401) {
                toast.error("Please login your account first");
                setShowAddressModal(false);
                return;
            }

            dispatch(addAddress(data.newAddress));
            toast.success(data.message);
            setShowAddressModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error || error.message);
        }
    };

    return (
        <form
            onSubmit={e => toast.promise(handleSubmit(e), {loading: 'Adding Address...'})}
            className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center"
        >
            <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6 bg-white p-6 rounded-lg shadow">
                <h2 className="text-3xl">
                    Add New <span className="font-semibold">Address</span>
                </h2>
                <input name="name" onChange={handleAddressChange} value={address.name}
                       className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text"
                       placeholder="আপনার নাম লিখুন" required/>
                <div>
                    <p className="text-gray-400 pb-2 text-[12px]">
                        জেলা / থানা /গ্রাম
                    </p>
                    <input name="fullAddress" onChange={handleAddressChange} value={address.fullAddress}
                           className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text"
                           placeholder="আপনার পুরো ঠিকানা লিখুন" required/>
                </div>
                <input name="phone" onChange={handleAddressChange} value={address.phone}
                       className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="number"
                       placeholder="মোবাইল" required/>
                {/* ✅ Replace this input with a dropdown */}
                <select
                    name="city"
                    onChange={handleAddressChange}
                    value={address.city || ""}
                    className="p-2 px-4 border border-slate-300 rounded-lg w-full bg-white text-slate-700 text-sm outline-none cursor-pointer
               hover:border-slate-400 focus:ring-1 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
                    required
                >
                    <option value="" disabled hidden>
                        স্থান নির্বাচন করুন
                    </option>
                    <option value="Outside Dhaka">ঢাকার বাহিরে</option>
                    <option value="Inside Dhaka">ঢাকার ভিতরে</option>
                </select>
                <div className="flex gap-4">
                    <input
                        name="country"
                        value="Bangladesh"
                        readOnly
                        className="p-2 px-4 outline-none border border-slate-200 rounded w-full bg-gray-100 text-slate-600 cursor-not-allowed"
                        type="text"
                        placeholder="দেশ"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all"
                >
                    SAVE ADDRESS
                </button>
            </div>

            <XIcon
                size={30}
                className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer"
                onClick={() => setShowAddressModal(false)}
            />
        </form>
    );
};

export default AddressModal;