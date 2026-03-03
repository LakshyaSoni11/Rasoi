import React from "react";

const UserShopCard = ({ shop }) => {
  return (
    <div className="w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] shrink-0 rounded-2xl overflow-hidden cursor-pointer group border-2 border-[#ff4d2d] relative bg-white shadow-md hover:shadow-lg transition-all duration-300">
      <img
        src={shop?.image}
        alt={shop?.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {/* Name Overlay Bar at Bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-white via-white/40 to-white/20 rounded-lg backdrop-blur-xs py-1 px-1 border-t border-gray-400">
        <p className="text-[10px] sm:text-xs font-bold text-gray-800 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full capitalize">
          {shop?.name}
        </p>
      </div>
    </div>
  );
};

export default UserShopCard;
