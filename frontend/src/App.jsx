import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useSelector } from "react-redux";
import useGetCity from "./hooks/usegetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import FoodLoader from "./components/FoodLoader";

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

export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
const App = () => {
  const { loading: userLoading } = useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();
  const { userData } = useSelector((state) => state.user);

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
      </Routes>
    </Suspense>
  );
};

export default App;
