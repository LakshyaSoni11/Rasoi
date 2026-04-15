import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setShopsInMyCity } from "../redux/userSlice";

const useGetShopByCity = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { currentCity, refreshTrigger } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchShops = async () => {
      if (!currentCity) return;
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, {
          withCredentials: true,
        });
        dispatch(setShopsInMyCity(result.data));
      } catch (error) {
        console.log(error);
        dispatch(setShopsInMyCity(null));
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [dispatch, currentCity, refreshTrigger]);

  return { loading };
};


export default useGetShopByCity;
