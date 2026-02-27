import React from "react";
import { useSelector } from "react-redux";
import DeliveryBoy from "../components/DeliveryBoy";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";

const Home = () => {
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="flex items-center min-h-screen pt-[64px] flex-col bg-[#fff9f6] w-full">
      {userData.role == "owner" ? (
        <OwnerDashboard />
      ) : userData.role == "deliveryBoy" ? (
        <DeliveryBoy />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
};

export default Home;
