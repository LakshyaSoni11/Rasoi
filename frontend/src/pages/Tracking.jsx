import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { IoMdArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';
import FoodLoader from '../components/FoodLoader';

const Tracking = () => {
    const { orderId, shopOrderId } = useParams();
    const navigate = useNavigate();
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTrackingInfo = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/order/track/${orderId}/${shopOrderId}`, { withCredentials: true });
            setTrackingData(res.data);
        } catch (error) {
            console.error("Error fetching tracking data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrackingInfo();
        // Poll for updates every 10 seconds to keep the map live
        const interval = setInterval(fetchTrackingInfo, 10000); 
        return () => clearInterval(interval);
    }, [orderId, shopOrderId]);

    if (loading) return (
        <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
            <FoodLoader />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fff9f6] pb-10">
            <Nav />
            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-[#ff4d2d]"
                        >
                            <IoMdArrowRoundBack size={20} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Track Your Food</h1>
                    </div>
                    {trackingData?.status && (
                        <span className="px-4 py-1.5 bg-orange-100 text-[#ff4d2d] text-xs font-black rounded-full uppercase tracking-widest shadow-sm">
                            {trackingData.status}
                        </span>
                    )}
                </div>

                {trackingData ? (
                    <DeliveryBoyTracking data={trackingData} />
                ) : (
                    <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-orange-100 text-center">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-400 text-3xl mx-auto mb-4">
                            📍
                        </div>
                        <p className="text-gray-500 font-bold text-lg">Tracking information is not available yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Your delivery partner will update the location once they start.</p>
                        <button 
                            onClick={() => navigate('/my-orders')}
                            className="mt-6 text-[#ff4d2d] font-bold text-sm hover:underline"
                        >
                            Back to My Orders
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracking;
