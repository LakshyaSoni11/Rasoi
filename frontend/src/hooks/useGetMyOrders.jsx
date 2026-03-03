import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setMyOrders } from "../redux/userSlice";

const useGetMyOrders = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        // Dispatch to Redux
        dispatch(setMyOrders(result.data.orders));
        console.log("orders", result.data.orders);
      } catch (error) {
        console.log(error);
        // Dispatch null on error (ensure logged out state)
        dispatch(setMyOrders(null));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [dispatch]);

  return { loading };
};

export default useGetMyOrders;
