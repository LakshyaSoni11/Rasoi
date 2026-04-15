import React from "react";
import Nav from "./Nav";
import CategoryCard from "./categoryCard";
import UserShopCard from "./UserShopCard";
import { categories } from "../category.js";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoReceiptSharp } from "react-icons/io5";
import FoodCard from "./FoodCard.jsx";
import FoodLoader from "./FoodLoader";
import useScrollReveal from "../hooks/useScrollReveal";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { addToRefs } = useScrollReveal();
  const scrollContainerRef = useRef(null);
  const shopScrollContainerRef = useRef(null);
  const { currentCity, shopsInMyCity, itemsInMyCity, userData, searchQuery } = useSelector(
    (state) => state.user,
  );

  const firstName = userData?.fullName?.split(" ")[0] || "User";

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [canShopScrollLeft, setCanShopScrollLeft] = useState(false);
  const [canShopScrollRight, setCanShopScrollRight] = useState(true);

  const [updatedItemsList, setUpdatedItemsList] = useState(itemsInMyCity);
  const [updatedShopsList, setUpdatedShopsList] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (shopsInMyCity?.shop) {
      setUpdatedShopsList(shopsInMyCity.shop);
    }
  }, [shopsInMyCity]);

  const handleFilterByCategory = (category) =>{
    setActiveCategory(category);
    if(category === 'All'){
      setUpdatedItemsList(itemsInMyCity);
      setUpdatedShopsList(shopsInMyCity?.shop || []);
    }
    else{
      if (!itemsInMyCity) return;
      
      const filteredItems = itemsInMyCity.filter((item) =>{
        return item.category === category;   
      })
      setUpdatedItemsList(filteredItems);

      if (shopsInMyCity?.shop) {
        const shopIdsWithCategory = new Set(filteredItems.map(item => item.shop));
        const filteredShops = shopsInMyCity.shop.filter(shop => 
          shopIdsWithCategory.has(shop._id)
        );
        setUpdatedShopsList(filteredShops);
      }
    }
  }


  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const checkShopScroll = () => {
    if (shopScrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        shopScrollContainerRef.current;
      setCanShopScrollLeft(scrollLeft > 0);
      setCanShopScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    checkShopScroll();
    window.addEventListener("resize", checkScroll);
    window.addEventListener("resize", checkShopScroll);
    return () => {
      window.removeEventListener("resize", checkScroll);
      window.removeEventListener("resize", checkShopScroll);
    };
  }, [shopsInMyCity]);

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity);
  }, [itemsInMyCity]);

  useEffect(() => {
    if (!searchQuery) {
        setUpdatedItemsList(itemsInMyCity);
        setUpdatedShopsList(shopsInMyCity?.shop || []);
        return;
    }
    
    // Global search across items
    const filteredItems = itemsInMyCity?.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setUpdatedItemsList(filteredItems);

    // Global search across shops
    const filteredShops = shopsInMyCity?.shop?.filter(shop => 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        shop.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setUpdatedShopsList(filteredShops);
    
    if (searchQuery) setActiveCategory('All'); // Reset category during search
  }, [searchQuery, itemsInMyCity, shopsInMyCity]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Adjust scroll distance here
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollShop = (direction) => {
    if (shopScrollContainerRef.current) {
      const scrollAmount = 300; // Adjust scroll distance here
      shopScrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-[#fff9f6] pb-10 overflow-x-hidden">
      <Nav />
      {/* Container holding the content */}
      <div className="w-full flex flex-col items-center px-4 max-w-6xl mt-6">
        {/* Quick Links / Dashboard Header */}
        <div 
          ref={addToRefs}
          className="w-full flex flex-wrap items-center justify-between mb-8 px-2 sm:px-4 gap-4 opacity-0"
        >
          <div>
            <h1 className="text-gray-900 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-[#ff4d2d] underline decoration-orange-200 decoration-4 underline-offset-4">{firstName}</span>
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">What's on your mind today?</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/my-orders')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white shadow-sm border border-orange-100 text-gray-700 font-bold hover:shadow-md hover:border-orange-200 transition-all active:scale-95 cursor-pointer"
            >
              <IoReceiptSharp className="text-[#ff4d2d]" size={20} />
              My Orders
            </button>
          </div>
        </div>

        {/* Inspiration Section */}
        <div ref={addToRefs} className="w-full opacity-0">
          <div className="w-full flex justify-between items-center mb-4 px-2 sm:px-4">
          <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">
            Inspiration for your first order
          </h1>
        </div>

        {/* Horizontal Category List */}
        <div className="w-full relative px-2 sm:px-4 group/section">
          {/* Scroll Buttons on the sides */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-md text-gray-700 w-9 h-9 rounded-full flex justify-center items-center transition-all cursor-pointer opacity-0 group-hover/section:opacity-100"
            >
              <FaChevronLeft size={14} className="mr-0.5" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-md text-gray-700 w-9 h-9 rounded-full flex justify-center items-center transition-all cursor-pointer opacity-0 group-hover/section:opacity-100"
            >
              <FaChevronRight size={14} className="ml-0.5" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="w-full flex overflow-x-auto gap-4 sm:gap-6 pb-4 pt-2 scroll-smooth hide-scrollbar px-2"
          >
            {[{ category: 'All', image: 'https://cdn-icons-png.flaticon.com/512/706/706164.png' }, ...categories].map((cat, idx) => (
              <CategoryCard 
                key={idx} 
                category={cat} 
                onClick={() => handleFilterByCategory(cat.category)} 
                isActive={activeCategory === cat.category}
              />
            ))}
          </div>
        </div>
      </div>

        {/* Shops in my city */}
        <div ref={addToRefs} className="w-full opacity-0 flex flex-col gap-6 items-start px-2 sm:px-4 max-w-6xl mt-8">
          <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">
            Best Shops In {currentCity}
          </h1>

          <div className="w-full relative px-2 sm:px-4 group/section">
            {/* Scroll Buttons on the sides */}
            {canShopScrollLeft && (
              <button
                onClick={() => scrollShop("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-md text-gray-700 w-9 h-9 rounded-full flex justify-center items-center transition-all cursor-pointer opacity-0 group-hover/section:opacity-100"
              >
                <FaChevronLeft size={14} className="mr-0.5" />
              </button>
            )}

            {canShopScrollRight && updatedShopsList?.length > 0 && (
              <button
                onClick={() => scrollShop("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-md text-gray-700 w-9 h-9 rounded-full flex justify-center items-center transition-all cursor-pointer opacity-0 group-hover/section:opacity-100"
              >
                <FaChevronRight size={14} className="ml-0.5" />
              </button>
            )}

            <div
              ref={shopScrollContainerRef}
              onScroll={checkShopScroll}
              className="w-full flex overflow-x-auto gap-4 sm:gap-6 pb-4 pt-2 scroll-smooth hide-scrollbar px-2"
            >
              {updatedShopsList === null ? (
                <div className="w-full py-10 flex justify-center">
                  <FoodLoader />
                </div>
              ) : updatedShopsList?.length > 0 ? (
                updatedShopsList.map((shop, idx) => (
                  <UserShopCard key={shop._id || idx} shop={shop} />
                ))
              ) : (
                <div className="w-full py-12 flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
                  <p className="text-lg font-medium text-gray-600">
                    No shops found for this category.
                  </p>
                  <p className="text-sm mt-1 text-center">
                    Try another category or check back later!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* items */}
        <div ref={addToRefs} className="w-full opacity-0 flex flex-col gap-6 items-start px-2 sm:px-4 max-w-6xl mt-8">
          <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">
            Items for you
          </h1>
          <div className="w-full h-auto flex flex-wrap gap-4 justify-center">
            {updatedItemsList === null ? (
              <div className="w-full py-10 flex justify-center">
                <FoodLoader />
              </div>
            ) : updatedItemsList?.length > 0 ? (
              updatedItemsList.map((item, idx) => (
                <FoodCard key={item._id || idx} data={item} />
              ))
            ) : (
              <div className="w-full py-12 flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-lg font-medium text-gray-600">
                  No popular items found yet.
                </p>
                <p className="text-sm mt-1">
                  We are expanding our services to new items soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
