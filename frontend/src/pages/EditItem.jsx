import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import FoodLoader from "../components/FoodLoader";

const EditItem = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const dispatch = useDispatch();
  const { myShopData } = useSelector((state) => state.owner);
  const [isLoading, setIsLoading] = useState(!!itemId);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("Veg");
  const categories = [
    "Pizza",
    "Burgers",
    "Pasta",
    "Indian",
    "Chinese",
    "South Indian",
    "North Indian",
    "Fast Food",
    "Desserts",
    "Beverages",
    "Street Food",
    "Healthy",
    "Snacks",
    "Vegetarian",
    "Non-Vegetarian",
    "Others",
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontendImage(URL.createObjectURL(file));
      setBackendImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", backendImage);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("foodType", foodType);
      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true },
      );
      if (result.data.shop) {
        dispatch(setMyShopData(result.data.shop));
        navigate(-1);
        console.log(result.data.shop);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const handleGetItemById = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-id/${itemId}`,
          { withCredentials: true },
        );
        const item = result.data;
        setName(item.name || "");
        setPrice(item.price || 0);
        setCategory(item.category || "");
        setFoodType(item.foodType || "Veg");
        setFrontendImage(item.image || null);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (itemId) {
      handleGetItemById();
    }
  }, [itemId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-orange-50 to-white">
        <FoodLoader />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center flex-col min-h-screen p-4 bg-linear-to-br from-orange-50 relative to-white">
      <div
        className="absolute top-4 left-4 cursor-pointer z-10 text-[#ff4d2d] hover:scale-110 transition-transform"
        onClick={() => navigate(-1)}
      >
        <IoMdArrowRoundBack size={24} />
      </div>
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 border border-orange-100 mt-12 mb-8">
        <div className="flex flex-col items-center mb-5">
          <div
            className="bg-orange-100 p-3
           rounded-full mb-3"
          >
            <GiForkKnifeSpoon className="text-[#ff4d2d] w-12 h-12" />
          </div>
          <div className="font-extrabold text-xl">Edit Food</div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Food Name
            </label>
            <input
              type="text"
              placeholder="Enter food name"
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Food Image
            </label>
            <input
              type="file"
              placeholder="Upload food image"
              accept="image/*"
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              onChange={handleImageChange}
            />
            {frontendImage && (
              <img
                src={frontendImage}
                alt="shop"
                className="w-full h-40 object-cover rounded-lg border border-gray-300 mt-3"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat, idx) => (
                <option value={cat} key={idx}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Select Food Type
            </label>
            <select
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
            >
              {["Veg", "Non-Veg"].map((cat, idx) => (
                <option value={cat} key={idx}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div></div>
          <button
            className="w-full bg-[#ff4d2d] text-white px-5 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200 active:scale-95 cursor-pointer text-sm"
            onClick={handleSubmit}
          >
            {myShopData ? "Save Changes" : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
