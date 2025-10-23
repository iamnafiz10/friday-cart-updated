'use client'
import {addToCart, removeFromCart} from "@/lib/features/cart/cartSlice";
import {useDispatch, useSelector} from "react-redux";

const Counter = ({productId}) => {
    const dispatch = useDispatch();

    // Safely get cart items
    const cartItems = useSelector(state => state.cart.cartItems || {});
    const quantity = cartItems[productId] || 0;

    const addToCartHandler = () => {
        dispatch(addToCart({productId}));
    };

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({productId}));
    };

    return (
        <div
            className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button
                onClick={removeFromCartHandler}
                className="p-1 select-none"
                disabled={quantity === 0} // prevent going below 0
            >
                -
            </button>
            <p className="p-1">{quantity}</p>
            <button
                onClick={addToCartHandler}
                className="p-1 select-none"
            >
                +
            </button>
        </div>
    );
}

export default Counter;