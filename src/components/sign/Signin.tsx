"use client";

import { useState } from "react";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    investment: "",
    income: "",
    password: "",
    confirmPassword: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16">
        <h1 className="text-2xl font-bold mb-6">Get Started Now</h1>
        <p className="text-gray-400 mb-6">
          Sign in to start your journey at Trade Agency
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:border-cyan-400 outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:border-cyan-400 outline-none"
          />
          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title"
            value={formData.jobTitle}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:border-cyan-400 outline-none"
          />

          <div className="flex gap-4">
            <input
              type="text"
              name="investment"
              placeholder="Investment Amount"
              value={formData.investment}
              onChange={handleChange}
              className="w-1/2 p-3 rounded-md bg-gray-900 border border-gray-700 focus:border-cyan-400 outline-none"
            />
            <input
              type="text"
              name="income"
              placeholder="Current Income"
              value={formData.income}
              onChange={handleChange}
              className="w-1/2 p-3 rounded-md bg-gray-900 border border-gray-700 focus:border-cyan-400 outline-none"
            />
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:border-cyan-400 outline-none"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:border-cyan-400 outline-none"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="w-4 h-4 accent-cyan-400"
            />
            <label className="text-gray-400 text-sm">Remember me</label>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-400 text-black font-semibold py-3 rounded-md hover:bg-cyan-500 transition"
          >
            Create Account
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center border border-gray-700 py-3 rounded-md hover:bg-gray-800 transition"
          >
            <span className="mr-2 text-red-500">G</span> Sign Up with Google
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-4">
          Already have an account?{" "}
          <a href="#" className="text-cyan-400 hover:underline">
            Log in
          </a>
        </p>
      </div>

      {/* Right Placeholder */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-900">
        <div className="w-3/4 h-3/4 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500">
          Placeholder for Image/Chart
        </div>
      </div>
    </div>
  );
}
