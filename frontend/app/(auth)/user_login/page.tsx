"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
const router = useRouter();

const [showPassword, setShowPassword] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [errorMsg, setErrorMsg] = useState("");
const [isLoading, setIsLoading] = useState(false);

// LOGIN FUNCTION
const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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
    throw new Error(data.message || "Login failed. Please try again.");
  }

  // Successful login: redirect to home page
  window.dispatchEvent(new Event("auth-change"));
  router.replace("/");
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

return ( <div className="min-h-screen w-full flex justify-center items-center bg-[#F4EFE6] px-5 py-10">

```
  {/* LOGIN CARD */}
  <div className="w-full max-w-md bg-[#F8F5F0] border border-[#D5C2A9] shadow-lg px-8 py-10 md:px-12">

    {/* LOGO */}
    <div className="flex justify-center">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#8A7356] bg-white">
        <Image
          src="/images/logo.jpeg"
          alt="Elvora Logo"
          width={80}
          height={80}
          className="w-full h-full object-cover rounded-full"
          priority
        />
      </div>
    </div>

    {/* WEBSITE NAME */}
    <div className="mt-4 flex justify-center">
      <h2 className="font-serif font-bold text-center text-3xl tracking-widest text-[#4A2A02]">
        ELVORA
      </h2>
    </div>

    {/* TAGLINE */}
    <p className="text-center text-sm tracking-widest text-[#8A7356] mt-2">
      STYLE THAT SPEAKS
    </p>

    {/* HEADING */}
    <h1 className="mt-8 text-3xl text-center font-serif text-[#4A2A02]">
      Welcome Back!
    </h1>

    <p className="text-center text-sm text-[#8A7356] mt-2">
      Sign in to continue your style journey.
    </p>

    {/* LOGIN FORM */}
    <form className="mt-8" onSubmit={handleLogin}>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* EMAIL */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold tracking-wide text-[#4A2A02]"
        >
          E-MAIL*
        </label>

        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="mt-2 w-full bg-[#E5DED3] border border-[#C9B8A5] px-4 py-3 text-[#4A2A02] placeholder:text-[#8A7356] outline-none focus:ring-2 focus:ring-[#8A7356]"
        />
      </div>

      {/* PASSWORD */}
      <div className="mt-5">
        <label
          htmlFor="password"
          className="block text-sm font-semibold tracking-wide text-[#4A2A02]"
        >
          PASSWORD*
        </label>

        <div className="relative mt-2">

          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full bg-[#E5DED3] border border-[#C9B8A5] px-4 py-3 pr-12 text-[#4A2A02] placeholder:text-[#8A7356] outline-none focus:ring-2 focus:ring-[#8A7356]"
          />

          {/* SHOW / HIDE PASSWORD BUTTON */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A7356] hover:text-[#4A2A02] transition cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (

              /* EYE OFF ICON */
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

              /* EYE ICON */
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

      {/* FORGOT PASSWORD */}
      <div className="flex justify-end mt-3">
        <Link
          href="/forgot-password"
          className="text-sm text-[#8A7356] hover:text-[#4A2A02] hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full bg-[#8A7356] py-3 text-sm font-bold tracking-widest text-white hover:bg-[#4A2A02] transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? "LOGGING IN..." : "LOG IN"}
      </button>

    </form>

    {/* REGISTER LINK */}
    <p className="mt-7 text-center text-sm text-[#6B4423]">
      Don't have an account?{" "}
      <Link
        href="/user_register"
        className="font-bold text-[#8A7356] hover:text-[#4A2A02] hover:underline"
      >
        Register Here
      </Link>
    </p>

    {/* FOOTER */}
    <div className="border-t border-[#D5C2A9] mt-8 pt-5">
      <p className="text-center text-xs tracking-wider text-[#8A7356]">
        © 2026 ELVORA. ALL RIGHTS RESERVED.
      </p>
    </div>

  </div>
</div>

);
}
