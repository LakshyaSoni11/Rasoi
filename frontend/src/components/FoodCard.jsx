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

const FoodCard = ({ data }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.user.cartItems);
  
  // Find if this item is already in the cart
  const cartItem = cartItems.find((item) => item.id === data._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleUpdateCart = (newQty) => {
    if (newQty <= 0) {
      dispatch(removeFromCart(data._id));
    } else {
      // Overwrite exact quantity instead of adding
      // To do this nicely, we need a new reducer 'updateCartQuantity' 
      // but for now, we'll use addToCart logic and I'll update the reducer.
      dispatch(addToCart({
        id: data._id,
        name: data.name,
        price: data.price,
        image: data.image,
        shop: data.shop,
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
    <div className="w-[160px] sm:w-[200px] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col cursor-pointer group">
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
        <img
          src={data.image}
          alt={data.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {quantity > 0 && (
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
            <span className="text-sm sm:text-base font-black text-gray-900">
                ₹{data.price}
            </span>
          </div>

          {quantity === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateCart(1);
              }}
              className="bg-white hover:bg-[#ff4d2d] text-[#ff4d2d] hover:text-white border border-gray-200 hover:border-[#ff4d2d] px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              ADD
            </button>
          ) : (
            <div
              className="flex items-center bg-[#ff4d2d] rounded-xl overflow-hidden shadow-lg h-8 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-8 h-full flex items-center justify-center text-white hover:bg-black/10 transition-colors font-black"
                onClick={() => handleUpdateCart(quantity - 1)}
              >
                <FaMinus size={10} />
              </button>
              <span className="w-6 h-full flex items-center justify-center text-white font-black text-xs">
                {quantity}
              </span>
              <button
                className="w-8 h-full flex items-center justify-center text-white hover:bg-black/10 transition-colors font-black"
                onClick={() => handleUpdateCart(quantity + 1)}
              >
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
