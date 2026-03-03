import React from "react";
import { useSelector } from "react-redux";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";

const MyOrders = () => {
  const { userData, myOrders } = useSelector((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff9f6] pb-10">
      <Nav />
      {/* Set padding-top dynamically so Nav doesn't overlap */}
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
              // Calculate specific total based on scope if Owner or full Grand Total if User
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
                          {userData?.role === "user" && (
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d2d]"></span>
                              {shopOrd.shop?.name || "Restaurant"}
                            </h3>
                          )}

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

                          <div className="space-y-3">
                            {shopOrd.shopOrderItems.map((itemObj, iKey) => (
                              <div
                                key={iKey}
                                className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-100"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-[#ff4d2d] bg-orange-50 w-8 h-8 flex items-center justify-center rounded-md text-sm border border-orange-100">
                                    {itemObj.quantity}x
                                  </span>
                                  <span className="text-gray-800 font-semibold">
                                    {itemObj.name}
                                  </span>
                                </div>
                                <span className="font-bold text-gray-800">
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
