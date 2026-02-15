import React from "react";
import { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async () =>{
    try {
        const result = await axios.post(`${serverUrl}/api/auth/send-otp`, {email},{withCredentials:true})
        console.log(result)
        setStep(2)
    } catch (error) {
      console.log(error)
    }
  }

  const handleVerifyOtp = async () =>{
    try {
        const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, {email, otp},{withCredentials:true})
        console.log(result)
        setStep(3)
    } catch (error) {
      console.log(error)
    }
  }

  const handleResetPassword = async () =>{
    if(password !== confirmPassword){
      alert("Password does not match")
      return
    }
    try {
        const result = await axios.post(`${serverUrl}/api/auth/reset-password`, {email, password, confirmPassword},{withCredentials:true})
        console.log(result)
        navigate('/signin')
    } catch (error) {
      console.log(error)
    }
  }


  
  return (
    <div className="w-full flex items-center justify-center min-h-screen p-4 bg-[#fff9f6] ">
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-4 text-[#ff4d2d]">
          <IoMdArrowRoundBack size={30} className="cursor-pointer" onClick={()=>navigate('/signin')}/>

          <h1 className="text-2xl font-semibold text-center">
            Forgot Password
          </h1>
        </div>
        {step == 1 && (
         <div>
          <div className="mb-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none  "
         
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
            <button 
                    type='submit' 
                    className='w-full text-white py-2 rounded-lg transition-colors duration-300 cursor-pointer bg-[#ff4d2d]' 
                    onClick={()=>handleSendOtp()}                 
                >
                    Send Otp
                </button>
         </div>
        )}
         {step == 2 && (
        <div>
            <div className="mb-2">
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              OTP
            </label>
            <input
              type="text"
              id="otp"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none  "
         
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              required
            />
          </div>
            <button 
                    type='submit' 
                    className='w-full bg-[#ff4d2d] text-white py-2 rounded-lg transition-colors duration-300 cursor-pointer'
                    onClick={()=>handleVerifyOtp()}                 
                >
                    Verify Otp
                </button>
        </div>
        )}
         {step == 3 && (
          <div>

          <div className="mb-2">
            <label
              htmlFor="new password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="new password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none  "
         
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
            <div className="mb-2">
            <label
              htmlFor="confirm password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none  "
         
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              required
            />
          </div>
            <button 
                    type='submit' 
                    className='w-full bg-[#ff4d2d] text-white py-2 rounded-lg transition-colors duration-300 cursor-pointer'                  
                    onClick={()=>handleResetPassword()}                 
                >
                    Reset Password
                </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
