import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import OwnerItemCard from "./OwnerItemCard";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);

  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />
      {!myShopData && (
        <div className="flex items-center justify-center p-4 sm:p-5 md:p-6 pb-20">
          <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <GiForkKnifeSpoon className="text-[#ff4d2d]" size={48} />
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 mt-2">
                Add your Restaurant
              </h1>
              <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                Join our food delivery platform and reach thousands of customers
                everyday
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5 py-2 rounded-full text-sm font-medium shadow-md hover:bg-orange-600 transition-colors duration-200 active:scale-95 cursor-pointer"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
      {/* shop details */}
      {myShopData && (
        <div className="w-full flex flex-col items-center gap-4 px-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl flex items-center gap-2 mt-6 text-center capitalize">
            <GiForkKnifeSpoon className="text-[#ff4d2d]" size={32} />
            Welcome to {myShopData.name}{" "}
          </h1>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-2xl relative">
            <div
              className="absolute top-3 right-3 p-1.5 rounded-full cursor-pointer text-white bg-[#ff4d2d] hover:bg-orange-600 transition-colors duration-200 active:scale-95 z-10"
              onClick={() => navigate("/create-edit-shop")}
            >
              <MdEdit size={16} />
            </div>
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-40 object-cover sm:h-56"
            />
            <div className="p-4 sm:p-5">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl flex items-center gap-2 text-center capitalize">
                {myShopData.name}{" "}
              </h2>
              <p className="text-gray-500 mb-1 text-xs sm:text-sm">
                {myShopData.city}, {myShopData.state}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                {myShopData.address}
              </p>
            </div>
          </div>
          {/* menu items */}
          {myShopData.items.length === 0 && (
            <div className="flex items-center justify-center p-4 pt-2">
              <div className="w-full max-w-sm bg-white shadow-md rounded-xl p-6 border border-gray-100/50">
                <div className="flex flex-col items-center text-center">
                  <GiForkKnifeSpoon className="text-[#ff4d2d]" size={40} />
                  <h2 className="text-lg font-bold text-gray-800 mb-1 mt-2">
                    No items added yet
                  </h2>
                  <p className="text-gray-500 mb-4 text-xs">
                    Your menu is currently empty. Start adding delicious dishes
                    to attract customers.
                  </p>
                  <button className="bg-[#ff4d2d] text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-sm hover:bg-orange-600 transition-colors duration-200 active:scale-95 cursor-pointer" onClick={()=>navigate('/add-item')}>
                    Add Your food Items
                  </button>
                </div>
              </div>
            </div>
          )}
          {myShopData.items.length > 0 && (
            <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
              {myShopData.items.map((item) => (
                <OwnerItemCard key={item._id} data={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
