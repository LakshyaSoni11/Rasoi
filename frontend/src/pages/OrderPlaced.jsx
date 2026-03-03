import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHome, FaListAlt } from "react-icons/fa";

const OrderPlaced = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-orange-100 max-w-md w-full text-center flex flex-col items-center transform transition-all duration-500 hover:scale-[1.02]">
        <div className="text-green-500 mb-6 animate-bounce drop-shadow-md">
          <FaCheckCircle size={80} className="mx-auto block" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">
          Order Confirmed!
        </h1>

        <p className="text-gray-500 mb-8 text-sm md:text-base leading-relaxed px-2 font-medium">
          Thank you for choosing us. Your delicious food is being prepared by
          the restaurant and will be out for delivery shortly.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 bg-[#ff4d2d] hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md active:scale-95 cursor-pointer"
          >
            <FaHome size={18} />
            Back to Home
          </button>

          <button
            onClick={() => navigate("/my-orders")}
            className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-[#ff4d2d] border border-orange-200 font-bold py-3.5 px-6 rounded-xl transition-colors active:scale-95 cursor-pointer"
          >
            <FaListAlt size={18} />
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;
