import React, { useState, useEffect } from "react";

const FoodLoader = () => {
  const foods = [
    "🍕",
    "🍔",
    "🍟",
    "🌭",
    "🥪",
    "🌮",
    "🌯",
    "🍜",
    "🍣",
    "🍱",
    "🍛",
    "🍙",
    "🍚",
    "🍘",
    "🍢",
    "🍡",
    "🍧",
    "🍨",
    "🍦",
    "🍰",
    "🎂",
    "🍮",
    "🍭",
    "🍬",
    "🍫",
    "🍿",
    "🍩",
    "🍪",
  ];

  const [currentFoodIndex, setCurrentFoodIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFoodIndex((prev) => (prev + 1) % foods.length);
    }, 300); // Fast, Zomato-like transition

    return () => clearInterval(interval);
  }, [foods.length]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px]">
      <div className="relative flex items-center justify-center w-24 h-24 mb-4 bg-orange-100 rounded-full shadow-inner">
        {/* Pulsing ring around it */}
        <div className="absolute inset-0 rounded-full border-4 border-[#ff4d2d] opacity-20 animate-ping"></div>
        {/* Food Emoji */}
        <span className="text-5xl drop-shadow-md animate-bounce">
          {foods[currentFoodIndex]}
        </span>
      </div>
      <p className="text-[#ff4d2d] font-bold text-lg animate-pulse">
        Loading tasty details...
      </p>
    </div>
  );
};

export default FoodLoader;
