import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setLocation } from "../redux/mapSlice";

const useUpdateLocation = () => {
    const dispatch = useDispatch();

  useEffect(() => {
        const updateLocation = async (lat, lon) =>{
            await axios.post(`${serverUrl}/api/user/update-location`, { lat, lon}, {withCredentials:true})
            // console.log(result.data)
        }
        navigator.geolocation.watchPosition((position) =>{
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            dispatch(setLocation({lat, lon}))
            updateLocation(lat, lon)
        })
  }, [dispatch]);
};

export default useUpdateLocation;
