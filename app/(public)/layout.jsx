'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {loadCart} from "@/lib/features/cart/cartSlice";
import {fetchProducts} from "@/lib/features/product/productSlice";

export default function PublicLayout({children}) {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.product.list);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && !loaded) {
            // Load cart once
            dispatch(loadCart());

            // Fetch products once
            dispatch(fetchProducts()).finally(() => setLoaded(true));
        }
    }, [dispatch, loaded]);

    return (
        <>
            <Navbar/>
            {children}
            <Footer/>
        </>
    );
}