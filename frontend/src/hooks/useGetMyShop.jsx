import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
const useGetMyShop = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const { userData, refreshTrigger } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-shop`, {
          withCredentials: true,
        });
        // Dispatch to Redux
        dispatch(setMyShopData(result.data.shop));
      } catch (error) {
        console.log(error);
        // Dispatch null on error (ensure logged out state)
        dispatch(setMyShopData(null));
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [dispatch, refreshTrigger, userData?._id]);

  return { loading };
};

export default useGetMyShop;
