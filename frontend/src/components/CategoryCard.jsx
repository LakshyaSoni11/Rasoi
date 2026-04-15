import React from "react";

const CategoryCard = ({ category, onClick, isActive }) => {
  return (
    <div 
      className="w-[80px] sm:w-[100px] shrink-0 flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Circle Image Wrapper */}
      <div className={`w-full aspect-square rounded-full overflow-hidden shadow-sm transition-all duration-300 ${
        isActive 
          ? "ring-4 ring-[#ff4d2d] ring-offset-2 shadow-lg scale-105" 
          : "shadow-gray-200 hover-lift hover:shadow-lg"
      }`}>
        <img
          src={category.image}
          alt={category.category}
          loading="lazy"
          className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      {/* Category Name */}
      <p className={`mt-2 text-xs sm:text-sm font-bold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full transition-colors ${
        isActive ? "text-[#ff4d2d]" : "text-gray-700 group-hover:text-[#ff4d2d]"
      }`}>
        {category.category}
      </p>
    </div>
  );
};

export default CategoryCard;
