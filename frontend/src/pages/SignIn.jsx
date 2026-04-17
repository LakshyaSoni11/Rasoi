import React, { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData, triggerRefresh } from "../redux/userSlice";

const SignIn = () => {
  const primarycolor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(res.data.user))
      dispatch(triggerRefresh())
      if (res.status === 200) {
        alert(res.data.message);
        navigate("/");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: bgColor,
        "--primary": primarycolor,
        "--hover": hoverColor,
        "--border": borderColor,
      }}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border"
        style={{ borderColor: `var(--border)` }}
      >
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: `var(--primary)` }}
        >
          Rasoi
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Welcome back! glad to see you again
        </p>
        <form onSubmit={handleSignIn}>
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
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: `var(--border)`,
                "--tw-ring-color": `var(--primary)`,
              }}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div className="mb-4 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: `var(--border)`,
                  "--tw-ring-color": `var(--primary)`,
                }}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
              </button>
              <p
                className="text-[#ff4d2d] capitalize text-sm text-right cursor-pointer hover:underline transition-colors duration-300"
                onClick={() => navigate("/forgot-password")}
              >
                forgot password
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg transition-colors duration-300 cursor-pointer"
            style={{ backgroundColor: `var(--primary)` }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = `var(--hover)`)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = `var(--primary)`)
            }
          >
            Sign In
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
          >
            <FcGoogle size={22} />
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium hover:underline"
              style={{ color: `var(--primary)` }}
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
