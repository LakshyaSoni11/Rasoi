import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import Nav from "../components/Nav";
import FoodCard from "../components/FoodCard";
import FoodLoader from "../components/FoodLoader";
import { IoMdCall, IoMdPin } from "react-icons/io";
import { FaChevronLeft } from "react-icons/fa";

const ShopPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/shop/get-by-id/${shopId}`, {
          withCredentials: true,
        });
        setShop(res.data.shop);
      } catch (error) {
        console.error("Failed to fetch shop details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopDetails();
  }, [shopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex flex-col items-center justify-center">
        <FoodLoader />
        <p className="mt-4 text-gray-500 font-bold animate-pulse text-lg">Loading Shop Details...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black text-gray-800">Shop Not Found</h2>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-[#ff4d2d] text-white rounded-xl font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  const filteredItems = shop.items?.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] pb-20">
      <Nav />
      {/* Hero Header */}
      <div className="relative w-full h-[250px] sm:h-[350px] mt-[64px] overflow-hidden">
        <img 
          src={shop.image} 
          alt={shop.name} 
          className="w-full h-full object-cover brightness-75"
        />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg text-gray-800 hover:bg-white transition-all active:scale-90"
        >
          <FaChevronLeft size={20} />
        </button>
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12 bg-linear-to-t from-black/80 to-transparent text-white">
          <div className="max-w-6xl mx-auto w-full">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 drop-shadow-lg">{shop.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base font-bold opacity-90">
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                <IoMdPin className="text-[#ff4d2d]" /> {shop.city}
              </span>
              <a href={`tel:${shop.owner?.mobile}`} className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md hover:bg-white/30 transition">
                <IoMdCall className="text-[#ff4d2d]" /> {shop.owner?.mobile}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Info Section */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-orange-100/50 border border-orange-50 mb-12 flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#ff4d2d] rounded-full"></span>
              Restaurant Info
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-6">
              Experience the best {shop.category} dishes in {shop.city}. We focus on quality, taste, and super-fast delivery.
            </p>
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                    <IoMdPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#ff4d2d] mb-1">Visit Us At</p>
                    <p className="text-sm font-black text-gray-800">{shop.address}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <IoMdCall size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Contact Details</p>
                    <p className="text-sm font-black text-gray-800">{shop.owner?.fullName} ({shop.owner?.email})</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="w-full md:w-[400px] h-[250px] bg-gray-100 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
             <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src={`https://maps.google.com/maps?q=${shop.location?.coordinates[1]},${shop.location?.coordinates[0]}&z=15&output=embed`}
                title="Shop Location"
              ></iframe>
          </div>
        </div>

        {/* Menu/Items Section */}
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Recommended <span className="text-[#ff4d2d]">Dishes</span></h2>
          <div className="w-full sm:w-[300px] bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3">
             <input 
                type="text" 
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none text-sm font-medium"
             />
          </div>
        </div>

        {filteredItems?.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 sm:grid-cols-3 gap-4 sm:gap-8 justify-items-center">
             {filteredItems.map((item, idx) => (
               <FoodCard key={item._id || idx} data={item} />
             ))}
          </div>
        ) : (
          <div className="w-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center px-6">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <IoMdCall size={40} />
             </div>
             <p className="text-xl font-bold text-gray-400">No items found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
