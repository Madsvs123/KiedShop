import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage (temporary while not synced with backend)
const loadLocalCart = () => {
  try {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const initialState = {
  items: loadLocalCart(),
  shippingAddress: {},
  paymentMethod: 'FREESHIP',
  coupon: null,
  synced: false, // whether cart has been synced with backend
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart or update if exists
    syncCart(state, action) {
      // Replace entire cart with backend-sourced data
      state.items = action.payload;
      state.synced = true;
      localStorage.setItem('cartItems', JSON.stringify(action.payload));
    },
    addToCart(state, action) {
      const item = action.payload;
      const existItem = state.items.find((x) => x.product === item.product);
      
      if (existItem) {
        state.items = state.items.map((x) =>
          x.product === existItem.product ? item : x
        );
      } else {
        state.items.push(item);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    // Remove item from cart
    removeFromCart(state, action) {
      state.items = state.items.filter((x) => x.product !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    // Update quantity of specific cart item
    updateCartItem(state, action) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((x) => x.product === id);
      if (existingItem) {
        existingItem.qty = quantity;
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    // Save shipping address
    saveShippingAddress(state, action) {
      state.shippingAddress = action.payload;
    },
    
    // Save payment method
    savePaymentMethod(state, action) {
      state.paymentMethod = action.payload;
    },
    
    // Apply coupon
    applyCoupon(state, action) {
      state.coupon = action.payload;
    },
    
    // Remove coupon
    removeCoupon(state) {
      state.coupon = null;
    },
    
    // Clear entire cart
    clearCart(state) {
      state.items = [];
      state.shippingAddress = {};
      state.paymentMethod = 'FREESHIP';
      state.coupon = null;
      state.synced = false;
      localStorage.removeItem('cartItems');
    },
    
    // Clear only cart items (keep shipping & payment)
    clearCartItems(state) {
      state.items = [];
    },
  },
});

// Export all actions
export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  clearCartItems,
  applyCoupon,
  removeCoupon,
  syncCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + item.price * item.qty, 0);
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.qty, 0);
export const selectShippingAddress = (state) => state.cart.shippingAddress;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;

export default cartSlice.reducer;