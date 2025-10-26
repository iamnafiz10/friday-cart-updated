import {configureStore} from "@reduxjs/toolkit";
import {persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from "redux-persist";
import storage from "redux-persist/lib/storage";

import cartReducer from "./features/cart/cartSlice";
import productReducer from "./features/product/productSlice";
import categoryReducer from "./features/category/categorySlice";
import addressReducer from "./features/address/addressSlice";
import ratingReducer from "./features/rating/ratingSlice";

const productPersistConfig = {
    key: "product",
    storage,
};

const categoryPersistConfig = {
    key: "category",
    storage,
};

const persistedProductReducer = persistReducer(productPersistConfig, productReducer);
const persistedCategoryReducer = persistReducer(categoryPersistConfig, categoryReducer);

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        product: persistedProductReducer,
        category: persistedCategoryReducer,
        address: addressReducer,
        rating: ratingReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);