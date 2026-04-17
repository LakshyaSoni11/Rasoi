import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { serverUrl } from '../App';

const ItemRating = ({ orderId, orderItemId, itemId, isRated }) => {
    const [hover, setHover] = useState(null);
    const [rating, setRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rated, setRated] = useState(isRated);

    const submitRating = async (ratingValue) => {
        if (rated || loading) return;
        setLoading(true);
        try {
            const res = await axios.post(`${serverUrl}/api/item/rating`, {
                itemId,
                rating: ratingValue,
                orderId,
                orderItemId
            }, { withCredentials: true });
            
            if (res.status === 200) {
                setRated(true);
                setRating(ratingValue);
            }
        } catch (error) {
            console.error("Error submitting rating", error);
            alert(error.response?.data?.message || "Failed to submit rating");
        } finally {
            setLoading(false);
        }
    };

    if (rated) {
        return (
             <div className="flex flex-col items-center justify-center shrink-0 ml-4">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-green-500 mb-0.5">Rated</span>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} size={12} className={i < (rating || 5) ? "text-yellow-400" : "text-gray-200"} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center shrink-0 ml-4 group">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5 group-hover:text-[#ff4d2d] transition-colors">Rate Item</span>
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => {
                    const ratingValue = i + 1;
                    return (
                        <FaStar
                            key={i}
                            size={14}
                            className={`cursor-pointer transition-colors duration-200 ${ratingValue <= (hover || rating) ? "text-yellow-400 scale-110" : "text-gray-200 hover:scale-110"}`}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => submitRating(ratingValue)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ItemRating;
