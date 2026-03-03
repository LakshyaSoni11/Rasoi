import React, { useState } from "react";
import { IoLocation, IoReceiptSharp } from "react-icons/io5";
import { IoIosSearch, IoIosClose } from "react-icons/io";
import { FaShoppingCart, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const Nav = () => {
  const navigate = useNavigate();
  const { userData, currentCity, cartItems } = useSelector(
    (state) => state.user,
  );
  const { myShopData } = useSelector((state) => state.owner);

  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState(false);

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-[64px] flex items-center justify-center px-4 fixed top-0 z-50 bg-[#fff9f6] shadow-sm">
      {/* Inner Container (Centered Layout) */}
      <div className="w-full max-w-[1300px] flex items-center justify-between">
        {/* Logo */}
        <h1
          className="text-2xl font-bold text-[#ff4d2d] cursor-pointer"
          onClick={() => window.location.reload()}
        >
          Rasoi
        </h1>

        {/* ================= CENTER SECTION ================= */}

        {userData?.role === "user" && (
          <div
            className={`md:w-[60%] lg:w-[50%] h-[44px] bg-white shadow-md rounded-full items-center gap-[12px] hidden md:flex px-5 transition-all duration-300 ${
              !search
                ? "opacity-0 pointer-events-none scale-95"
                : "opacity-100 scale-100"
            }`}
          >
            <div className="flex items-center w-[30%] gap-[6px] border-r border-gray-200 pr-2">
              <IoLocation className="text-[#ff4d2d]" size={18} />
              <div className="truncate text-xs font-medium text-gray-600">
                {currentCity || "Select Location"}
              </div>
            </div>

            <div className="flex items-center w-[70%] gap-[8px]">
              <IoIosSearch className="text-[#ff4d2d]" size={20} />
              <input
                type="text"
                placeholder="Search for food, restaurants..."
                className="w-full outline-none text-xs bg-transparent"
              />
            </div>
          </div>
        )}

        {/* ================= RIGHT SECTION ================= */}

        <div className="flex items-center gap-4">
          {/* OWNER VIEW (CLEAN CENTERED DESIGN) */}
          {userData?.role === "owner" && (
            <div className="flex items-center gap-4">
              {myShopData && (
                <button
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff4d2d] text-white text-sm font-semibold shadow-md hover:bg-[#e64323] transition active:scale-95 cursor-pointer"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={14} />
                  Add Item
                </button>
              )}

              <div
                className="relative cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
                onClick={() => navigate("/my-orders")}
              >
                <IoReceiptSharp className="text-[#ff4d2d]" size={20} />
                <span className="font-medium text-xs text-gray-700">
                  Orders
                </span>
                <span className="absolute -top-1 -right-1 bg-[#ff4d2d] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {/* TODO: Count orders dynamically */}0
                </span>
              </div>
            </div>
          )}

          {/* USER VIEW */}
          {userData?.role === "user" && (
            <div className="flex items-center gap-4">
              <div
                className="cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition"
                onClick={() => setSearch((prev) => !prev)}
              >
                {search ? (
                  <IoIosClose className="text-[#ff4d2d]" size={24} />
                ) : (
                  <IoIosSearch className="text-[#ff4d2d]" size={22} />
                )}
              </div>

              <div
                className="relative cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition"
                onClick={() => navigate("/cart")}
              >
                <FaShoppingCart className="text-[#ff4d2d]" size={20} />
                <div className="absolute top-0 right-0 w-[16px] h-[16px] bg-[#ff4d2d] text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                  {cartItems.length}
                </div>
              </div>

              <button
                onClick={() => navigate("/my-orders")}
                className="hidden md:block px-3 py-1.5 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] text-xs font-semibold hover:bg-[#ff4d2d]/20 transition cursor-pointer"
              >
                My Orders
              </button>
            </div>
          )}

          {/* PROFILE */}
          <div className="relative">
            <div
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-gradient-to-tr from-[#ff4d2d] to-[#ff8c42] text-white shadow-md font-bold text-base cursor-pointer hover:scale-105 transition"
              onClick={() => {
                setShowDropdown((prev) => !prev);
                if (userData?.role === "user") setSearch(false);
              }}
            >
              {userData?.fullName?.slice(0, 1).toUpperCase()}
            </div>

            {showDropdown && (
              <div className="absolute top-[45px] right-0 w-[180px] bg-white shadow-xl rounded-xl p-3 flex flex-col gap-2 border animate-in fade-in slide-in-from-top-4 duration-200 z-50">
                <div className="font-bold truncate text-sm">
                  {userData?.fullName}
                  <div className="text-[10px] text-gray-500 capitalize">
                    {userData?.role}
                  </div>
                </div>

                <div
                  className="text-red-500 text-sm font-medium cursor-pointer hover:bg-red-50 p-2 rounded-lg transition"
                  onClick={handleLogout}
                >
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      {search && userData?.role === "user" && (
        <div className="fixed top-[64px] left-0 w-full bg-white p-3 shadow-lg md:hidden flex items-center gap-2 z-40">
          <IoIosSearch className="text-[#ff4d2d]" size={20} />
          <input
            type="text"
            placeholder="Search for food..."
            className="w-full outline-none text-sm"
            autoFocus
          />
          <IoIosClose
            className="text-gray-400"
            size={24}
            onClick={() => setSearch(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Nav;
