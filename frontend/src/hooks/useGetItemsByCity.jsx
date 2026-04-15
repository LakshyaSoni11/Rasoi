import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setItemsInMyCity } from "../redux/userSlice";

const useGetItemsByCity = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const currentCity = useSelector(state => state.user.currentCity)
  const refreshTrigger = useSelector(state => state.user.refreshTrigger)

  useEffect(() => {
    const fetchItemsByCity = async () => {
      if(!currentCity) return;
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`, {
          withCredentials: true,
        });
        dispatch(setItemsInMyCity(result.data.items));
      } catch (error) {
        console.log(error);
        dispatch(setItemsInMyCity(null));
      } finally {
        setLoading(false);
      }
    };
    fetchItemsByCity();
  }, [dispatch, currentCity, refreshTrigger]);

  return { loading };
};

export default useGetItemsByCity;
