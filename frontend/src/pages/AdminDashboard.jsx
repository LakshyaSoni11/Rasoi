import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { IoMdCheckmarkCircle, IoMdRefresh } from "react-icons/io";
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { userData } = useSelector((state) => state.user);
    const [metrics, setMetrics] = useState(null);
    const [verifications, setVerifications] = useState({ unverifiedShops: [], unverifiedBoys: [] });
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchMetrics = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/admin/metrics`, { withCredentials: true });
            setMetrics(res.data);
        // eslint-disable-next-line no-unused-vars
        } catch (_error) {
            toast.error("Failed to fetch platform metrics.");
        }
    };

    const fetchVerifications = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/admin/verifications`, { withCredentials: true });
            setVerifications(res.data);
        // eslint-disable-next-line no-unused-vars
        } catch (_error) {
            toast.error("Failed to fetch verification queue.");
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/admin/orders`, { withCredentials: true });
            setOrders(res.data);
        // eslint-disable-next-line no-unused-vars
        } catch (_error) {
            toast.error("Failed to fetch orders.");
        }
    };

    useEffect(() => {
        if (userData?.role === "admin") {
            fetchMetrics();
            fetchVerifications();
            fetchOrders();
        }
    }, [userData]);

    const handleVerifyShop = async (id) => {
        try {
            await axios.put(`${serverUrl}/api/admin/verify-shop/${id}`, {}, { withCredentials: true });
            toast.success("Shop verified successfully!");
            fetchVerifications();
        // eslint-disable-next-line no-unused-vars
        } catch (_error) {
            toast.error("Verification failed. Please try again.");
        }
    };

    const handleVerifyRider = async (id) => {
        try {
            await axios.put(`${serverUrl}/api/admin/verify-rider/${id}`, {}, { withCredentials: true });
            toast.success("Rider verified successfully!");
            fetchVerifications();
        // eslint-disable-next-line no-unused-vars
        } catch (_error) {
            toast.error("Verification failed. Please try again.");
        }
    };

    const verifyAllExisting = async () => {
        try {
            await axios.post(`${serverUrl}/api/admin/verify-all`, {}, { withCredentials: true });
            toast.success("All existing entities verified!");
            fetchVerifications();
        // eslint-disable-next-line no-unused-vars
        } catch (_error) {
            toast.error("Verification failed. Please try again.");
        }
    };

    if (userData?.role !== "admin") {
        return <div className="min-h-screen flex items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-red-600">Access Denied: Admin privileges required.</h1>
        </div>;
    }

    /* Colors for charts */
    const COLORS = ['#ff4d2d', '#4f46e5', '#10b981', '#f59e0b'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Nav />
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 lg:flex gap-8">
                
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 shrink-0 mb-8 lg:mb-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-24">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-4 mb-4">Admin Area</h2>
                        <ul>
                            {['overview', 'verifications', 'orders'].map(tab => (
                                <li key={tab}>
                                    <button
                                        onClick={() => setActiveTab(tab)}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all mb-1 ${activeTab === tab ? 'bg-[#ff4d2d] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    
                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-3xl font-black text-gray-900">Platform Overview</h1>
                                <button onClick={fetchMetrics} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-[#ff4d2d]"><IoMdRefresh size={20}/></button>
                            </div>
                            
                            {/* KPI Cards */}
                            {metrics && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-blue-500">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                                        <p className="text-3xl font-black text-gray-900">{metrics.stats.totalUsers}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-orange-500">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Shops</p>
                                        <p className="text-3xl font-black text-gray-900">{metrics.stats.totalShops}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-green-500">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Global Orders</p>
                                        <p className="text-3xl font-black text-gray-900">{metrics.stats.totalOrders}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-indigo-500">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gross Revenue</p>
                                        <p className="text-3xl font-black text-gray-900">₹{metrics.stats.totalRevenue.toFixed(0)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Charts */}
                            {metrics?.chartData?.length > 0 && (
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                        <h3 className="text-lg font-black text-gray-800 mb-6">Revenue Trend (Last 7 Days)</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={metrics.chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} prefix="₹" />
                                                    <Tooltip cursor={{stroke: '#f3f4f6', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                                    <Line type="monotone" dataKey="dailyRevenue" stroke="#ff4d2d" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 8}} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                        <h3 className="text-lg font-black text-gray-800 mb-6">Order Volume</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={metrics.chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                                    <Bar dataKey="dailyOrders" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'verifications' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-3xl font-black text-gray-900">Pending Verifications</h1>
                                <button onClick={verifyAllExisting} className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all">
                                    Approve All Existing
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Unverified Shops */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h3 className="text-lg font-black text-gray-800">Restaurants</h3>
                                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{verifications.unverifiedShops.length} Pending</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {verifications.unverifiedShops.length === 0 ? (
                                            <p className="text-center text-gray-400 font-bold py-8">No pending restaurants</p>
                                        ) : (
                                            verifications.unverifiedShops.map(shop => (
                                                <div key={shop._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <img src={shop.image} alt={shop.name} className="w-12 h-12 rounded-xl object-cover" />
                                                        <div>
                                                            <p className="font-bold text-gray-900">{shop.name}</p>
                                                            <p className="text-xs text-gray-500">{shop.city} • Owner: {shop.owner?.fullName}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleVerifyShop(shop._id)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all">
                                                        <IoMdCheckmarkCircle size={20} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Unverified Riders */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h3 className="text-lg font-black text-gray-800">Delivery Partners</h3>
                                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{verifications.unverifiedBoys.length} Pending</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {verifications.unverifiedBoys.length === 0 ? (
                                            <p className="text-center text-gray-400 font-bold py-8">No pending partners</p>
                                        ) : (
                                            verifications.unverifiedBoys.map(boy => (
                                                <div key={boy._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{boy.fullName}</p>
                                                        <p className="text-xs text-gray-500">{boy.email} • {boy.mobile}</p>
                                                    </div>
                                                    <button onClick={() => handleVerifyRider(boy._id)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all">
                                                        <IoMdCheckmarkCircle size={20} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-3xl font-black text-gray-900 mb-6">Global Real-time Orders</h1>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4">Order ID</th>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Restaurant(s)</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Payment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-900">#{order._id.slice(-6)}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-gray-800">{order.user?.fullName}</p>
                                                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                                        {order.shopOrder.map(s => s.shop?.name).join(', ')}
                                                    </td>
                                                    <td className="px-6 py-4 font-black">₹{order.totalAmount?.toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                            {order.paymentMethod}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
