import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

const useGetCurrentUser = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        // Dispatch to Redux
        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error);
        // Dispatch null on error (ensure logged out state)
        dispatch(setUserData(null));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [dispatch]);

  return { loading };
};


export default useGetCurrentUser;
