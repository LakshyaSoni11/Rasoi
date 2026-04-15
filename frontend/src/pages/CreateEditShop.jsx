import React from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { triggerRefresh } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { useState, useEffect } from "react";
import { serverUrl } from "../App";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Fix for default Leaflet icon inclusion in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} icon={customIcon} /> : null;
};

const CreateEditShop = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress, userData } = useSelector(
    (state) => state.user,
  );
  const [name, setName] = useState(myShopData?.name || "");
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || "");
  const [backendImage, setBackendImage] = useState(null);
  const [City, setCity] = useState(myShopData?.city || currentCity);
  const [State, setState] = useState(myShopData?.state || currentState);
  const [address, setAddress] = useState(myShopData?.address || currentAddress);
  const [location, setLocation] = useState(
    myShopData?.location?.coordinates
      ? [myShopData.location.coordinates[1], myShopData.location.coordinates[0]]
      : [userData?.location?.coordinates?.[1] || 12.9716, userData?.location?.coordinates?.[0] || 77.5946]
  );
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
      formData.append("city", City);
      formData.append("state", State);
      formData.append("address", address);
      if (location) {
        formData.append("latitude", location[0]);
        formData.append("longitude", location[1]);
      }
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true },
      );
      console.log(result.data);
      if (result.data?.shop) {
        dispatch(setMyShopData(result.data.shop));
        dispatch(triggerRefresh());
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

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
              Pin Shop Location (Click on Map)
            </label>
            <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker position={location} setPosition={setLocation} />
              </MapContainer>
            </div>
            <p className="text-[9px] text-gray-400 font-bold italic">
                * Note: This location is used to broadcast orders to nearby delivery partners.
            </p>
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
