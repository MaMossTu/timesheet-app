"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let success;
      if (isLogin) {
        success = await login(formData.username, formData.password);
      } else {
        success = await register(
          formData.email,
          formData.password,
          formData.name
        );
      }

      if (success) {
        router.push("/");
      } else {
        setError(
          isLogin
            ? "Username หรือ password ไม่ถูกต้อง"
            : "เกิดข้อผิดพลาดในการสมัครสมาชิก"
        );
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Time Tracker
          </h1>
          <p className="text-gray-700 font-medium">
            {isLogin ? "Sign In" : "Sign Up"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              {isLogin ? "Username" : "Email"}
            </label>
            <div className="relative">
              {isLogin ? (
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              ) : (
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              )}
              <input
                type={isLogin ? "text" : "email"}
                name={isLogin ? "username" : "email"}
                value={isLogin ? formData.username : formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder={
                  isLogin ? "Enter your username" : "Enter your email"
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-700 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({
                  username: "",
                  email: "",
                  password: "",
                  name: "",
                });
              }}
              className="text-blue-600 font-medium hover:text-blue-700 underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
