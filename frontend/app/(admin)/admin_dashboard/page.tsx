"use client";

import React, { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Order = {
  _id: string;
  user?: {
    name?: string;
    email?: string;
  };
  totalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
};

type DashboardStats = {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
};

export default function Page() {
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH DASHBOARD DATA
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/orders`, {
          credentials: "include",
        }),

        fetch(`${API_URL}/api/products`, {
          credentials: "include",
        }),

        fetch(`${API_URL}/api/admin/users`, {
          credentials: "include",
        }),
      ]);

      const [ordersData, productsData, usersData] =
        await Promise.all([
          ordersRes.json(),
          productsRes.json(),
          usersRes.json(),
        ]);

      if (!ordersRes.ok) {
        throw new Error(
          ordersData.message || "Unable to fetch orders"
        );
      }

      if (!productsRes.ok) {
        throw new Error(
          productsData.message || "Unable to fetch products"
        );
      }

      if (!usersRes.ok) {
        throw new Error(
          usersData.message || "Unable to fetch customers"
        );
      }

      // Handle common response formats
      const orders: Order[] =
        ordersData.orders || ordersData.data?.orders || [];

      const products =
        productsData.products || productsData.data?.products || [];

      const users =
        usersData.users || usersData.data?.users || [];

      // Calculate revenue from orders
      const revenue = orders
        .filter(
          (order) =>
            order.orderStatus !== "CANCELLED"
        )
        .reduce(
          (total, order) =>
            total + Number(order.totalAmount || 0),
          0
        );

      setStats({
        revenue,
        orders: orders.length,
        products: products.length,
        customers: users.filter(
          (user: { role?: string }) => user.role !== "ADMIN"
        ).length,
      });

      // Latest five orders
      const sortedOrders = [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setRecentOrders(sortedOrders.slice(0, 5));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // FORMAT PRICE
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  // STATUS COLORS
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";

      case "SHIPPED":
        return "bg-blue-100 text-blue-800";

      case "PROCESSING":
      case "PLACED":
      case "CONFIRMED":
        return "bg-amber-100 text-amber-800";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-stone-100 text-stone-700";
    }
  };

  const statusCounts = [
    {
      label: "Processing",
      value: recentOrders.length === 0
        ? 0
        : recentOrders.filter(
            (o) =>
              o.orderStatus === "PROCESSING" ||
              o.orderStatus === "PLACED" ||
              o.orderStatus === "CONFIRMED"
          ).length,
    },
    {
      label: "Shipped",
      value: recentOrders.filter(
        (o) => o.orderStatus === "SHIPPED"
      ).length,
    },
    {
      label: "Delivered",
      value: recentOrders.filter(
        (o) => o.orderStatus === "DELIVERED"
      ).length,
    },
    {
      label: "Cancelled",
      value: recentOrders.filter(
        (o) => o.orderStatus === "CANCELLED"
      ).length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#EDE5D8] p-6 md:p-10">

      {/* HEADER */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#241A14]/15 pb-6">
        <div>
          <p className="text-[11px] font-medium tracking-[1.5px] text-[#845F42]">
            ELVORA ADMIN PANEL
          </p>

          <h1 className="mt-1 font-krona text-2xl uppercase text-[#4A2A02] md:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#6E5A4B]">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="bg-[#241A14] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#845F42] disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh Data"}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-[#845F42]">
          Loading dashboard data...
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="TOTAL REVENUE"
              value={formatPrice(stats.revenue)}
              icon="₹"
              description="From non-cancelled orders"
            />

            <StatCard
              title="TOTAL ORDERS"
              value={stats.orders.toString()}
              icon="▤"
              description="All customer orders"
            />

            <StatCard
              title="TOTAL PRODUCTS"
              value={stats.products.toString()}
              icon="◇"
              description="Products in your store"
            />

            <StatCard
              title="TOTAL CUSTOMERS"
              value={stats.customers.toString()}
              icon="♙"
              description="Registered customers"
            />

          </div>

          {/* ORDER OVERVIEW */}
          <div className="mb-8 border border-[#241A14]/15 bg-[#F3EBD7] p-6">

            <div className="mb-6">
              <p className="text-[10px] font-medium tracking-[1.5px] text-[#845F42]">
                ORDER ANALYTICS
              </p>

              <h2 className="mt-1 font-krona text-lg text-[#241A14]">
                Order Overview
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {statusCounts.map((item) => (
                <div
                  key={item.label}
                  className="border-l-2 border-[#845F42] pl-4"
                >
                  <p className="text-xs text-[#6E5A4B]">
                    {item.label}
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#241A14]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-[#8B7A6B]">
              Status overview is based on the five most recent orders.
            </p>
          </div>

          {/* RECENT ORDERS */}
          <div className="border border-[#241A14]/15 bg-[#F3EBD7]">

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#241A14]/15 p-6">
              <div>
                <p className="text-[10px] font-medium tracking-[1.5px] text-[#845F42]">
                  RECENT ACTIVITY
                </p>

                <h2 className="mt-1 font-krona text-lg text-[#241A14]">
                  Recent Orders
                </h2>
              </div>

              <a
                href="/admin/orders"
                className="text-xs font-medium text-[#845F42] underline underline-offset-4 hover:text-[#241A14]"
              >
                View All Orders →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">

                <thead className="bg-[#241A14] text-[#F3EBD7]">
                  <tr>
                    <th className="px-5 py-4 text-xs">Order ID</th>
                    <th className="px-5 py-4 text-xs">Customer</th>
                    <th className="px-5 py-4 text-xs">Date</th>
                    <th className="px-5 py-4 text-xs">Amount</th>
                    <th className="px-5 py-4 text-xs">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#241A14]/10 text-[#3A3028]">

                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-[#EDE5D8]"
                      >
                        <td className="px-5 py-4 font-mono text-xs font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-[#241A14]">
                            {order.user?.name || "Customer"}
                          </p>

                          <p className="text-xs text-[#8B7A6B]">
                            {order.user?.email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-xs text-[#8B7A6B]">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-5 py-4 font-semibold text-[#241A14]">
                          {formatPrice(order.totalAmount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded px-3 py-1 text-xs ${getStatusStyle(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-sm text-[#8B7A6B]"
                      >
                        No orders available yet.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// STAT CARD COMPONENT
function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="border border-[#241A14]/15 bg-[#F3EBD7] p-5 transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[1.2px] text-[#6E5A4B]">
          {title}
        </p>

        <span className="flex h-9 w-9 items-center justify-center bg-[#845F42]/10 text-xl text-[#845F42]">
          {icon}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-semibold text-[#241A14]">
        {value}
      </h2>

      <p className="mt-2 text-xs text-[#8B7A6B]">
        {description}
      </p>

    </div>
  );
}