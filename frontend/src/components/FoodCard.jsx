import React, { useState } from "react";
import {
  FaLeaf,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaStar,
} from "react-icons/fa";
import { GiChickenLeg } from "react-icons/gi";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice.js";

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
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
    <div className="w-[160px] sm:w-[200px] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group">
      <div className="relative w-full h-[120px] sm:h-[140px] flex justify-center items-center bg-gray-50 overflow-hidden">
        {data.foodType === "Veg" ? (
          <span className="absolute top-2 left-2 z-10 bg-green-500 text-white px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-1 font-medium shadow-sm">
            <FaLeaf size={10} />
            Veg
          </span>
        ) : (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-1 font-medium shadow-sm">
            <GiChickenLeg size={12} />
            Non-Veg
          </span>
        )}
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 flex flex-col p-3">
        <h1 className="font-bold capitalize text-gray-800 text-sm sm:text-base line-clamp-1">
          {data.name}
        </h1>
        <div className="flex items-center gap-0.5 mt-0.5">
          <div className="flex items-center text-[10px] sm:text-xs">
            {renderStars(data.rating.average)}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
            ({data.rating.count})
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <span className="text-sm sm:text-base font-extrabold text-[#ff4d2d]">
            ₹{data.price}
          </span>

          {quantity === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(1);
              }}
              className="bg-orange-50 hover:bg-orange-100 text-[#ff4d2d] border border-orange-200 px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              ADD
            </button>
          ) : (
            <div
              className="flex items-center bg-white border border-[#ff4d2d] rounded-lg overflow-hidden shadow-sm h-7"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-[#ff4d2d] transition-colors font-bold"
                onClick={() => setQuantity((prev) => prev - 1)}
              >
                <FaMinus size={10} />
              </button>
              <span className="w-6 h-full flex items-center justify-center bg-white text-[#ff4d2d] font-bold text-xs">
                {quantity}
              </span>
              <button
                className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-[#ff4d2d] transition-colors font-bold"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                <FaPlus size={10} />
              </button>
              <button
                className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-[#ff4d2d] transition-colors font-bold border-l border-[#ff4d2d]"
                onClick={() =>
                  dispatch(
                    addToCart({
                      id: data._id,
                      name: data.name,
                      price: data.price,
                      image: data.image,
                      shop: data.shop,
                      quantity: quantity,
                    }),
                  )
                }
              >
                <FaShoppingCart size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
