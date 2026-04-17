import React from "react";
import { CiTrash } from "react-icons/ci";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${serverUrl}/api/item/delete-item/${data._id}`,
        { withCredentials: true },
      );
    //   navigate(-1);
      dispatch(setMyShopData(res.data.shop));
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete item.");
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await axios.put(
        `${serverUrl}/api/item/toggle-availability/${data._id}`,
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success(res.data.message);
        // We'll rely on the triggerRefresh or individual state update if needed, 
        // but for now, we'll assume the shop data is refreshed overall.
        // If myShopData is available in the parent, it will re-render.
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle availability.");
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-100 w-full max-w-2xl"
    >
      {/* Image Section */}
      <div className="w-32 sm:w-40 shrink-0 bg-gray-50 relative">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover aspect-square sm:aspect-auto"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-lg font-bold text-gray-800 capitalize line-clamp-1">
            {data.name}
          </h2>
          <div className="text-lg font-bold text-[#ff4d2d] shrink-0 ml-2">
            ₹{data.price}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-1 sm:mt-2 mb-3">
          <span className="bg-[#ff4d2d]/10 text-[#ff4d2d] px-2.5 py-1 rounded-md text-xs font-semibold capitalize">
            {data.category}
          </span>
          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold capitalize">
            {data.foodType}
          </span>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleToggleAvailability}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all cursor-pointer ${
              data.isAvailable 
                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {data.isAvailable ? "● Available" : "○ Out of Stock"}
          </button>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-end gap-2 sm:gap-3">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors border border-gray-200 cursor-pointer"
            onClick={() => navigate(`/edit-item/${data._id}`)}
          >
            <MdEdit size={16} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors border border-red-100 cursor-pointer"
            onClick={handleDelete}
          >
            <CiTrash size={18} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OwnerItemCard;
