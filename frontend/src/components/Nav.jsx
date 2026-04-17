import React, { useState } from "react";
import logoImg from "../assets/logo.png";
import { IoLocation, IoReceiptSharp } from "react-icons/io5";
import { IoIosSearch, IoIosClose } from "react-icons/io";
import { FaShoppingCart, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData, setSearchQuery } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineStorefront } from "react-icons/md";
import toast from "react-hot-toast";

const Nav = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { userData, currentCity, cartItems, myOrders } = useSelector(
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
      window.location.href = "/"; // Force full reload to clear all state
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className={`w-full h-[64px] flex items-center justify-center px-4 fixed top-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/80 backdrop-blur-md shadow-md border-b border-gray-100" : "bg-[#fff9f6]"
    }`}>
      {/* Inner Container (Centered Layout) */}
      <div className="w-full max-w-[1300px] flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.location.reload()}
          className="focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Refresh Homepage"
        >
          <img
            src={logoImg}
            alt="Rasoi Logo"
            className="h-[48px] sm:h-[60px] w-auto object-contain drop-shadow-sm"
          />
        </button>

        {/* ================= CENTER SECTION ================= */}

        {userData?.role !== "owner" && (
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
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
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
                  {userData?.role === "owner" ? (myOrders?.length || 0) : (cartItems?.length || 0)}
                </span>
              </div>
            </div>
          )}

          {/* USER VIEW */}
          {userData?.role !== "owner" && (
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
            <button
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-gradient-to-tr from-[#ff4d2d] to-[#ff8c42] text-white shadow-md font-bold text-base hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4d2d]"
              onClick={() => {
                setShowDropdown((prev) => !prev);
                if (userData?.role !== "owner") setSearch(false);
              }}
              aria-haspopup="true"
              aria-expanded={showDropdown}
              aria-label="User profile menu"
            >
              {userData?.fullName?.slice(0, 1).toUpperCase()}
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[45px] right-0 w-[200px] bg-white shadow-2xl rounded-2xl p-2 flex flex-col border border-gray-100 z-50 overflow-hidden origin-top-right"
                  role="menu"
                >
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <div className="font-bold truncate text-sm text-gray-800">
                    {userData?.fullName}
                  </div>
                  <div className="text-[10px] text-[#ff4d2d] font-black uppercase tracking-widest mt-0.5">
                    {userData?.role}
                  </div>
                </div>

                <button
                  className="flex items-center gap-3 w-full text-left text-gray-700 text-sm font-semibold hover:bg-orange-50 hover:text-[#ff4d2d] px-4 py-2.5 rounded-xl transition-all focus:outline-none focus:bg-orange-50"
                  onClick={() => {
                    navigate("/my-orders");
                    setShowDropdown(false);
                  }}
                  role="menuitem"
                >
                  <IoReceiptSharp size={18} />
                  My Orders
                </button>

                {userData?.role === "admin" && (
                  <button
                    className="flex items-center gap-3 w-full text-left text-gray-700 text-sm font-semibold hover:bg-orange-50 hover:text-[#ff4d2d] px-4 py-2.5 rounded-xl transition-all focus:outline-none focus:bg-orange-50 mt-1"
                    onClick={() => {
                      navigate("/admin");
                      setShowDropdown(false);
                    }}
                    role="menuitem"
                  >
                    <MdOutlineStorefront size={18} />
                    Admin Panel
                  </button>
                )}

                <button
                  className="flex items-center gap-3 w-full text-left text-red-500 text-sm font-semibold hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all mt-1 focus:outline-none focus:bg-red-50"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Log Out
                </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      {search && userData?.role !== "owner" && (
        <div className="fixed top-[64px] left-0 w-full bg-white p-3 shadow-lg md:hidden flex items-center gap-2 z-40">
          <IoIosSearch className="text-[#ff4d2d]" size={20} />
          <input
            type="text"
            placeholder="Search for food..."
            className="w-full outline-none text-sm"
            autoFocus
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
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
