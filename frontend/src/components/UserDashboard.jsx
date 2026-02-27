import React from "react";
import Nav from "./Nav";
import CategoryCard from "./categoryCard";
import UserShopCard from "./UserShopCard";
import { categories } from "../category.js";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard.jsx";
import FoodLoader from "./FoodLoader";
const UserDashboard = () => {
  const scrollContainerRef = useRef(null);
  const shopScrollContainerRef = useRef(null);
  const { currentCity, shopsInMyCity, itemsInMyCity } = useSelector(
    (state) => state.user,
  );
  console.log(itemsInMyCity);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [canShopScrollLeft, setCanShopScrollLeft] = useState(false);
  const [canShopScrollRight, setCanShopScrollRight] = useState(true);

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
    <div className="w-screen min-h-screen flex flex-col items-center bg-[#fff9f6] pb-10 overflow-y-">
      <Nav />
      {/* Container holding the content */}
      <div className="w-full flex flex-col items-center px-4 max-w-6xl mt-6">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4 px-2 sm:px-4">
          <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">
            Inspiration for your first order
          </h1>
        </div>

        {/* Horizontal Category List */}
        <div className="w-full relative px-2 sm:px-4 group">
          {/* Scroll Buttons on the sides */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-md text-gray-700 w-9 h-9 rounded-full flex justify-center items-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <FaChevronLeft size={14} className="mr-0.5" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-md text-gray-700 w-9 h-9 rounded-full flex justify-center items-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <FaChevronRight size={14} className="ml-0.5" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="w-full flex overflow-x-auto gap-4 sm:gap-6 pb-4 pt-2 scroll-smooth scrollbar-hide px-2"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {categories.map((cat, idx) => (
              <CategoryCard key={idx} category={cat} />
            ))}
          </div>
        </div>

        {/* Shops in my city */}
        <div className="w-full flex flex-col gap-6 items-start px-2 sm:px-4 max-w-6xl mt-8">
          <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">
            Best Shops In {currentCity}
          </h1>

          <div className="w-full relative px-2 sm:px-4 group">
            {/* Scroll Buttons on the sides */}
            {canShopScrollLeft && (
              <button
                onClick={() => scrollShop("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-md text-gray-700 w-9 h-9 rounded-full flex justify-center items-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <FaChevronLeft size={14} className="mr-0.5" />
              </button>
            )}

            {canShopScrollRight && shopsInMyCity?.shop?.length > 0 && (
              <button
                onClick={() => scrollShop("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-md text-gray-700 w-9 h-9 rounded-full flex justify-center items-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <FaChevronRight size={14} className="ml-0.5" />
              </button>
            )}

            <div
              ref={shopScrollContainerRef}
              onScroll={checkShopScroll}
              className="w-full flex overflow-x-auto gap-4 sm:gap-6 pb-4 pt-2 scroll-smooth scrollbar-hide px-2"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {shopsInMyCity === null ? (
                <div className="w-full py-10 flex justify-center">
                  <FoodLoader />
                </div>
              ) : shopsInMyCity?.shop?.length > 0 ? (
                shopsInMyCity.shop.map((shop, idx) => (
                  <UserShopCard key={shop._id || idx} shop={shop} />
                ))
              ) : (
                <div className="w-full py-12 flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-lg font-medium text-gray-600">
                    No popular spots found yet.
                  </p>
                  <p className="text-sm mt-1">
                    We are expanding our services to new shops soon!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* items */}
        <div className="w-full flex flex-col gap-6 items-start px-2 sm:px-4 max-w-6xl mt-8">
          <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold">
            Items for you
          </h1>
          <div className="w-full h-auto flex flex-wrap gap-4 justify-center">
            {itemsInMyCity === null ? (
              <div className="w-full py-10 flex justify-center">
                <FoodLoader />
              </div>
            ) : itemsInMyCity?.length > 0 ? (
              itemsInMyCity.map((item, idx) => (
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
