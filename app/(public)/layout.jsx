'use client'
// import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchProducts} from "@/lib/features/product/productSlice";
import {useCurrentUser, getToken as getCustomToken} from "@/lib/auth";
import {fetchCart, uploadCart} from "@/lib/features/cart/cartSlice";
import {fetchAddress} from "@/lib/features/address/addressSlice";
import {fetchUserRatings} from "@/lib/features/rating/ratingSlice";

export default function PublicLayout({children}) {
    const dispatch = useDispatch();
    const {user, isLoaded} = useCurrentUser();
    const {cartItems} = useSelector((state) => state.cart)

    useEffect(() => {
        dispatch(fetchProducts({}))
    }, [])

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const token = await getCustomToken();
                dispatch(fetchCart({token}));
                dispatch(fetchAddress({token}));
                dispatch(fetchUserRatings({token}));
            }
        };

        fetchUserData();
    }, [user]);

    useEffect(() => {
        const uploadCartData = async () => {
            if (user && cartItems.length > 0) {
                const token = await getCustomToken();
                dispatch(uploadCart({token}));
            }
        };

        uploadCartData();
    }, [cartItems, user]);

    return (
        <>
            {/*<Banner/>*/}
            <Navbar/>
            {children}
            <Footer/>
        </>
    );
}