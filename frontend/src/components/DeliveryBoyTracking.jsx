import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IoMdPin, IoMdCall, IoMdTime, IoMdBicycle, IoMdHome } from "react-icons/io";
import { MdOutlineStorefront } from "react-icons/md";

import scooterImg from '../assets/scooter.png';
import homeImg from '../assets/home.png';
import shopImg from '../assets/shop.png';

// Custom Marker Icons using provided assets
const boyIcon = new L.Icon({
  iconUrl: scooterImg,
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const shopIcon = new L.Icon({
  iconUrl: shopImg,
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const customerIcon = new L.Icon({
  iconUrl: homeImg,
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center && center[0] && center[1]) {
      // Small timeout to ensure map is ready and avoid race conditions during HMR
      const timeoutId = setTimeout(() => {
        if (map && !map._animating) { 
          map.flyTo(center, zoom, {
            duration: 1.5,
            easeLinearity: 0.25,
            noMoveStart: true
          });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [center, zoom, map]);
  return null;
};

const DeliveryBoyTracking = ({ data }) => {
  if (!data) return null;

  const { deliveryBoyLocation, customerLocation, shopLocation, distance, shopOrder, deliveryAddress } = data;

  // Center of the map (Delivery boy location or fallback)
  const center = [
    deliveryBoyLocation?.lat || 12.9716,
    deliveryBoyLocation?.lon || 77.5946
  ];

  const hasShopLocation = shopLocation?.lat && shopLocation?.lon;
  const hasCustomerLocation = customerLocation?.lat && customerLocation?.lon;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Upper Map Section */}
      <div className="h-[400px] w-full relative z-0">
        <MapContainer 
          center={center} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <ChangeView center={center} zoom={15} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Delivery Boy Marker */}
          {deliveryBoyLocation?.lat && (
            <Marker position={[deliveryBoyLocation.lat, deliveryBoyLocation.lon]} icon={boyIcon}>
              <Popup className="font-bold">You are here</Popup>
            </Marker>
          )}

          {/* Shop Marker */}
          {hasShopLocation && (
            <Marker position={[shopLocation.lat, shopLocation.lon]} icon={shopIcon}>
              <Popup className="font-bold">Restaurant: {shopOrder?.shop?.name || "Pickup point"}</Popup>
            </Marker>
          )}

          {/* Customer Marker */}
          {hasCustomerLocation && (
            <Marker position={[customerLocation.lat, customerLocation.lon]} icon={customerIcon}>
              <Popup className="font-bold">Customer Drop-off</Popup>
            </Marker>
          )}

          {/* Connection Lines */}
          {deliveryBoyLocation?.lat && hasShopLocation && (
             <Polyline 
              positions={[[deliveryBoyLocation.lat, deliveryBoyLocation.lon], [shopLocation.lat, shopLocation.lon]]} 
              color="#ff4d2d" 
              dashArray="10, 10" 
              weight={3}
            />
          )}
          {hasShopLocation && hasCustomerLocation && (
             <Polyline 
              positions={[[shopLocation.lat, shopLocation.lon], [customerLocation.lat, customerLocation.lon]]} 
              color="#4f46e5" 
              weight={3}
            />
          )}
        </MapContainer>

        {/* Floating Distance Badge */}
        <div className="absolute top-6 right-6 z-[1000] bg-black/80 backdrop-blur-md text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/20">
          <IoMdTime className="text-[#ff4d2d] animate-pulse" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Estimated Distance</p>
            <p className="text-sm font-black">{(distance * 111).toFixed(1)} km to destination</p>
          </div>
        </div>
      </div>

      {/* Info Panel Section */}
      <div className="p-8 sm:p-10">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Order Details */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
              Task In Progress
              <span className="px-3 py-1 bg-orange-100 text-[#ff4d2d] text-xs font-black rounded-full uppercase tracking-tighter animate-pulse">
                Live Tracking
              </span>
            </h3>

            {!hasShopLocation && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6">
                    <p className="text-red-600 text-sm font-bold flex items-center gap-2">
                        ⚠️ Restaurant coordinates are missing. Please follow the address below.
                    </p>
                </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Restaurant Info */}
              <div className="space-y-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d2d]">
                  <MdOutlineStorefront size={16} /> Restaurant
                </div>
                <div>
                  <h4 className="font-black text-gray-800 text-lg mb-1">{shopOrder?.shop?.name || "Pickup Point"}</h4>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed italic truncate">
                    {shopOrder?.shop?.address || "Address not specified"}
                  </p>
                </div>
                {shopOrder?.shop?.mobile && (
                  <a 
                    href={`tel:${shopOrder.shop.mobile}`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all shadow-md active:scale-95"
                  >
                    <IoMdCall /> {shopOrder.shop.mobile}
                  </a>
                )}
              </div>

              {/* Delivery Partner Info (Visible if assigned) */}
              {data.assignedTo && (
                <div className="space-y-4 p-5 bg-orange-50 rounded-3xl border border-orange-100 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d2d]">
                    <IoMdBicycle size={16} /> Delivery Partner
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800 text-lg mb-1">{data.assignedTo.fullName}</h4>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter font-black">
                      On Scooter
                    </p>
                  </div>
                  {data.assignedTo.mobile && (
                    <a 
                      href={`tel:${data.assignedTo.mobile}`}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ff4d2d] text-white rounded-xl text-sm font-black hover:bg-orange-600 transition-all shadow-md active:scale-95"
                    >
                      <IoMdCall /> {data.assignedTo.mobile}
                    </a>
                  )}
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-4 p-5 bg-indigo-50 rounded-3xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#4f46e5]">
                  <IoMdHome size={16} /> Delivery Site
                </div>
                <div>
                  <h4 className="font-black text-gray-800 text-lg mb-1 truncate">
                    {deliveryAddress?.flatNo ? `${deliveryAddress.flatNo}, ` : ""}
                    {deliveryAddress?.street}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    User: <span className="text-gray-800 font-bold">{data.user?.fullName || "Valued Customer"}</span>
                  </p>
                </div>
                {data.user?.mobile && (
                  <a 
                    href={`tel:${data.user.mobile}`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4f46e5] text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                  >
                    <IoMdCall /> {data.user.mobile}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-6">Order Timeline</h4>
            <div className="space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-[#ff4d2d] flex items-center justify-center text-white z-10 shadow-lg shadow-orange-200">
                    <IoMdBicycle size={12} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">Task Accepted</p>
                    <p className="text-[10px] font-bold text-gray-400">Head to the restaurant</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 z-10">
                    <MdOutlineStorefront size={12} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400">At Restaurant</p>
                    <p className="text-[10px] font-bold text-gray-300">Awaiting Pickup</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 z-10">
                    <IoMdTime size={12} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400">Out for Delivery</p>
                    <p className="text-[10px] font-bold text-gray-300">On your way to customer</p>
                  </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyTracking;