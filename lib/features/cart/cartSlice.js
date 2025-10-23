import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    total: 0,
    cartItems: {}, // Must be object
};

// Helper: save to localStorage
const saveCartToLocalStorage = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        loadCart: (state) => {
            if (typeof window !== 'undefined') {
                const savedCart = JSON.parse(localStorage.getItem('cart')) || {};
                state.cartItems = savedCart;
                state.total = Object.values(savedCart).reduce((acc, qty) => acc + qty, 0);
            }
        },
        addToCart: (state, action) => {
            const {productId} = action.payload;
            if (!state.cartItems) state.cartItems = {};

            if (state.cartItems[productId]) {
                state.cartItems[productId] += 1;
            } else {
                state.cartItems[productId] = 1;
            }

            state.total += 1;
            saveCartToLocalStorage(state.cartItems);
        },
        removeFromCart: (state, action) => {
            const {productId} = action.payload;
            if (state.cartItems?.[productId]) {
                state.cartItems[productId] -= 1;
                if (state.cartItems[productId] <= 0) delete state.cartItems[productId];
                state.total -= 1;
                saveCartToLocalStorage(state.cartItems);
            }
        },
        deleteItemFromCart: (state, action) => {
            const {productId} = action.payload;
            if (state.cartItems?.[productId]) {
                state.total -= state.cartItems[productId];
                delete state.cartItems[productId];
                saveCartToLocalStorage(state.cartItems);
            }
        },
        clearCart: (state) => {
            state.cartItems = {};
            state.total = 0;
            saveCartToLocalStorage({});
        },
    },
});

export const {loadCart, addToCart, removeFromCart, deleteItemFromCart, clearCart} = cartSlice.actions;
export default cartSlice.reducer;