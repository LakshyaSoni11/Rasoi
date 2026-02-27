import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setItemsInMyCity } from "../redux/userSlice";

const useGetItemsByCity = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const currentCity = useSelector(state => state.user.currentCity)
  useEffect(() => {
    const fetchItemsByCity = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`, {
          withCredentials: true,
        });
        // Dispatch to Redux
        dispatch(setItemsInMyCity(result.data.items));
        // console.log("Items in my city:", result.data.items);
      } catch (error) {
        console.log(error);
        // Dispatch null on error (ensure logged out state)
        dispatch(setItemsInMyCity(null));
      } finally {
        setLoading(false);
      }
    };
    fetchItemsByCity();
  }, [dispatch, currentCity]);

  return { loading };
};

export default useGetItemsByCity;
