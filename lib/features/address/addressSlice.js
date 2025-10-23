import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

// 🟦 Fetch all addresses for current user
export const fetchAddress = createAsyncThunk(
    "address/fetchAddress",
    async ({token}, thunkAPI) => {
        try {
            const {data} = await axios.get("/api/address", {
                headers: {Authorization: `Bearer ${token}`},
            });
            return data ? data.addresses : [];
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// 🟥 Delete an address
export const deleteAddress = createAsyncThunk(
    "address/deleteAddress",
    async ({id, token}, {rejectWithValue}) => {
        try {
            const {data} = await axios.delete(`/api/address/${id}`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            return id; // ✅ Return deleted address ID to update state
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete address";
            return rejectWithValue(message);
        }
    }
);

// 🟢 Add a new address
export const addNewAddress = createAsyncThunk(
    "address/addNewAddress",
    async ({addressData, token}, {rejectWithValue}) => {
        try {
            const {data} = await axios.post("/api/address", addressData, {
                headers: {Authorization: `Bearer ${token}`},
            });
            return data.newAddress; // Return created address
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to add address";
            return rejectWithValue(message);
        }
    }
);

const addressSlice = createSlice({
    name: "address",
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.push(action.payload);
        },
        clearAddresses: (state) => {
            state.list = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch addresses
            .addCase(fetchAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddress.fulfilled, (state, action) => {
                state.list = action.payload;
                state.loading = false;
            })
            .addCase(fetchAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete address
            .addCase(deleteAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.list = state.list.filter((addr) => addr.id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add new address
            .addCase(addNewAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addNewAddress.fulfilled, (state, action) => {
                state.list.push(action.payload);
                state.loading = false;
            })
            .addCase(addNewAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {addAddress, clearAddresses} = addressSlice.actions;
export default addressSlice.reducer;