"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserSideBar, {
  type UserSection,
} from "../../components/UserSideBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
}

const INITIAL_PROFILE: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export default function Page() {
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState<UserSection>("account");

  const [profile, setProfile] =
    useState<Profile>(INITIAL_PROFILE);

  const [addressId, setAddressId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // FETCH PROFILE AND ADDRESS
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      const [profileResponse, addressResponse] = await Promise.all([
        fetch(`${API_URL}/api/users/profile`, {
          method: "GET",
          credentials: "include",
        }),

        fetch(`${API_URL}/api/addresses`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      const profileData = await profileResponse.json();
      const addressData = await addressResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || "Unable to fetch profile."
        );
      }

      if (!addressResponse.ok) {
        throw new Error(
          addressData.message || "Unable to fetch addresses."
        );
      }

      // USER DETAILS
      const user = profileData.user;

      if (user) {
        const nameParts = (user.name || "").trim().split(/\s+/);

        setProfile((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" "),
          email: user.email || "",
          phone: user.number || "",
        }));
      }

      // ADDRESS DETAILS
      const addresses: Address[] = addressData.addresses || [];

      const defaultAddress =
        addresses.find((address) => address.isDefault) ||
        addresses[0];

      if (defaultAddress) {
        setAddressId(defaultAddress._id);

        const addressName = defaultAddress.fullName
          .trim()
          .split(/\s+/);

        setProfile((prev) => ({
          ...prev,
          firstName: prev.firstName || addressName[0] || "",
          lastName:
            prev.lastName ||
            addressName.slice(1).join(" "),
          phone: prev.phone || defaultAddress.phone,
          addressLine1: defaultAddress.addressLine || "",
          addressLine2: defaultAddress.landmark || "",
          city: defaultAddress.city || "",
          state: defaultAddress.state || "",
          pincode: defaultAddress.pincode || "",
          country: "India",
        }));
      } else {
        setAddressId(null);
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // INPUT HANDLER
  const updateProfile = (
    field: keyof Profile,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
    setSuccessMsg("");
  };

  // SAVE PROFILE AND ADDRESS
  const handleSaveProfile = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");
    setSaved(false);

    const fullName = [
      profile.firstName.trim(),
      profile.lastName.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    if (!fullName || !profile.email.trim()) {
      setErrorMsg("Please enter your name and email.");
      return;
    }

    try {
      setIsSaving(true);

      // 1. UPDATE USER PROFILE
      const profileResponse = await fetch(
        `${API_URL}/api/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: fullName,
            email: profile.email.trim(),
            number: profile.phone.trim(),
          }),
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || "Unable to update profile."
        );
      }

      // 2. SAVE ADDRESS IF USER ENTERED ADDRESS DETAILS
      const hasAddress = [
        profile.addressLine1,
        profile.city,
        profile.state,
        profile.pincode,
        profile.phone,
      ].some((value) => value.trim() !== "");

      if (hasAddress) {
        if (
          !profile.addressLine1.trim() ||
          !profile.city.trim() ||
          !profile.state.trim() ||
          !/^\d{6}$/.test(profile.pincode) ||
          !/^\d{10}$/.test(profile.phone)
        ) {
          throw new Error(
            "Please enter a complete address, a 10-digit phone number and a 6-digit PIN code."
          );
        }

        const addressPayload = {
          fullName,
          phone: profile.phone.trim(),
          addressLine: profile.addressLine1.trim(),
          landmark: profile.addressLine2.trim(),
          city: profile.city.trim(),
          state: profile.state.trim(),
          pincode: profile.pincode.trim(),
          addressType: "HOME",
        };

        const addressResponse = await fetch(
          addressId
            ? `${API_URL}/api/addresses/${addressId}`
            : `${API_URL}/api/addresses`,
          {
            method: addressId ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(addressPayload),
          }
        );

        const addressData = await addressResponse.json();

        if (!addressResponse.ok) {
          throw new Error(
            addressData.message || "Unable to save address."
          );
        }
      }

      setSaved(true);
      setSuccessMsg("Your profile has been updated successfully!");

      await fetchProfile();

      // Notify navbar about authentication state
      window.dispatchEvent(new Event("auth-change"));
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to logout.");
      }

      window.dispatchEvent(new Event("auth-change"));

      router.replace("/user_login");
      router.refresh();
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Unable to logout."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F3EBD7] text-[#241A14]">
      <section className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-7 md:px-9 md:py-12">

        {/* HEADER */}
        <div className="mb-8 border-b border-[#D7CEC2] pb-5">
          <p className="mb-2 font-kulim text-[11px] tracking-[3px] text-[#845F42]">
            MY ELVORA
          </p>

          <h1 className="font-krona text-2xl tracking-wide md:text-3xl">
            MY ACCOUNT
          </h1>

          <p className="mt-3 font-kulim text-sm text-[#6E5A4B]">
            Manage your account, orders and personal details.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">

          {/* SIDEBAR */}
          <UserSideBar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
          />

          {/* MAIN CONTENT */}
          <section className="min-h-[480px] min-w-0 border border-[#D7CEC2] bg-[#EDE5D8] p-5 sm:p-6 md:p-7">

            {/* LOADING */}
            {isLoading && activeSection === "account" && (
              <div className="py-20 text-center font-kulim text-[#845F42]">
                Loading your account...
              </div>
            )}

            {/* ERROR */}
            {errorMsg && (
              <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 font-kulim text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* SUCCESS */}
            {successMsg && (
              <div className="mb-5 border border-green-300 bg-green-50 px-4 py-3 font-kulim text-sm text-green-700">
                {successMsg}
              </div>
            )}

            {/* ACCOUNT SECTION */}
            {activeSection === "account" && !isLoading && (
              <div>
                <div className="mb-7 border-b border-[#D7CEC2] pb-5">
                  <p className="font-kulim text-[10px] tracking-[2px] text-[#845F42]">
                    PERSONAL INFORMATION
                  </p>

                  <h2 className="mt-2 font-krona text-xl">
                    Account Details
                  </h2>

                  <p className="mt-3 font-kulim text-sm text-[#6E5A4B]">
                    Update your personal information below.
                  </p>
                </div>

                <form
                  onSubmit={handleSaveProfile}
                  className="w-full"
                >
                  <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">

                    {/* FIRST NAME */}
                    <div>
                      <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                        First Name
                      </label>

                      <input
                        value={profile.firstName}
                        onChange={(e) =>
                          updateProfile("firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                        required
                        className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                      />
                    </div>

                    {/* LAST NAME */}
                    <div>
                      <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                        Last Name
                      </label>

                      <input
                        value={profile.lastName}
                        onChange={(e) =>
                          updateProfile("lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                        className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                      />
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                        Email Address
                      </label>

                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          updateProfile("email", e.target.value)
                        }
                        placeholder="Enter email address"
                        required
                        className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                      />
                    </div>

                    {/* PHONE */}
                    <div>
                      <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        maxLength={10}
                        value={profile.phone}
                        onChange={(e) =>
                          updateProfile(
                            "phone",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="Enter phone number"
                        className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                      />
                    </div>

                    {/* DELIVERY ADDRESS */}
                    <div className="mt-2 sm:col-span-2">
                      <p className="mb-4 font-kulim text-xs font-semibold tracking-[1.5px] text-[#6E4728]">
                        DELIVERY ADDRESS
                      </p>

                      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">

                        {/* ADDRESS LINE 1 */}
                        <div className="sm:col-span-2">
                          <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                            Address Line 1
                          </label>

                          <input
                            value={profile.addressLine1}
                            onChange={(e) =>
                              updateProfile("addressLine1", e.target.value)
                            }
                            placeholder="House no., building, street, area"
                            className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                          />
                        </div>

                        {/* ADDRESS LINE 2 */}
                        <div className="sm:col-span-2">
                          <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                            Address Line 2 (Optional)
                          </label>

                          <input
                            value={profile.addressLine2}
                            onChange={(e) =>
                              updateProfile("addressLine2", e.target.value)
                            }
                            placeholder="Landmark, apartment, floor, etc."
                            className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                          />
                        </div>

                        {/* CITY */}
                        <div>
                          <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                            City
                          </label>

                          <input
                            value={profile.city}
                            onChange={(e) =>
                              updateProfile("city", e.target.value)
                            }
                            placeholder="Enter city"
                            className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                          />
                        </div>

                        {/* STATE */}
                        <div>
                          <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                            State
                          </label>

                          <input
                            value={profile.state}
                            onChange={(e) =>
                              updateProfile("state", e.target.value)
                            }
                            placeholder="Enter state"
                            className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                          />
                        </div>

                        {/* PINCODE */}
                        <div>
                          <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                            PIN Code
                          </label>

                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={profile.pincode}
                            onChange={(e) =>
                              updateProfile(
                                "pincode",
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                            placeholder="6-digit PIN code"
                            className="w-full border border-[#C8BBA9] bg-[#F3EBD7] px-4 py-3 font-kulim text-sm outline-none focus:border-[#6E4728]"
                          />
                        </div>

                        {/* COUNTRY */}
                        <div>
                          <label className="mb-2 block font-kulim text-xs text-[#6E4728]">
                            Country
                          </label>

                          <input
                            value={profile.country}
                            readOnly
                            className="w-full border border-[#C8BBA9] bg-[#E5DCCB] px-4 py-3 font-kulim text-sm outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SAVE BUTTON */}
                  <div className="mt-7 flex flex-wrap items-center gap-5">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#241A14] px-8 py-3 font-kulim text-xs tracking-[2px] text-[#F3EBD7] transition-colors hover:bg-[#6E4728] disabled:opacity-50"
                    >
                      {isSaving ? "SAVING..." : "SAVE CHANGES"}
                    </button>

                    {saved && (
                      <span className="font-kulim text-sm text-green-700">
                        Changes saved successfully!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* WISHLIST SECTION */}
            {activeSection === "wishlist" && (
              <div>
                <div className="mb-7 border-b border-[#D7CEC2] pb-5">
                  <p className="font-kulim text-[10px] tracking-[2px] text-[#845F42]">
                    YOUR COLLECTION
                  </p>

                  <h2 className="mt-2 font-krona text-xl">
                    Wishlist
                  </h2>
                </div>

                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                  <h3 className="font-kulim text-lg">
                    Your wishlist
                  </h3>

                  <p className="mt-2 font-kulim text-sm text-[#845F42]">
                    Your saved products will appear here.
                  </p>

                  <Link
                    href="/wish_list"
                    className="mt-7 border border-[#241A14] px-7 py-3 font-kulim text-xs tracking-[2px] hover:bg-[#241A14] hover:text-[#F3EBD7]"
                  >
                    VIEW WISHLIST
                  </Link>
                </div>
              </div>
            )}

            {/* ORDERS SECTION */}
            {activeSection === "orders" && (
              <div>
                <div className="mb-7 border-b border-[#D7CEC2] pb-5">
                  <p className="font-kulim text-[10px] tracking-[2px] text-[#845F42]">
                    PURCHASE HISTORY
                  </p>

                  <h2 className="mt-2 font-krona text-xl">
                    My Orders
                  </h2>
                </div>

                <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                  <h3 className="font-kulim text-lg">
                    Your Orders
                  </h3>

                  <p className="mt-2 font-kulim text-sm text-[#845F42]">
                    Your order history will appear here.
                  </p>

                  <Link
                    href="/product_page"
                    className="mt-7 border border-[#241A14] px-7 py-3 font-kulim text-xs tracking-[2px] hover:bg-[#241A14] hover:text-[#F3EBD7]"
                  >
                    START SHOPPING
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}