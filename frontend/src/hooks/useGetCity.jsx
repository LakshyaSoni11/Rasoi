import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setCurrentAddress, setCurrentCity, setCurrentState } from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

const useGetCity = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      // console.log(latitude, longitude);
      // Use backend proxy to avoid CORS and 403 errors
      dispatch(setLocation({lat: latitude, lon: longitude}))
      const result = await axios.get(
        `${serverUrl}/api/user/get-city?lat=${latitude}&lon=${longitude}`,
      );
      const address = result.data.address;
      let detectedCity = address.city || 
                         address.city_district || 
                         address.state_district || 
                         address.county || 
                         address.town || 
                         address.village || 
                         "";

      if (detectedCity.match(/Bengaluru|Bangalore/i)) {
        detectedCity = "Bengaluru";
      } else {
        // Normalize other Indian cities
        detectedCity = detectedCity.replace(/ (Urban|Rural) District| (Urban|Rural)| District| Corporation| City/gi, '').trim();
      }

      dispatch(setCurrentCity(detectedCity));
      dispatch(setCurrentState(address.state));
      dispatch(setCurrentAddress(result.data.address.road || result.data.address.suburb || result.data.address.village))
      const finalAddress = result.data.address.road || result.data.address.suburb || result.data.address.village
      dispatch(setAddress(finalAddress))
      // console.log(result.data.address.road)
      // console.log(result.data.address.suburb)
      // console.log(result.data.address.village)
    });
  }, [dispatch]);
};

export default useGetCity;
