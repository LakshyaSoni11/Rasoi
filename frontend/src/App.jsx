import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import useGetCity from "./hooks/usegetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import FoodLoader from "./components/FoodLoader";
import { io } from "socket.io-client";
import { setSocket } from "./redux/userSlice";
import { triggerRefresh } from "./redux/userSlice";
import { Toaster, toast } from 'react-hot-toast';
// Lazy loading pages
const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Home = lazy(() => import("./pages/Home"));
const CreateEditShop = lazy(() => import("./pages/CreateEditShop"));
const AddItem = lazy(() => import("./pages/AddItem"));
const EditItem = lazy(() => import("./pages/EditItem"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckOut = lazy(() => import("./pages/CheckOut"));
const OrderPlaced = lazy(() => import("./pages/orderPlaced"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Tracking = lazy(() => import("./pages/Tracking"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
const App = () => {
  const { loading: userLoading } = useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // STABLE SOCKET CONNECTION
  useEffect(() => {
    const socket = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"], // Ensure compatibility
    });

    dispatch(setSocket(socket));

    socket.on("connect", () => {
      if (userData?._id) {
        socket.emit("identity", { userId: userData._id });
      }
    });

    // Listen for global updates
    socket.on("newOrder", (data) => {
      toast.success(data.message || "New order received!");
      dispatch(triggerRefresh());
    });

    socket.on("shopUpdate", () => {
      dispatch(triggerRefresh());
    });

    socket.on("itemUpdate", () => {
      dispatch(triggerRefresh());
    });

    socket.on("orderUpdate", (data) => {
      toast.success(data.message || "Order updated!");
      dispatch(triggerRefresh());
    });

    socket.on("locationUpdate", (data) => {
      dispatch(triggerRefresh());
    });

    socket.on("newAssignment", (data) => {
      toast.custom((t) => (
         <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-xl rounded-2xl p-4 flex gap-4 items-start border border-orange-100`}>
             <div className="flex-1">
                 <p className="font-bold text-gray-900">New Task Nearby! 🛵</p>
                 <p className="text-sm text-gray-500 mt-1">{data.message || "A new delivery opportunity is waiting."}</p>
             </div>
             <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
         </div>
      ), { duration: 6000 });
      dispatch(triggerRefresh());
    });

    // Re-identify if userData becomes available after connection
    if (userData?._id && socket.connected) {
      socket.emit("identity", { userId: userData._id });
    }

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [dispatch, userData?._id]); // Only re-run if the User ID actually changes

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
        <FoodLoader />
      </div>
    );
  }

  //console.log("Current User:", user);
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
        <FoodLoader />
      </div>
    }>
      <Toaster 
          position="top-center" 
          toastOptions={{
             style: {
                borderRadius: '16px',
                background: '#333',
                color: '#fff',
                fontWeight: 'bold',
                padding: '16px 24px'
             },
             success: {
                 style: { background: '#10b981' }
             }
          }}
      />
      <Routes>
        {/* <Route path='/' element={<Home/>}/> */}

        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to="/" />}
        />
        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to="/" />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/signin" />}
        />
        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to="/signin" />}
        />
        <Route
          path="/add-item"
          element={userData ? <AddItem /> : <Navigate to="/signin" />}
        />
        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to="/signin" />}
        />
        <Route
          path="/cart"
          element={userData ? <CartPage /> : <Navigate to="/signin" />}
        />
        <Route
          path="/checkout"
          element={userData ? <CheckOut /> : <Navigate to="/signin" />}
        />
        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to="/signin" />}
        />
        <Route
          path="/my-orders"
          element={userData ? <MyOrders /> : <Navigate to="/signin" />}
        />
        <Route
          path="/track/:orderId/:shopOrderId"
          element={userData ? <Tracking /> : <Navigate to="/signin" />}
        />
        <Route
          path="/shop/:shopId"
          element={userData ? <ShopPage /> : <Navigate to="/signin" />}
        />
        <Route
          path="/admin"
          element={userData && userData.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Suspense>
  );
};

export default App;
