import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
import useUpdateLocation from "../hooks/useUpdateLocation";
import { IoMdRefresh, IoMdCall, IoMdPin, IoMdCheckmarkCircle, IoMdListBox } from "react-icons/io";
import { MdOutlineFastfood } from "react-icons/md";
import "leaflet/dist/leaflet.css";
import DeliveryBoyTracking from "./DeliveryBoyTracking";

const DeliveryBoy = () => {
  useUpdateLocation(); // Keep location updated
  const { userData } = useSelector((state) => state.user);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    const getCurrentOrder = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true });
      setCurrentTask(res.data);
      console.log(res.data);
    } catch (error) {
      console.error("Failed to fetch current order", error);
      setCurrentTask(null);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/order/delivery-boy-orders`, { withCredentials: true });
      setAssignments(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch assignments", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
    getCurrentOrder();
    // Auto-poll for new broadcasts every 5 seconds
    const interval = setInterval(fetchAssignments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (assignmentId) => {
    if (processing) return;
    try {
      setProcessing(true);
      const res = await axios.post(`${serverUrl}/api/order/accept-order/${assignmentId}`, {}, { withCredentials: true });
      alert(res.data.message);
      await fetchAssignments();
      await getCurrentOrder();
    } catch (error) {
      console.error("Accept error:", error);
      alert(error.response?.data?.message || "This order might have already been accepted by another partner.");
      await fetchAssignments();
    } finally {
      setProcessing(false);
    }
  };

  const handleSendOtp = async (assignmentId) => {
    if (processing) return;
    try {
      setProcessing(true);
      const res = await axios.post(`${serverUrl}/api/order/send-otp/${assignmentId}`, {}, { withCredentials: true });
      alert(res.data.message);
      setSelectedAssignmentId(assignmentId);
      setShowOtpBox(true);
    } catch (error) {
      console.error("Send OTP error:", error);
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (processing || !otp) return;
    try {
      setProcessing(true);
      const res = await axios.post(`${serverUrl}/api/order/verify-otp/${selectedAssignmentId}`, { otp }, { withCredentials: true });
      alert(res.data.message);
      setShowOtpBox(false);
      setOtp("");
      setSelectedAssignmentId(null);
      await fetchAssignments();
      await getCurrentOrder();
    } catch (error) {
      console.error("Verify OTP error:", error);
      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (assignmentId) => {
    if (processing) return;
    try {
      setProcessing(true);
      const res = await axios.post(`${serverUrl}/api/order/complete-delivery/${assignmentId}`, {}, { withCredentials: true });
      alert(res.data.message);
      await fetchAssignments();
      await getCurrentOrder();
    } catch (error) {
      console.error("Complete error:", error);
      alert(error.response?.data?.message || "Failed to complete delivery");
      await fetchAssignments();
    } finally {
      setProcessing(false);
    }
  };

  const broadcasts = assignments.filter(a => a.status === "broadcasted");
  const activeAssignments = assignments.filter(a => a.status === "assigned");

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold animate-pulse">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight mb-1">
            Welcome Back,<span className="text-[#ff4d2d] text-4xl"> {userData?.fullName}</span>
          </h1>
          <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Online & Ready for Deliveries
          </p>
        </div>
        <button 
          onClick={fetchAssignments}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all active:scale-95"
        >
          <IoMdRefresh size={24} />
        </button>
      </div>

      {/* Active Assignments Section */}
      <div className="mb-12">
        <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-3">
          <IoMdCheckmarkCircle className="text-green-500" />
          Active Tasks ({activeAssignments.length})
        </h2>
        
        {activeAssignments.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
            <p className="text-gray-400 font-bold">No active tasks. Check available orders below!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {!showOtpBox ? (
              <>
                {activeAssignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment._id} 
                    assignment={assignment} 
                    onAction={() => handleSendOtp(assignment._id)}
                    actionLabel="Mark as Delivered"
                    variant="active"
                    processing={processing}
                  />
                ))}
              </>
            ) : (
              <div className="bg-white rounded-[2rem] border-2 border-[#ff4d2d] shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-orange-100 text-[#ff4d2d] rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoMdCheckmarkCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Verify Delivery</h3>
                <p className="text-gray-500 font-bold mb-8">
                  Enter the 6-digit OTP sent to <br/>
                  <span className="text-gray-900">{currentTask?.user?.fullName || "the customer"}</span>
                </p>
                
                <div className="max-w-xs mx-auto mb-8">
                  <input 
                    type="text" 
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="0 0 0 0 0 0"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 text-center text-3xl font-black tracking-[0.5em] text-[#ff4d2d] focus:border-[#ff4d2d] focus:bg-white outline-none transition-all placeholder:text-gray-200"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleVerifyOtp}
                    disabled={processing || otp.length !== 6}
                    className="w-full py-5 bg-[#ff4d2d] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none transition-all"
                  >
                    {processing ? "Verifying..." : "Confirm Delivery"}
                  </button>
                  <button 
                    onClick={() => { setShowOtpBox(false); setOtp(""); }}
                    disabled={processing}
                    className="w-full py-4 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <DeliveryBoyTracking data ={currentTask}/>
      </div>

      {/* Broadcasts Section */}
      <div>
        <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-3">
          <IoMdListBox className="text-[#ff4d2d]" />
          Nearby Opportunities ({broadcasts.length})
        </h2>
        
        {broadcasts.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
            <p className="text-gray-400 font-bold">Waiting for new orders in your area...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {broadcasts.map((assignment) => (
              <AssignmentCard 
                key={assignment._id} 
                assignment={assignment} 
                onAction={() => handleAccept(assignment._id)}
                actionLabel="Accept Assignment"
                variant="broadcast"
                processing={processing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AssignmentCard = ({ assignment, onAction, actionLabel, variant, processing }) => {
  console.log("assignment",assignment)
  const order = assignment.Order;
  const shop = assignment.shop;
  console.log(shop)
  const isBroadcast = variant === "broadcast";

  // Finding the specific shop order items from the main order object
  // Since assignments are per-shop-order
  const shopOrder = order?.shopOrder?.find(so => {
    const soShopId = so.shop?._id ? so.shop._id.toString() : so.shop?.toString();
    const assShopId = shop?._id ? shop._id.toString() : shop?.toString();
    return soShopId === assShopId;
  });

  if (!order || !shopOrder) return null;

  const items = shopOrder?.shopOrderItems || [];

  return (
    <div className={`bg-white rounded-[2rem] border ${isBroadcast ? 'border-orange-100' : 'border-green-100'} shadow-xl overflow-hidden group transition-all hover:translate-y-[-4px]`}>
      <div className="p-6 sm:p-8">
        {/* Card Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isBroadcast ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
              <MdOutlineFastfood />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Order #{order?._id?.slice(-6)}
              </p>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">
                {shop?.name || "Loading..."}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Pay</p>
            <p className="text-xl font-black text-gray-900">₹{shopOrder?.subTotal?.toFixed(2)}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {/* Pickup */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Pickup Location</p>
            </div>
            <p className="text-sm font-bold text-gray-800 mb-2">{shop?.address}, {shop?.city}</p>
            <a href={`tel:${shop?.mobile}`} className="flex items-center gap-2 text-xs font-black text-[#ff4d2d] hover:underline">
               <IoMdCall /> Call Restaurant
            </a>
          </div>

          {/* Delivery */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Drop-off Location</p>
            </div>
            <p className="text-sm font-bold text-gray-800 mb-2">
              {order?.deliveryAddress?.flatNo ? `${order.deliveryAddress.flatNo}, ` : ""}
              {order?.deliveryAddress?.street}
            </p>
            <a href={`tel:${order?.user?.mobile}`} className="flex items-center gap-2 text-xs font-black text-blue-600 hover:underline">
               <IoMdCall /> Call {order?.user?.fullName || "Customer"}
            </a>
          </div>
        </div>

        {/* Items Subsection */}
        <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Order Items</p>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                        <span className="text-xs font-black text-[#ff4d2d]">{item.quantity}x</span>
                        <span className="text-xs font-bold text-gray-700">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onAction}
          disabled={processing}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg active:scale-[0.98] ${
            processing ? 'bg-gray-400 cursor-not-allowed' :
            isBroadcast 
            ? 'bg-[#ff4d2d] text-white hover:bg-orange-600 shadow-orange-200' 
            : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
          }`}
        >
          {processing ? 'Processing...' : actionLabel}
        </button>
      </div>
    </div>
  );
};

export default DeliveryBoy;