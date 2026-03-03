import React from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaUtensils,
} from "react-icons/fa";
import { removeFromCart, addToCart, clearCart } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const navigate = useNavigate()
  const { cartItems } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleIncrement = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      dispatch(addToCart({ ...item, quantity: -1 }));
    } else {
      dispatch(removeFromCart(item.id));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const taxes = calculateSubtotal() * 0.05; // 5% GST
  const grandTotal = calculateSubtotal() + deliveryFee + taxes;

  return (
    <div className="min-h-screen bg-[#fff9f6] pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-[#ff4d2d]"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
              Your <span className="text-[#ff4d2d]">Cart</span>
            </h1>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="text-sm text-red-500 hover:text-red-600 font-semibold border-b border-transparent hover:border-red-500 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-orange-50 text-[#ff4d2d] rounded-full flex items-center justify-center mb-6">
              <FaUtensils size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your cart is empty!
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Looks like you haven't added anything to your cart yet. Explore
              restaurants and find something delicious.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-[#ff4d2d] hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 flex flex-col gap-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex gap-4 sm:gap-6 items-center transition-all hover:shadow-md"
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800 text-base sm:text-lg line-clamp-1 capitalize">
                        {item.name}
                      </h3>
                      <p className="font-bold text-[#ff4d2d] whitespace-nowrap ml-2">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 mb-3">
                      ₹{item.price} each
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-orange-50 border border-orange-100 rounded-lg overflow-hidden h-8 sm:h-9">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="w-8 sm:w-9 h-full flex items-center justify-center text-[#ff4d2d] hover:bg-orange-100 transition-colors"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="w-8 h-full flex items-center justify-center bg-white text-[#ff4d2d] font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item)}
                          className="w-8 sm:w-9 h-full flex items-center justify-center text-[#ff4d2d] hover:bg-orange-100 transition-colors"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium text-gray-800">
                      ₹{calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-gray-800">
                      ₹{deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & GST (5%)</span>
                    <span className="font-medium text-gray-800">
                      ₹{taxes.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Total Amount
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#ff4d2d]">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-[#ff4d2d] hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5 flex justify-center items-center gap-2" onClick={()=>navigate("/checkout")}>
                  Proceed to Checkout
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Secure checkout powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
