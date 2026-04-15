import React, { useState, useRef, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { setLocation } from "../redux/mapSlice";
import { clearCart } from "../redux/userSlice";
import {
  FaMapMarkerAlt,
  FaLocationArrow,
  FaArrowLeft,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";

import axios from "axios";
import { serverUrl } from "../App";
import FoodLoader from "../components/FoodLoader";

// Custom Map Pin that overrides the broken default leaflet pin icon in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper component to center map when location changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      const timeoutId = setTimeout(() => {
        if (map && !map._animating) {
          map.flyTo(center, zoom, {
            duration: 1.5,
            noMoveStart: true
          });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [center, zoom, map]);
  return null;
}

const CheckOut = () => {
  const {userData} = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.user);
  const { location, address } = useSelector((state) => state.map);

  // Form State
  const [flatNo, setFlatNo] = useState("");
  const [street, setStreet] = useState(address || "");
  const [paymentMethod, setPaymentMethod] = useState("online");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Map & Location State
  const initialLat = location?.lat || 28.7041;
  const initialLng = location?.lon || 77.1025;
  const [position, setPosition] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const markerRef = useRef(null);

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };
  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const taxes = calculateSubtotal() * 0.05;
  const grandTotal = calculateSubtotal() + deliveryFee + taxes;

  // If cart empty, kick out
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Reverse Geocode helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      //   console.log(response.data.display_name)
      if (response.data && response.data.display_name) {
        setStreet(response.data.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    }
  };

  // Handle Dragging Map Pin
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition({ lat: newPos.lat, lng: newPos.lng });
          dispatch(setLocation({ lat: newPos.lat, lon: newPos.lng }));
          reverseGeocode(newPos.lat, newPos.lng);
        }
      },
    }),
    [dispatch],
  );

  // Forward Geocode helper (Search)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      );
      if (response.data && response.data.length > 0) {
        const bestMatch = response.data[0];
        const newLat = parseFloat(bestMatch.lat);
        const newLng = parseFloat(bestMatch.lon);
        setPosition({ lat: newLat, lng: newLng });
        dispatch(setLocation({ lat: newLat, lon: newLng }));
        setStreet(bestMatch.display_name);
      } else {
        alert("Location not found. Try a different search term.");
      }
    } catch (error) {
      console.error("Geocoding search failed", error);
      alert("Error searching for location.");
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-Locate via Browser GPS
  const handleLocateMe = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setPosition({ lat: newLat, lng: newLng });
        dispatch(setLocation({ lat: newLat, lon: newLng }));
        reverseGeocode(newLat, newLng);
        setLoadingLocation(false);
      },
      (err) => {
        console.error(err);
        alert("Please enable location permissions in your browser.");
        setLoadingLocation(false);
      },
    );
  };

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      if (!flatNo || !street) {
        alert("Please fill your address details");
        return;
      }

      setIsPlacingOrder(true);

      if (paymentMethod === "online") {
        // 1. Create Razorpay order on backend
        const orderRes = await axios.post(
          `${serverUrl}/api/payment/create-order`,
          { amount: grandTotal },
          { withCredentials: true }
        );

        const { id: order_id, currency, amount } = orderRes.data;

        // 2. Configure Razorpay options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "", // Credentials left empty as requested
          amount: amount,
          currency: currency,
          name: "Rasoi Delivery",
          description: "Food Order Payment",
          order_id: order_id,
          handler: async (response) => {
            try {
              // 3. Verify payment on backend
              const verifyRes = await axios.post(
                `${serverUrl}/api/payment/verify-payment`,
                response,
                { withCredentials: true }
              );

              if (verifyRes.data.success) {
                // 4. If verified, place the final order in our DB
                await finalizeOrder("online", order_id, response.razorpay_payment_id);
              }
            } catch (err) {
              console.error("Payment verification failed", err);
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: userData?.fullName || "",
            email: userData?.email || "",
            contact: userData?.mobile || "",
          },
          theme: { color: "#ff4d2d" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsPlacingOrder(false);
      } else {
        // Cash on Delivery
        await finalizeOrder("cod");
      }
    } catch (error) {
      console.error("Order error", error);
      alert("Something went wrong while placing your order.");
      setIsPlacingOrder(false);
    }
  };

  const finalizeOrder = async (method, razorpayOrderId = "", razorpayPaymentId = "") => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod: method,
          razorpayOrderId,
          razorpayPaymentId,
          deliveryAddress: {
            street,
            flatNo,
            latitude: location.lat,
            longitude: location.lon,
          },
          cartItems,
          totalAmount: grandTotal,
        },
        { withCredentials: true }
      );

      if (result.status === 201) {
        navigate("/order-placed");
      }
    } catch (error) {
      console.error("Finalize Order error", error);
      alert("Failed to save order. If money was deducted, please contact support.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] pt-24 pb-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Transaction Loader Overlay */}
      {isPlacingOrder && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <FoodLoader />
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-[#ff4d2d]"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            Complete <span className="text-[#ff4d2d]">Checkout</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN: Map & Address Details */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Map Container Block */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                  <FaMapMarkerAlt className="text-[#ff4d2d]" />
                  <h2>Set Delivery Location</h2>
                </div>
                <button
                  onClick={handleLocateMe}
                  disabled={loadingLocation}
                  className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#ff4d2d] hover:border-orange-200 transition-all"
                >
                  <FaLocationArrow />
                  {loadingLocation ? "Locating..." : "Locate Me"}
                </button>
              </div>

              {/* Location Search Box */}
              <div className="p-4 border-b border-gray-100 bg-white">
                <form onSubmit={handleSearch} className="flex gap-2 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your location (e.g. Connaught Place, Delhi)..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-[#gray-800] hover:bg-gray-700 text-gray-800 border border-gray-300 font-bold py-2.5 px-6 rounded-xl text-sm transition-all whitespace-nowrap"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </button>
                </form>
              </div>

              <div className="h-[300px] sm:h-[400px] w-full bg-gray-100 relative z-0">
                <MapContainer
                  center={[position.lat, position.lng]}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <ChangeView center={[position.lat, position.lng]} zoom={14} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[position.lat, position.lng]}
                    draggable={true}
                    eventHandlers={eventHandlers}
                    ref={markerRef}
                    icon={customIcon}
                  >
                    <Popup>Drag me to your exact location!</Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Coordinates Status Bar */}
              <div className="bg-orange-50 p-2 text-center text-xs font-semibold text-[#ff4d2d] border-t border-orange-100">
                Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
              </div>
            </div>

            {/* Address Input Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Address Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Flat / House No.
                  </label>
                  <input
                    type="text"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    placeholder="Ex: Apt 4B, Building C"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Street & Landmark
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Main Street, Opp. Metro Station"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Payment Mode */}
          <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
            {/* Payment Selection Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Payment Method
              </h3>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow-sm" : "border-gray-200 hover:bg-gray-50"}`}
                  onClick={() => setPaymentMethod("online")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === "online" ? "border-[#ff4d2d]" : "border-gray-300"}`}
                  >
                    {paymentMethod === "online" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff4d2d]"></div>
                    )}
                  </div>
                  <FaCreditCard
                    className={`text-xl mr-3 ${paymentMethod === "online" ? "text-[#ff4d2d]" : "text-gray-400"}`}
                  />
                  <div>
                    <p
                      className={`font-bold ${paymentMethod === "online" ? "text-[#ff4d2d]" : "text-gray-800"}`}
                    >
                      Pay Online
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Credit/Debit, UPI, Wallets
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow-sm" : "border-gray-200 hover:bg-gray-50"}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === "cod" ? "border-[#ff4d2d]" : "border-gray-300"}`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff4d2d]"></div>
                    )}
                  </div>
                  <FaMoneyBillWave
                    className={`text-xl mr-3 ${paymentMethod === "cod" ? "text-green-600" : "text-gray-400"}`}
                  />
                  <div>
                    <p
                      className={`font-bold ${paymentMethod === "cod" ? "text-[#ff4d2d]" : "text-gray-800"}`}
                    >
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Pay safely at the door step
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Final Summary
              </h2>

              <div className="max-h-32 overflow-y-auto mb-4 border-b border-gray-100 pb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm font-medium text-gray-600 mb-2"
                  >
                    <span className="truncate pr-4">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">
                    ₹{calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Taxes & GST (5%)</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    To Pay
                  </span>
                  <span className="text-2xl font-black text-[#ff4d2d]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-[#ff4d2d] hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5 flex justify-center items-center gap-2"
              >
                Confirm & Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
