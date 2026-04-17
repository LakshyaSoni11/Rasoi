import React from "react";
import {
  FaLeaf,
  FaMinus,
  FaPlus,
  FaStar,
} from "react-icons/fa";
import { GiChickenLeg } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/userSlice.js";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const FoodCard = ({ data }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.user.cartItems);
  
  const cartItem = cartItems.find((item) => item.id === data._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Check if shop is open
  const isShopOpen = () => {
    const shopData = data.shop;
    if (!shopData || typeof shopData !== 'object' || !shopData.openingTime || !shopData.closingTime) return true;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    const { openingTime, closingTime } = shopData;
    
    if (openingTime < closingTime) {
      return currentTime >= openingTime && currentTime <= closingTime;
    } else {
      // Overnight case (e.g., 22:00 to 04:00)
      return currentTime >= openingTime || currentTime <= closingTime;
    }
  };

  const openStatus = isShopOpen();
  const isAvailable = data.isAvailable !== false; // Default to true if undefined
  const canOrder = openStatus && isAvailable;

  const handleUpdateCart = (newQty) => {
    if (!canOrder) return;
    if (newQty <= 0) {
      dispatch(removeFromCart(data._id));
    } else {
      // Overwrite exact quantity instead of adding
      // To do this nicely, we need a new reducer 'updateCartQuantity' 
      // but for now, we'll use addToCart logic and I'll update the reducer.
      // For the cart, we need to pass the most accurate final price
      const activePrice = (data.discountPrice && data.discountPrice > 0 && data.discountPrice < data.price) 
        ? data.discountPrice 
        : data.price;

      dispatch(addToCart({
        id: data._id,
        name: data.name,
        price: activePrice,
        image: data.image,
        shop: data.shop?._id || data.shop,
        quantity: newQty - quantity // Add/Subtract the difference
      }));
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        i < rating ? (
          <FaStar key={i} className="text-yellow-500" />
        ) : (
          <FaStar key={i} className="text-gray-300" />
        ),
      );
    }
    return stars;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-[160px] sm:w-[200px] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col cursor-pointer group focus:outline-none focus:ring-4 focus:ring-orange-100"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleUpdateCart(quantity === 0 ? 1 : quantity);
          }
      }}
    >
      <div className="relative w-full h-[120px] sm:h-[140px] flex justify-center items-center bg-gray-50 overflow-hidden">
        {data.foodType === "Veg" ? (
          <span className="absolute top-2 left-2 z-10 bg-green-500 text-white px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] flex items-center gap-1 font-bold shadow-md uppercase tracking-wider">
            <FaLeaf size={8} />
            Veg
          </span>
        ) : (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] flex items-center gap-1 font-bold shadow-md uppercase tracking-wider">
            <GiChickenLeg size={10} />
            Non-Veg
          </span>
        )}
        
        {data.isBestSeller && (
          <span className="absolute top-2 right-2 z-10 bg-[#ff4d2d] bg-gradient-to-r from-[#ff4d2d] to-[#ff8c42] text-white px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black shadow-lg uppercase tracking-widest flex items-center gap-1">
            <FaStar size={8} className="text-yellow-200" />
            Best Seller
          </span>
        )}
        <img
          src={data.image}
          alt={data.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!canOrder ? "grayscale blur-[2px] opacity-70" : ""}`}
        />
        {!canOrder && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
              {!isAvailable ? "Out of Stock" : "Shop Closed"}
            </span>
          </div>
        )}
        {quantity > 0 && canOrder && (
          <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-3">
        <h1 className="font-bold capitalize text-gray-800 text-sm sm:text-base line-clamp-1 group-hover:text-[#ff4d2d] transition-colors">
          {data.name}
        </h1>
        <div className="flex items-center gap-0.5 mt-0.5">
          <div className="flex items-center text-[10px] sm:text-xs">
            {renderStars(data.rating?.average || 0)}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-400 font-medium ml-1">
            ({data.rating?.count || 0})
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter -mb-1">Price</span>
            {(data.discountPrice && data.discountPrice > 0 && data.discountPrice < data.price) ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm sm:text-base font-black text-[#ff4d2d]">
                    ₹{data.discountPrice}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-bold">
                    ₹{data.price}
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-base font-black text-gray-900 mt-0.5">
                  ₹{data.price}
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canOrder) handleUpdateCart(1);
              }}
              disabled={!canOrder}
              className={`${
                canOrder 
                ? "bg-white hover:bg-[#ff4d2d] text-[#ff4d2d] hover:text-white border-gray-200 hover:border-[#ff4d2d]" 
                : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
              } border px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 flex items-center gap-1`}
            >
              ADD
            </button>
          ) : (
            <div
              className={`flex items-center rounded-xl overflow-hidden shadow-lg h-8 animate-in zoom-in-95 duration-200 ${canOrder ? "bg-[#ff4d2d]" : "bg-gray-400"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`w-8 h-full flex items-center justify-center text-white hover:bg-black/10 transition-colors font-black ${!canOrder && "cursor-not-allowed"}`}
                onClick={() => canOrder && handleUpdateCart(quantity - 1)}
                disabled={!canOrder}
              >
                <FaMinus size={10} />
              </button>
              <span className="w-6 h-full flex items-center justify-center text-white font-black text-xs">
                {quantity}
              </span>
              <button
                className={`w-8 h-full flex items-center justify-center text-white hover:bg-black/10 transition-colors font-black ${!canOrder && "cursor-not-allowed"}`}
                onClick={() => canOrder && handleUpdateCart(quantity + 1)}
                disabled={!canOrder}
              >
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCard;
