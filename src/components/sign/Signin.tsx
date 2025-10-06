"use client";

import { useState } from "react";
import Image from "next/image";

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
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Left Form Section */}
      <div className="flex-1 w-full md:w-1/2 flex flex-col gap-2 py-4 justify-center px-8 md:px-16">
        <div className="flex items-center gap-2">
          <Image
            loading="lazy"
            src="/logo.svg"
            alt="logo"
            width={70}
            height={70}
          />
          <h1 className="text-xl font-bold">Trading Agents</h1>
        </div>
        <h1 className="text-3xl font-bold">Get Started Now</h1>
        <p className="text-[#858585]">
          Sign in to start your journey at Trade Agency
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="text-[white] text-base">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none"
          />
          <label className="text-[white] text-base">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none"
          />
          <label className="text-[white] text-base">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title"
            value={formData.jobTitle}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none"
          />

          <div className="flex gap-4">
            <div className="flex flex-col">
              <label className="text-[white] text-base">
                Investment Amount
              </label>
              <input
                type="text"
                name="investment"
                placeholder="Investment Amount"
                value={formData.investment}
                onChange={handleChange}
                className="p-3 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[white] text-base">Current Income</label>
              <input
                type="text"
                name="income"
                placeholder="Current Income"
                value={formData.income}
                onChange={handleChange}
                className="p-3 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none"
              />
            </div>
          </div>

          <label className="text-[white] text-base">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none"
          />
          <label className="text-[white] text-base">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl border border-white/10 focus:border-cyan-400 outline-none"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="w-4 h-4 accent-cyan-400 outline-none"
            />
            <label className="text-[#858585] text-base">Remember me</label>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-400 text-black font-semibold py-3 rounded-2xl hover:bg-cyan-500 transition"
          >
            Create Account
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center border border-white/10 py-3 rounded-2xl hover:bg-gray-800 transition"
          >
            <span className="mr-2 text-red-500">G</span> Sign Up with Google
          </button>
        </form>

        <p className="text-[white] text-base mt-4">
          Already have an account?{" "}
          <a href="#" className="text-cyan-400 hover:underline">
            Log in
          </a>
        </p>
      </div>

      {/* Right Placeholder */}
      <div className="flex-2 flex flex-col bg-amber-600">
        <div className="flex-3 ">
          {/* <Image
            src="/signinimg.png"
            alt="signin"
            className=""
            width={800}
            height={800}
          /> */}
        </div>

        <div className="flex flex-col gap-2 flex-1 items-center text-center">
          <h1 className="text-4xl font-bold">Introducing Trading Agents</h1>
          <p className="text-base max-w-2/3">
            Discover smarter opportunities, test real strategies safely, and let
            AI guide your trading journey with confidence.
          </p>
        </div>
      </div>
    </div>
  );
}
