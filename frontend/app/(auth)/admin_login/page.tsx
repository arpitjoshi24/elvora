"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [errorMsg, setErrorMsg] = useState("");
const [isLoading, setIsLoading] = useState(false);

// ADMIN LOGIN FUNCTION
const handleAdminLogin = async (
e: React.FormEvent<HTMLFormElement>
) => {
e.preventDefault();


setErrorMsg("");

if (!email.trim() || !password) {
  setErrorMsg("Please enter your email and password.");
  return;
}

try {
  setIsLoading(true);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }

  // CHECK ADMIN ROLE
  if (data.user?.role !== "ADMIN") {
    throw new Error("Access denied! Only administrators can log in here.");
  }

  // SUCCESSFUL ADMIN LOGIN
  router.replace("/admin_dashboard");
  router.refresh();

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

return ( <div className="flex min-h-screen w-full items-center justify-center bg-[#F4EFE6] px-5 py-10">


  <div className="w-full max-w-md border border-[#D5C2A9] bg-[#F8F5F0] px-8 py-10 shadow-lg md:px-12">

    {/* HEADING */}
    <h1 className="text-center font-serif text-3xl font-bold tracking-widest text-[#4A2A02]">
      ELVORA ADMIN
    </h1>

    <p className="mt-3 text-center text-sm tracking-wider text-[#8A7356]">
      ADMINISTRATOR LOGIN
    </p>

    {/* LOGIN FORM */}
    <form
      className="mt-8 flex flex-col gap-5"
      onSubmit={handleAdminLogin}
    >

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* EMAIL */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold tracking-wide text-[#4A2A02]"
        >
          ADMIN EMAIL
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter admin email"
          className="w-full border border-[#D5C2A9] bg-white px-4 py-3 text-sm text-[#4A2A02] outline-none focus:border-[#8A7356] focus:ring-1 focus:ring-[#8A7356]"
        />
      </div>

      {/* PASSWORD */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold tracking-wide text-[#4A2A02]"
        >
          PASSWORD
        </label>

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter admin password"
            className="w-full border border-[#D5C2A9] bg-white px-4 py-3 pr-12 text-sm text-[#4A2A02] outline-none focus:border-[#8A7356] focus:ring-1 focus:ring-[#8A7356]"
          />

          {/* SHOW / HIDE PASSWORD */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A7356] hover:text-[#4A2A02]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c5 0 9 5 10 7a13 13 0 0 1-4 4.5" />
                <path d="M6.6 6.6A13 13 0 0 0 2 12s4 7 10 7a9.8 9.8 0 0 0 4-.8" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full bg-[#8A7356] py-3 text-sm font-bold tracking-widest text-white transition duration-300 hover:bg-[#4A2A02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "LOGGING IN..." : "LOG IN"}
      </button>

    </form>

    {/* BACK TO STORE */}
    <p className="mt-7 text-center text-sm text-[#6B4423]">
      <Link
        href="/"
        className="font-bold text-[#8A7356] hover:underline"
      >
        ← Back to store
      </Link>
    </p>

  </div>
</div>


);
}
