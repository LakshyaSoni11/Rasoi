import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { triggerRefresh } from "../redux/userSlice";
import { setLocation } from "../redux/mapSlice";
import axios from "axios";
import { serverUrl } from "../App";
import toast from "react-hot-toast";

const useCheckout = () => {
  const { userData, cartItems } = useSelector((state) => state.user);
  const { location, address } = useSelector((state) => state.map);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [flatNo, setFlatNo] = useState("");
  const [street, setStreet] = useState(address || "");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const initialLat = location?.lat || 28.7041;
  const initialLng = location?.lon || 77.1025;
  const [position, setPosition] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const markerRef = useRef(null);

  // Totals calculation
  const calculateSubtotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const taxes = calculateSubtotal() * 0.05;
  const grandTotal = calculateSubtotal() + deliveryFee + taxes;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (response.data && response.data.display_name) {
        setStreet(response.data.display_name);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_error) {
      toast.error("Failed to fetch address for dropped pin.");
    }
  };

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
    [dispatch]
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      if (response.data && response.data.length > 0) {
        const bestMatch = response.data[0];
        const newLat = parseFloat(bestMatch.lat);
        const newLng = parseFloat(bestMatch.lon);
        setPosition({ lat: newLat, lng: newLng });
        dispatch(setLocation({ lat: newLat, lon: newLng }));
        setStreet(bestMatch.display_name);
        toast.success("Location found!", {id: "search-loc-success"});
      } else {
        toast.error("Location not found. Try a different search term.");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_error) {
      toast.error("Error searching for location.");
    } finally {
      setIsSearching(false);
    }
  };

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
        toast.success("Location acquired successfully!");
      },
      // eslint-disable-next-line no-unused-vars
      (_err) => {
        toast.error("Please enable location permissions in your browser.");
        setLoadingLocation(false);
      }
    );
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
            latitude: position.lat,
            longitude: position.lng,
          },
          cartItems,
          totalAmount: grandTotal,
        },
        { withCredentials: true }
      );

      if (result.status === 201) {
        dispatch(triggerRefresh());
        navigate("/order-placed");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_error) {
      toast.error("Failed to save order. If money was deducted, please contact support.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!flatNo || !street) {
        toast.error("Please fill your full address details");
        return;
      }

      setIsPlacingOrder(true);

      if (paymentMethod === "online") {
        const orderRes = await axios.post(
          `${serverUrl}/api/payment/create-order`,
          { amount: grandTotal },
          { withCredentials: true }
        );

        const { id: order_id, currency, amount } = orderRes.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
          amount: amount,
          currency: currency,
          name: "Rasoi Delivery",
          description: "Food Order Payment",
          order_id: order_id,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(
                `${serverUrl}/api/payment/verify-payment`,
                response,
                { withCredentials: true }
              );

              if (verifyRes.data.success) {
                await finalizeOrder("online", order_id, response.razorpay_payment_id);
              }
            // eslint-disable-next-line no-unused-vars
            } catch (_err) {
              toast.error("Payment verification failed. Please contact support.");
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
        await finalizeOrder("cod");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_error) {
      toast.error("Server Error: Something went wrong while placing your order.");
      setIsPlacingOrder(false);
    }
  };

  return {
    flatNo, setFlatNo,
    street, setStreet,
    paymentMethod, setPaymentMethod,
    searchQuery, setSearchQuery,
    isSearching,
    isPlacingOrder,
    loadingLocation,
    position,
    markerRef,
    cartItems,
    calculateSubtotal,
    deliveryFee,
    taxes,
    grandTotal,
    handleSearch,
    handleLocateMe,
    handlePlaceOrder,
    eventHandlers
  };
};

export default useCheckout;
