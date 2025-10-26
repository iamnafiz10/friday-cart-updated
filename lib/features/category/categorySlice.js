import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCategories = createAsyncThunk(
    "categories/fetchCategories",
    async () => {
        const {data} = await axios.get("/api/categories");
        return data.categories || [];
    }
);

const categoriesSlice = createSlice({
    name: "categories",
    initialState: {
        list: [],
        status: "idle", // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.list = action.payload;
            })
            .addCase(fetchCategories.rejected, (state) => {
                state.status = "failed";
                state.list = [];
            });
    },
});

export default categoriesSlice.reducer;