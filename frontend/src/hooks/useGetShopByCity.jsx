import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setShopsInMyCity } from "../redux/userSlice";

const useGetShopByCity = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const {currentCity} = useSelector((state)=> state.user)
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, {
          withCredentials: true,
        });
        // Dispatch to Redux
        dispatch(setShopsInMyCity(result.data));
        console.log(result.data)
      } catch (error) {
        console.log(error);
        // Dispatch null on error (ensure logged out state)
        dispatch(setShopsInMyCity(null));
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [dispatch, currentCity]);

  return { loading };
};


export default useGetShopByCity;
