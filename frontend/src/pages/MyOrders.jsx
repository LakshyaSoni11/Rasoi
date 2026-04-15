import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdArrowRoundBack, IoMdPin } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyOrders, triggerRefresh } from "../redux/userSlice";
import { useState } from "react";

const getStatusColor = (status) => {
  
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "out of delivery":
      return "bg-purple-100 text-purple-700";
    case "preparing":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const MyOrders = () => {
  const { userData, myOrders } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [availableBoys, setAvailableBoys] = useState([]);

  const handleUpdateStatus = async (orderId, shopId, newStatus) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status: newStatus },
        { withCredentials: true },
      );
      if (res.status === 200) {
        if (res.data.message && res.data.message !== "Status updated successfully" || res.data.status === "out of delivery") {
          alert(res.data.message);
        }
        // optimistically update myOrders in Redux
        const updatedOrders = myOrders.map((order) => {
          if (order._id === orderId) {
            const updatedShopOrder = order.shopOrder.map((sh) => {
              if (sh.shop?._id === shopId || sh.shop === shopId) {
                return {
                  ...sh,
                  status: newStatus,
                  ...(res.data.shopOrder || {}),
                };
              }
              return sh;
            });
            return { ...order, shopOrder: updatedShopOrder };
          }
          return order;
        });
        dispatch(setMyOrders(updatedOrders));
        dispatch(triggerRefresh()); 
        if (newStatus === "out of delivery") {
          setAvailableBoys(res.data.availableBoys || []);
          console.log("Available Boys: ", res.data.availableBoys);
          console.log("Broadcast Payload: ", res.data);
        }
      }
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] pb-10">
      <Nav />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-[#ff4d2d]"
          >
            <IoMdArrowRoundBack size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            {userData?.role === "owner" ? "Shop Orders" : "My Orders"}
          </h1>
        </div>

        {!myOrders || myOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 text-center flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              No orders found!
            </h2>
            <p className="text-gray-500 mb-6 font-medium">
              {userData?.role === "owner"
                ? "You haven't received any orders yet."
                : "You haven't placed any orders yet."}
            </p>
            {userData?.role === "user" && (
              <button
                onClick={() => navigate("/")}
                className="bg-[#ff4d2d] hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
              >
                Browse Restaurants
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {myOrders.map((order) => {
              const ownerSubtotal =
                userData?.role === "owner"
                  ? order.shopOrder.find(
                      (s) =>
                        s.owner?._id === userData?._id ||
                        s.owner === userData?._id,
                    )?.subTotal
                  : 0;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                        Order #{order._id.slice(-8)}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(order.createdAt).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${order.paymentMethod === "cod" ? "bg-orange-100 text-[#ff4d2d]" : "bg-green-100 text-green-700"}`}
                      >
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Paid Online"}
                      </span>
                      <span className="text-xl font-black text-gray-800">
                        ₹
                        {userData?.role === "owner"
                          ? ownerSubtotal?.toFixed(2)
                          : order.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-4">
                    {order.shopOrder
                      // Owners only see their own store's objects inside the global order transaction
                      .filter((shOrder) =>
                        userData?.role === "owner"
                          ? shOrder.owner?._id === userData?._id ||
                            shOrder.owner === userData?._id
                          : true,
                      )
                      .map((shopOrd, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-xl p-4 sm:p-5"
                        >
                          <div className="flex items-start sm:items-center justify-between mb-4 flex-col sm:flex-row gap-3">
                            {userData?.role === "user" ? (
                              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d2d]"></span>
                                {shopOrd.shop?.name || "Restaurant"}
                              </h3>
                            ) : (
                              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d2d]"></span>
                                Order Details
                              </h3>
                            )}
                            {userData?.role === "user" ? (
                              <div className="flex items-center">
                                <span
                                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getStatusColor(shopOrd.status)}`}
                                >
                                  {shopOrd.status || "pending"}
                                </span>
                                {shopOrd.status === "out of delivery" && (
                                  <button 
                                    onClick={() => navigate(`/track/${order._id}/${shopOrd._id}`)}
                                    className="ml-3 px-3 py-1 bg-[#ff4d2d] text-white text-[10px] font-black uppercase tracking-tighter rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                  >
                                    <IoMdPin size={12} /> Track Food
                                  </button>
                                )}
                              </div>
                            ) : (
                              <select
                                value={shopOrd.status || "pending"}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    order._id,
                                    shopOrd.shop?._id || shopOrd.shop,
                                    e.target.value,
                                  )
                                }
                                className={`px-3 py-1 pr-8 text-xs font-bold uppercase tracking-wider rounded-full border border-transparent outline-none cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-position-[calc(100%-8px)_center] bg-size-16px ${getStatusColor(shopOrd.status)} shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50`}
                              >
                                <option value="pending">PENDING</option>
                                <option value="preparing">PREPARING</option>
                                <option value="out of delivery">
                                  OUT OF DELIVERY
                                </option>
                                {/* <option value="delivered">DELIVERED</option> ///accessible for delivery boy */}
                              </select>
                            )}
                          </div>

                          {userData?.role === "owner" && (
                            <div className="mb-5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                              <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                                Customer Details
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <p className="text-base font-bold text-gray-800">
                                    {order.user?.fullName || "Guest"}
                                  </p>
                                  <p className="text-sm font-medium text-gray-600">
                                    {order.user?.mobile}
                                  </p>
                                  <p className="text-sm font-medium text-gray-600">
                                    {order.user?.email}
                                  </p>
                                </div>
                                {(order.deliveryAddress?.flatNo ||
                                  order.deliveryAddress?.street) && (
                                  <div className="text-sm font-medium text-gray-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                    📍{" "}
                                    {order.deliveryAddress.flatNo &&
                                      `${order.deliveryAddress.flatNo}, `}
                                    {order.deliveryAddress.street}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {userData?.role === "owner" && shopOrd.assignedTo && (
                            <div className="mb-5 bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                              <p className="text-xs uppercase tracking-wider font-bold text-purple-600 mb-2">
                                Delivery Details
                              </p>
                              {shopOrd.assignedDeliveryBoy ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div>
                                    <p className="text-base font-bold text-gray-800">
                                      {shopOrd.assignedDeliveryBoy?.fullName ||
                                        "Loading..."}
                                    </p>
                                    <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                      📞 {shopOrd.assignedDeliveryBoy?.mobile}
                                    </p>
                                  </div>
                                  <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    ASSIGNED
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                                    <p className="text-sm font-bold text-purple-700">
                                      Broadcasting to nearby delivery partners...
                                    </p>
                                  </div>
                                  {availableBoys.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-purple-100">
                                      <p className="text-[10px] uppercase tracking-widest font-black text-purple-400 mb-3">Notified Partners Nearby</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availableBoys.map((boy) => (
                                          <div key={boy.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                                {boy.fullName?.charAt(0)}
                                              </div>
                                              <div>
                                                <p className="text-sm font-bold text-gray-800">{boy.fullName}</p>
                                                <p className="text-[10px] font-medium text-gray-500">Nearby</p>
                                              </div>
                                            </div>
                                            <a href={`tel:${boy.mobile}`} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all">
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="space-y-3">
                            {shopOrd.shopOrderItems.map((itemObj, iKey) => (
                              <div
                                key={iKey}
                                className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-100"
                              >
                                <div className="flex items-center gap-3">
                                  {itemObj.item?.image ? (
                                    <img
                                      src={itemObj.item.image}
                                      alt={itemObj.name}
                                      className="w-12 h-12 object-cover rounded-md shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-orange-100 rounded-md flex items-center justify-center text-orange-400 text-xl shrink-0">
                                      🍔
                                    </div>
                                  )}
                                  <span className="font-bold text-[#ff4d2d] bg-orange-50 w-8 h-8 flex items-center justify-center rounded-md text-sm border border-orange-100 shrink-0">
                                    {itemObj.quantity}x
                                  </span>
                                  <span className="text-gray-800 font-semibold line-clamp-2">
                                    {itemObj.name}
                                  </span>
                                </div>
                                <span className="font-bold text-gray-800 shrink-0 ml-2">
                                  ₹
                                  {(itemObj.price * itemObj.quantity).toFixed(
                                    2,
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">
                              Subtotal for this{" "}
                              {userData?.role === "owner"
                                ? "Order"
                                : "Restaurant"}
                            </span>
                            <span className="text-base font-black text-gray-800">
                              ₹{shopOrd.subTotal?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
