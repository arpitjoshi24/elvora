"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg("");

  // Validation
  if (!formData.name.trim()) {
    setErrorMsg("Please enter your full name.");
    return;
  }

  if (!formData.email.trim() || !formData.email.includes("@")) {
    setErrorMsg("Please enter a valid email address.");
    return;
  }

  // Backend requires minimum 8 characters
  if (formData.password.length < 8) {
    setErrorMsg("Password must be at least 8 characters long.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setErrorMsg("Passwords do not match. Please verify.");
    return;
  }

  if (!formData.agreedToTerms) {
    setErrorMsg("Please accept the terms and conditions to join Elvora.");
    return;
  }

  try {
    setIsLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed.");
    }

    setIsSuccess(true);

  } catch (error) {
    setErrorMsg(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDE5D8] px-4 py-12 md:py-16">
      <div className="w-full max-w-[480px]">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link href="/landing" className="inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-80">
            <img
              src="/images/Minimalist_Taupe_E-Swoosh_Logo-removebg-preview.png"
              alt=""
              className="h-10 w-10 object-contain"
            />
            <span className="font-kulim text-2xl font-bold tracking-[3px] text-[#6E5A4B]">
              ELVORA
            </span>
          </Link>

          <p className="mt-5 font-kulim text-[11px] font-semibold tracking-[3px] text-[#845F42]">
            CREATE YOUR ACCOUNT
          </p>
          <h1 className="mt-2 font-krona text-2xl uppercase tracking-tight text-[#241A14] md:text-3xl">
            Join Elvora
          </h1>
          <p className="mx-auto mt-3 max-w-sm font-kulim text-sm leading-relaxed text-[#6E5A4B]">
            Create an account to manage your orders, save your favourites, and stay close to new collections.
          </p>
        </div>

        {/* Registration Card */}
        <div className="mt-7 border border-[#6E4728]/20 bg-[#F8F3E9] p-6 md:p-9">
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="mx-auto grid h-12 w-12 place-items-center border border-[#6E4728]/30 text-2xl text-[#6E4728]">
                ✓
              </div>
              <h2 className="mt-5 font-krona text-xl uppercase text-[#241A14]">Welcome to Elvora</h2>
              <p className="mx-auto mt-3 max-w-xs font-kulim text-sm leading-relaxed text-[#6E5A4B]">
                Your account for <span className="font-semibold text-[#241A14]">{formData.email}</span> has been created.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/user_login"
                  className="bg-[#241A14] py-3.5 font-kulim text-xs font-semibold tracking-[2px] text-[#EDE5D8] transition-colors hover:bg-[#6E4728]"
                >
                  SIGN IN TO YOUR ACCOUNT
                </Link>
                <Link
                  href="/landing"
                  className="border border-[#6E4728]/35 py-3.5 font-kulim text-xs font-semibold tracking-[2px] text-[#241A14] transition-colors hover:bg-[#EDE5D8]"
                >
                  EXPLORE BOUTIQUE
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMsg && (
                <div className="border border-[#A65D4A]/35 bg-[#A65D4A]/5 px-3.5 py-3 font-kulim text-xs text-[#874331]">
                  {errorMsg}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="Name" className="block font-kulim text-[11px] font-semibold tracking-[1.8px] text-[#6E4728]">
                  FULL NAME
                </label>
                <input
                  type="text"
                  id="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="mt-2 w-full border border-[#6E4728]/25 bg-[#EDE5D8]/35 px-4 py-3 font-kulim text-sm text-[#241A14] placeholder-[#8B7A6B] outline-none transition-colors focus:border-[#845F42] focus:bg-[#F8F3E9]"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="Email" className="block font-kulim text-[11px] font-semibold tracking-[1.8px] text-[#6E4728]">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  id="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="mt-2 w-full border border-[#6E4728]/25 bg-[#EDE5D8]/35 px-4 py-3 font-kulim text-sm text-[#241A14] placeholder-[#8B7A6B] outline-none transition-colors focus:border-[#845F42] focus:bg-[#F8F3E9]"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="Password1" className="block font-kulim text-[11px] font-semibold tracking-[1.8px] text-[#6E4728]">
                  CREATE PASSWORD
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword1 ? "text" : "password"}
                    id="Password1"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full border border-[#6E4728]/25 bg-[#EDE5D8]/35 px-4 py-3 pr-14 font-kulim text-sm text-[#241A14] placeholder-[#8B7A6B] outline-none transition-colors focus:border-[#845F42] focus:bg-[#F8F3E9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword1(!showPassword1)}
                    className="absolute right-3 top-2.5 font-kulim text-[10px] font-semibold tracking-[1.5px] text-[#8B7A6B] hover:text-[#241A14]"
                  >
                    {showPassword1 ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="Password2" className="block font-kulim text-[11px] font-semibold tracking-[1.8px] text-[#6E4728]">
                  RE-ENTER PASSWORD
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword2 ? "text" : "password"}
                    id="Password2"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    required
                    className="w-full border border-[#6E4728]/25 bg-[#EDE5D8]/35 px-4 py-3 pr-14 font-kulim text-sm text-[#241A14] placeholder-[#8B7A6B] outline-none transition-colors focus:border-[#845F42] focus:bg-[#F8F3E9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-3 top-2.5 font-kulim text-[10px] font-semibold tracking-[1.5px] text-[#8B7A6B] hover:text-[#241A14]"
                  >
                    {showPassword2 ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="mt-1 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 border-[#6E4728]/40 accent-[#6E4728] cursor-pointer"
                />
                <label htmlFor="agreedToTerms" className="font-kulim text-xs leading-relaxed text-[#6E5A4B] cursor-pointer">
                  I agree to the Elvora Terms of Service, Privacy Policy, and to receive member preview updates.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-[#241A14] py-3.5 font-kulim text-xs font-semibold tracking-[2px] text-[#EDE5D8] transition-colors hover:bg-[#6E4728] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? "CREATING ACCOUNT..." : "REGISTER FOR ELVORA"}
              </button>

              {/* Switch to Login Link */}
              <div className="mt-4 border-t border-[#6E4728]/15 pt-5 text-center">
                <p className="font-kulim text-xs text-[#6E5A4B]">
                  Already have an account?{" "}
                  <Link
                    href="/user_login"
                    className="font-semibold text-[#6E4728] underline-offset-4 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
