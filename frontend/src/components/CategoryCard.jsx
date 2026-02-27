import React from "react";

const CategoryCard = ({ category }) => {
  return (
    <div className="w-[80px] sm:w-[100px] shrink-0 flex flex-col items-center cursor-pointer group">
      {/* Circle Image Wrapper */}
      <div className="w-full aspect-square rounded-full overflow-hidden shadow-sm shadow-gray-200 hover:shadow-lg transition-all duration-300">
        <img
          src={category.image}
          alt={category.category}
          className="w-full h-full object-cover rounded-full hover:scale-105 transition-transform duration-300"
        />
      </div>
      {/* Category Name */}
      <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full hover:text-[#ff4d2d] transition-colors">
        {category.category}
      </p>
    </div>
  );
};

export default CategoryCard;
