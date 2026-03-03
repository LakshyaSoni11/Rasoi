import React from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { useNavigate } from "react-router-dom";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { useState } from "react";
import { serverUrl } from "../App";
import axios from "axios";
const CreateEditShop = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user,
  );
  const [name, setName] = useState(myShopData?.name || "");
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || "");
  const [backendImage, setBackendImage] = useState(null);
  const [City, setCity] = useState(myShopData?.city || currentCity);
  const [State, setState] = useState(myShopData?.state || currentState);
  const [address, setAddress] = useState(myShopData?.address || currentAddress);
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontendImage(URL.createObjectURL(file));
      setBackendImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", backendImage);
      formData.append("city", City);
      formData.append("state", State);
      formData.append("address", address);
      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true },
      );
      console.log(result.data);
      if (result.data?.shop) {
        dispatch(setMyShopData(result.data.shop));
        navigate(-1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col min-h-screen p-4 bg-linear-to-br from-orange-50 relative to-white">
      <div
        className="absolute top-4 left-4 cursor-pointer z-10 text-[#ff4d2d] hover:scale-110 transition-transform"
        onClick={() => navigate(-1)}
      >
        <IoMdArrowRoundBack size={24} />
      </div>
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 border border-orange-100 mt-12 mb-8">
        <div className="flex flex-col items-center mb-5">
          <div
            className="bg-orange-100 p-3
           rounded-full mb-3"
          >
            <GiForkKnifeSpoon className="text-[#ff4d2d] w-12 h-12" />
          </div>
          <div className="font-extrabold text-xl">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              placeholder="Enter shop name"
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Shop Image
            </label>
            <input
              type="file"
              placeholder="Upload shop image"
              accept="image/*"
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              onChange={handleImageChange}
            />
            {frontendImage && (
              <img
                src={frontendImage}
                alt="shop"
                className="w-full h-40 object-cover rounded-lg border border-gray-300 mt-3"
              />
            )}
          </div>
          {/* state and city */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="Enter city"
                className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                value={City}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="Enter state"
                className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                value={State}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Shop Address
            </label>
            <input
              type="text"
              placeholder="Enter shop address"
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <button className="w-full bg-[#ff4d2d] text-white px-5 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200 active:scale-95 cursor-pointer text-sm">
            {myShopData ? "Save Changes" : "Add Shop"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
