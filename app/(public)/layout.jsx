'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {loadCart} from "@/lib/features/cart/cartSlice";
import {fetchProducts} from "@/lib/features/product/productSlice";

export default function PublicLayout({children}) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Load cart from localStorage
            dispatch(loadCart());

            // Fetch products from API
            dispatch(fetchProducts({}));
        }
    }, [dispatch]);

    return (
        <>
            <Navbar/>
            {children}
            <Footer/>
        </>
    );
}