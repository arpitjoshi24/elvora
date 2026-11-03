"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  _id: string;
  name: string;
  email: string;
  number?: string;
  role: string;
  createdAt?: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // SEARCH
  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return users;

    return users.filter((user) =>
      [
        user._id,
        user.name,
        user.email,
        user.role,
        user.number || "",
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [search, users]);

  const customerCount = users.filter(
    (user) => user.role === "USER"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  // DELETE USER
  const deleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      setDeletingId(user._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((prev) =>
        prev.filter((item) => item._id !== user._id)
      );

      if (selectedUser?._id === user._id) {
        setSelectedUser(null);
      }

      setSuccess("User deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // DATE FORMAT
  const formatDate = (date?: string) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 text-[#241A14]">

      {/* PAGE HEADER */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-[1px] w-8 bg-[#A17C58]" />
            <p className="text-[11px] font-semibold uppercase tracking-[3px] text-[#95775B]">
              Customer Management
            </p>
          </div>

          <h1 className="font-kulim text-3xl font-semibold tracking-tight sm:text-4xl">
            Manage Users
          </h1>

          <p className="mt-2 text-sm text-[#8A7867]">
            Manage your customers and keep track of registered accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 self-start rounded-lg border border-[#D8CABC] bg-[#FFFCF7] px-5 py-3 text-sm font-medium text-[#735438] shadow-sm transition hover:border-[#92704F] hover:bg-[#F1E8DC] disabled:opacity-50 sm:self-auto"
        >
          <svg
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M20 7v5h-5M4 17v-5h5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {loading ? "Refreshing..." : "Refresh Data"}
        </button>

      </section>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
            ✓
          </span>
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
            !
          </span>
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

        {/* TOTAL USERS */}
        <div className="group relative overflow-hidden rounded-2xl border border-[#E3D8CA] bg-[#FFFCF7] p-6 shadow-[0_3px_15px_rgba(69,48,28,0.04)] transition hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-[#8D7966]">
                Total Users
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#35271C]">
                {loading ? "—" : users.length}
              </h2>

              <p className="mt-2 text-xs text-[#A18B75]">
                All registered accounts
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFE5D8] text-[#876344]">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                />
              </svg>
            </div>

          </div>

          <div className="absolute bottom-0 left-0 h-1 w-full bg-[#B99A77]" />
        </div>

        {/* CUSTOMERS */}
        <div className="group relative overflow-hidden rounded-2xl border border-[#E3D8CA] bg-[#FFFCF7] p-6 shadow-[0_3px_15px_rgba(69,48,28,0.04)] transition hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-[#8D7966]">
                Customers
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#35271C]">
                {loading ? "—" : customerCount}
              </h2>

              <p className="mt-2 text-xs text-[#A18B75]">
                Registered customer accounts
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7EDE2] text-[#657C58]">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m17 0v-2a4 4 0 0 0-3-3.87M15 4.13a4 4 0 0 1 0 7.75M13 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                />
              </svg>
            </div>

          </div>

          <div className="absolute bottom-0 left-0 h-1 w-full bg-[#899C7C]" />
        </div>

        {/* ADMINS */}
        <div className="group relative overflow-hidden rounded-2xl border border-[#E3D8CA] bg-[#FFFCF7] p-6 shadow-[0_3px_15px_rgba(69,48,28,0.04)] transition hover:-translate-y-1 hover:shadow-lg sm:col-span-2 xl:col-span-1">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-[#8D7966]">
                Administrators
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#35271C]">
                {loading ? "—" : adminCount}
              </h2>

              <p className="mt-2 text-xs text-[#A18B75]">
                Admin accounts
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAE4EF] text-[#77618D]">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 12 2 2 4-4"
                />
              </svg>
            </div>

          </div>

          <div className="absolute bottom-0 left-0 h-1 w-full bg-[#9A86AD]" />
        </div>

      </section>

      {/* USERS TABLE CONTAINER */}
      <section className="overflow-hidden rounded-2xl border border-[#E3D8CA] bg-[#FFFCF7] shadow-[0_4px_20px_rgba(69,48,28,0.04)]">

        {/* TABLE HEADER */}
        <div className="flex flex-col gap-5 border-b border-[#EAE1D6] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-[#35271C]">
              All Users
            </h2>

            <p className="mt-1 text-xs text-[#A18B75]">
              A list of all accounts registered on Elvora.
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:max-w-[350px]">

            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A18B75]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" strokeLinecap="round" />
            </svg>

            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#E3D8CA] bg-[#FAF7F1] py-3 pl-11 pr-4 text-sm text-[#35271C] outline-none transition placeholder:text-[#B19E8B] focus:border-[#987654] focus:ring-2 focus:ring-[#987654]/10"
            />

          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px] text-left">

            <thead>
              <tr className="bg-[#F4EEE5]">

                {[
                  "USER",
                  "EMAIL ADDRESS",
                  "PHONE",
                  "ROLE",
                  "ACTIONS",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-[10px] font-semibold tracking-[1.5px] text-[#90775D]"
                  >
                    {heading}
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm text-[#957D65]"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D9C8B5] border-t-[#805C3C]" />
                      Fetching registered users...
                    </div>
                  </td>
                </tr>

              ) : filteredUsers.length > 0 ? (

                filteredUsers.map((user) => (

                  <tr
                    key={user._id}
                    className="border-b border-[#F0E9DF] transition-colors last:border-0 hover:bg-[#FAF6EF]"
                  >

                    {/* USER */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E2D3C1] bg-[#EEE4D7] text-sm font-semibold text-[#805C3C]">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#35271C]">
                            {user.name}
                          </p>

                          <p className="mt-1 text-[11px] text-[#AA967F]">
                            ID: {user._id.slice(-8)}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-5 text-sm text-[#78634E]">
                      {user.email}
                    </td>

                    {/* PHONE */}
                    <td className="px-6 py-5 text-sm text-[#78634E]">
                      {user.number || "—"}
                    </td>

                    {/* ROLE */}
                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-[#EEE8F3] text-[#78618B]"
                            : "bg-[#E9EFE4] text-[#657C58]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-[#9077A7]"
                              : "bg-[#829C72]"
                          }`}
                        />

                        {user.role === "ADMIN" ? "Admin" : "Customer"}
                      </span>

                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() => setSelectedUser(user)}
                          className="rounded-lg border border-[#DCCDBD] px-4 py-2 text-xs font-medium text-[#76583C] transition hover:border-[#8B6A49] hover:bg-[#F0E6D9]"
                        >
                          View
                        </button>

                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => deleteUser(user)}
                            disabled={deletingId === user._id}
                            className="rounded-lg border border-[#E8D4CE] px-4 py-2 text-xs font-medium text-[#A15D4C] transition hover:bg-[#F8EAE6] disabled:opacity-50"
                          >
                            {deletingId === user._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E9DF] text-[#A18B75]">
                        <svg
                          className="h-7 w-7"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="m16 16 4 4" />
                        </svg>
                      </div>

                      <p className="text-sm font-semibold text-[#654A31]">
                        No users found
                      </p>

                      <p className="mt-1 text-xs text-[#A18B75]">
                        Try searching with another name or email.
                      </p>
                    </div>
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* TABLE FOOTER */}
        <div className="flex flex-col gap-2 border-t border-[#EAE1D6] bg-[#FCFAF6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-[#927C65]">
            Showing{" "}
            <span className="font-semibold text-[#503B29]">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#503B29]">
              {users.length}
            </span>{" "}
            users
          </p>

          <p className="text-[10px] font-semibold tracking-[2px] text-[#B19D87]">
            ELVORA ADMINISTRATION
          </p>

        </div>

      </section>

      {/* USER DETAILS MODAL */}
      {selectedUser && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#241A14]/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E3D8CA] bg-[#FFFCF7] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#EAE1D6] px-6 py-5">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#A18B75]">
                  Account Information
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#35271C]">
                  User Details
                </h2>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1E9DF] text-xl text-[#806448] transition hover:bg-[#E8DCCB]"
              >
                &times;
              </button>

            </div>

            {/* PROFILE */}
            <div className="px-6 py-7">

              <div className="mb-7 flex flex-col items-center text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#E9DFD2] bg-[#EEE4D7] text-2xl font-semibold text-[#805C3C]">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>

                <h3 className="mt-4 text-lg font-semibold text-[#35271C]">
                  {selectedUser.name}
                </h3>

                <p className="mt-1 text-sm text-[#957D65]">
                  {selectedUser.email}
                </p>

                <span
                  className={`mt-3 rounded-full px-4 py-1.5 text-xs font-semibold ${
                    selectedUser.role === "ADMIN"
                      ? "bg-[#EEE8F3] text-[#78618B]"
                      : "bg-[#E9EFE4] text-[#657C58]"
                  }`}
                >
                  {selectedUser.role === "ADMIN" ? "Administrator" : "Customer"}
                </span>

              </div>

              {/* DETAILS */}
              <div className="space-y-4 rounded-xl border border-[#EAE1D6] bg-[#FAF7F1] p-5">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#A18B75]">
                    User ID
                  </p>

                  <p className="mt-1 break-all text-xs text-[#604B36]">
                    {selectedUser._id}
                  </p>
                </div>

                <div className="h-px bg-[#E9DFD2]" />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#A18B75]">
                    Phone Number
                  </p>

                  <p className="mt-1 text-sm text-[#604B36]">
                    {selectedUser.number || "Not provided"}
                  </p>
                </div>

                <div className="h-px bg-[#E9DFD2]" />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#A18B75]">
                    Registration Date
                  </p>

                  <p className="mt-1 text-sm text-[#604B36]">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>

              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="mt-6 w-full rounded-xl bg-[#806044] py-3 text-sm font-medium text-white transition hover:bg-[#65482E]"
              >
                Close Details
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}