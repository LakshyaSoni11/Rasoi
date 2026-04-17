import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setMyOrders } from "../redux/userSlice";


const useGetMyOrders = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { userData, refreshTrigger } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        // Dispatch to Redux
        dispatch(setMyOrders(result.data.orders));
      } catch (error) {
        console.log(error);
        // Dispatch null on error
        dispatch(setMyOrders(null));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [dispatch, refreshTrigger, userData?._id]);

  return { loading };
};

export default useGetMyOrders;
