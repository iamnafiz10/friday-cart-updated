import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "axios";

export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async ({storeId} = {}, thunkAPI) => {
        try {
            const {data} = await axios.get('/api/products' + (storeId ? `?storeId=${storeId}` : ''));
            // ✅ Ensure products is always an array
            const products = Array.isArray(data.products) ? data.products : [];
            return products;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || {error: 'Failed to fetch products'});
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
        status: 'idle', // idle | loading | succeeded | failed
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload;
        },
        clearProduct: (state) => {
            state.list = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            state.status = 'succeeded';
            // ✅ Just assign the products from API (already filtered by route)
            state.list = action.payload || [];
        });
        builder.addCase(fetchProducts.rejected, (state) => {
            state.status = 'failed';
            state.list = [];
        });
    },
});

export const {setProduct, clearProduct} = productSlice.actions;
export default productSlice.reducer;