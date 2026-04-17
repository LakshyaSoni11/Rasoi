import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { IoMdPin } from "react-icons/io";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import OwnerItemCard from "./OwnerItemCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Fix for default Leaflet icon inclusion in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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

          {/* Location Management Section */}
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <IoMdPin className="text-[#ff4d2d]" size={22} />
                Store Location
              </h3>
              <button 
                onClick={() => navigate('/create-edit-shop')}
                className="text-xs font-bold text-[#ff4d2d] hover:underline"
              >
                Change Address
              </button>
            </div>

            {myShopData.location?.coordinates ? (
              <div className="space-y-4">
                <div className="h-40 w-full rounded-2xl overflow-hidden border border-gray-100 grayscale hover:grayscale-0 transition-all duration-500">
                    <MapContainer 
                        center={[myShopData.location.coordinates[1], myShopData.location.coordinates[0]]} 
                        zoom={15} 
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                        dragging={false}
                        zoomControl={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[myShopData.location.coordinates[1], myShopData.location.coordinates[0]]} icon={customIcon} />
                    </MapContainer>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                    Location is set and visible to delivery partners
                </p>
              </div>
            ) : (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#ff4d2d] shadow-sm">
                        <IoMdPin size={24} className="animate-bounce" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">Pin your location</h4>
                        <p className="text-xs text-gray-500 mt-1">Delivery boys cannot find your shop unless you set your exact location on the map.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/create-edit-shop')}
                        className="mt-2 px-6 py-2 bg-[#ff4d2d] text-white text-xs font-black uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                        Set Exact Location
                    </button>
                </div>
            )}
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

          {/* New Analytics Section */}
          {myShopData.items.length > 0 && (
            <div className="w-full max-w-3xl mt-8 mb-12">
               <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                 Menu Analytics
               </h3>
               <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Item Popularity (Reviews)</h4>
                    <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={myShopData.items}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} width={1} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                           <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px'}} />
                           <Bar dataKey="reviews" fill="#ff4d2d" radius={[4, 4, 0, 0]} />
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Average Ratings</h4>
                    <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={myShopData.items}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} width={1} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} domain={[0, 5]} />
                           <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px'}} />
                           <Bar dataKey="rating.average" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
