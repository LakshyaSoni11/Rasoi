import { createSlice, current } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        shopsInMyCity: null,
        itemsInMyCity: null,
        cartItems: [],
        myOrders:null,
        searchQuery: "",
        refreshTrigger: 0,
        socket: null
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        setCurrentCity: (state, action) => {
            state.currentCity = action.payload
        },
        setCurrentState: (state, action) => {
            state.currentState = action.payload
        },
        setCurrentAddress: (state, action) => {
            state.currentAddress = action.payload
        },
        setShopsInMyCity: (state, action) => {
            state.shopsInMyCity = action.payload
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload
        },
        addToCart: (state, action) => {
            const cartItem = action.payload
            const existingItem = state.cartItems.find((item) => item.id === cartItem.id)
            if (existingItem) {
                existingItem.quantity += cartItem.quantity
            } else {
                state.cartItems.push(cartItem)
            }
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((item) => item.id !== action.payload)
        },
        clearCart: (state) => {
            state.cartItems = []
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload
        },
        triggerRefresh: (state) => {
            state.refreshTrigger += 1
        },
        setSocket: (state, action) => {
            state.socket = action.payload
        }
    }
})

export const { setUserData, setCurrentCity, setCurrentState, setCurrentAddress, setShopsInMyCity, setItemsInMyCity, addToCart, removeFromCart, clearCart, setMyOrders, setSearchQuery, triggerRefresh, setSocket } = userSlice.actions;
export default userSlice.reducer