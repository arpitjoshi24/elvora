"use client";

import React, { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Backend order status values
type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface OrderItem {
  _id?: string;
  product?: {
    _id: string;
    name?: string;
    images?: string[];
  } | string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: string;
  orderStatus: OrderStatus;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    addressType?: string;
  };
  createdAt: string;
}

const statusLabels: Record<OrderStatus, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price || 0);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function Page() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // FETCH ALL ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/orders`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch orders");
      }

      const orders = data.orders || data.data?.orders || [];

      setOrdersList(orders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // UPDATE ORDER STATUS
  const updateStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order status");
      }

      // Refresh orders with updated backend data
      await fetchOrders();

      // Update selected modal order too
      setSelectedOrder((prev) =>
        prev?._id === orderId
          ? {
              ...prev,
              orderStatus: newStatus,
            }
          : prev
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update order"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // STATUS OPTIONS
  const getNextStatus = (
    status: OrderStatus
  ): OrderStatus | null => {
    const nextStatuses: Partial<Record<OrderStatus, OrderStatus>> = {
      PLACED: "CONFIRMED",
      CONFIRMED: "PROCESSING",
      PROCESSING: "SHIPPED",
      SHIPPED: "DELIVERED",
    };

    return nextStatuses[status] || null;
  };

  // SEARCH AND FILTER
  const filteredOrders = ordersList.filter((order) => {
    const customerName = order.user?.name || "";
    const customerEmail = order.user?.email || "";

    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      statusLabels[order.orderStatus] === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // STATUS BADGE
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-[#241A14]/10 text-[#241A14] border border-[#241A14]/30";

      case "SHIPPED":
        return "bg-[#845F42]/10 text-[#845F42] border border-[#845F42]/30";

      case "PROCESSING":
      case "PLACED":
      case "CONFIRMED":
        return "bg-amber-100/70 text-amber-900 border border-amber-300";

      case "CANCELLED":
        return "bg-stone-200 text-stone-600 border border-stone-300";
    }
  };

  // EXPORT CSV
  const exportCSV = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Price",
      "Payment",
      "Status",
      "Date",
    ];

    const rows = filteredOrders.map((order) => [
      order._id,
      order.user?.name || "Customer",
      order.user?.email || "",
      order.totalAmount,
      order.paymentMethod,
      order.orderStatus,
      formatDate(order.createdAt),
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `elvora_orders_${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const statuses = [
    "All",
    "Placed",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="min-h-screen bg-[#EDE5D8]">
      <main className="flex flex-col bg-[#EDE5D8] p-6 md:p-10">

        {/* HEADER */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#241A14]/15 pb-6">
          <div>
            <p className="text-[11px] font-medium tracking-[1.5px] text-[#845F42]">
              ORDER MANAGEMENT
            </p>

            <h1 className="mt-1 font-krona text-2xl md:text-3xl text-[#241A14]">
              Customer Orders
            </h1>

            <p className="mt-2 font-kulim text-sm text-[#6E5A4B]">
              View and manage customer orders, payments, and delivery status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, email, method..."
              className="w-64 rounded-sm border border-[#241A14]/20 bg-[#F3EBD7]/50 px-3.5 py-2.5 text-xs text-[#241A14] outline-none focus:border-[#845F42]"
            />

            <button
              onClick={exportCSV}
              disabled={filteredOrders.length === 0}
              className="rounded-sm border border-[#241A14]/25 bg-white px-4 py-2.5 text-xs font-medium text-[#241A14] hover:bg-[#241A14] hover:text-white disabled:opacity-50"
            >
              ↓ Export CSV
            </button>

            <button
              onClick={fetchOrders}
              className="rounded-sm bg-[#241A14] px-4 py-2.5 text-xs text-white hover:bg-[#845F42]"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="py-20 text-center text-[#845F42]">
            Loading orders...
          </div>
        ) : (
          <>
            {/* METRICS */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Metric
                title="TOTAL ORDERS"
                value={ordersList.length}
              />

              <Metric
                title="PROCESSING"
                value={
                  ordersList.filter(
                    (o) => o.orderStatus === "PROCESSING"
                  ).length
                }
              />

              <Metric
                title="IN TRANSIT"
                value={
                  ordersList.filter(
                    (o) => o.orderStatus === "SHIPPED"
                  ).length
                }
              />

              <Metric
                title="DELIVERED"
                value={
                  ordersList.filter(
                    (o) => o.orderStatus === "DELIVERED"
                  ).length
                }
              />
            </div>

            {/* FILTER TABS */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {statuses.map((tab) => {
                const count =
                  tab === "All"
                    ? ordersList.length
                    : ordersList.filter(
                        (o) => statusLabels[o.orderStatus] === tab
                      ).length;

                const isActive = statusFilter === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-xs font-medium ${
                      isActive
                        ? "border-[#241A14] text-[#241A14]"
                        : "border-transparent text-[#6E5A4B] hover:text-[#241A14]"
                    }`}
                  >
                    {tab}

                    <span className="rounded bg-[#241A14]/5 px-1.5 py-0.5 text-[10px]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ORDERS TABLE */}
            <div className="flex-1 overflow-hidden border-y border-[#241A14]/20">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-[#241A14] text-[#F3EBD7]">
                    <tr>
                      <th className="px-5 py-3.5 text-xs">Order ID</th>
                      <th className="px-5 py-3.5 text-xs">Customer</th>
                      <th className="px-5 py-3.5 text-xs">Date</th>
                      <th className="px-5 py-3.5 text-xs">Price</th>
                      <th className="px-5 py-3.5 text-xs">Payment</th>
                      <th className="px-5 py-3.5 text-xs">Status</th>
                      <th className="px-5 py-3.5 text-xs text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#241A14]/10 text-[#3A3028]">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const nextStatus = getNextStatus(
                          order.orderStatus
                        );

                        return (
                          <tr
                            key={order._id}
                            onClick={() => setSelectedOrder(order)}
                            className="cursor-pointer hover:bg-[#EDE5D8]"
                          >
                            <td className="px-5 py-4 font-mono font-medium text-[#241A14]">
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
                              {formatDate(order.createdAt)}
                            </td>

                            <td className="px-5 py-4 font-semibold text-[#241A14]">
                              {formatPrice(order.totalAmount)}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded bg-[#F3EBD7] px-2.5 py-1 text-xs font-medium text-[#241A14]">
                                {order.paymentMethod === "COD"
                                  ? "COD"
                                  : "Online"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-sm px-3 py-1 text-xs font-medium ${getStatusBadge(
                                  order.orderStatus
                                )}`}
                              >
                                {statusLabels[order.orderStatus]}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {nextStatus && (
                                  <button
                                    disabled={updatingId === order._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStatus(order._id, nextStatus);
                                    }}
                                    className="rounded bg-[#845F42] px-3 py-1 text-xs text-white hover:bg-[#241A14] disabled:opacity-50"
                                  >
                                    {updatingId === order._id
                                      ? "Updating..."
                                      : `Mark ${statusLabels[nextStatus]}`}
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                  }}
                                  className="rounded border border-[#241A14]/20 px-3 py-1 text-xs text-[#241A14] hover:bg-[#241A14] hover:text-white"
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-16 text-center text-sm text-[#241A14]/60"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 text-xs text-[#241A14]/60">
              Showing {filteredOrders.length} of {ordersList.length} orders
            </div>
          </>
        )}
      </main>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[#241A14]/25 bg-[#F3EBD7] p-6">

            <div className="flex items-center justify-between border-b border-[#241A14]/15 pb-4">
              <div>
                <span className="font-mono text-sm font-semibold text-[#241A14]">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </span>

                <p className="text-xs text-[#8B7A6B]">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-lg text-[#241A14]/60 hover:text-[#241A14]"
              >
                ✕
              </button>
            </div>

            {/* CUSTOMER */}
            <div className="mt-4">
              <p className="text-xs font-semibold tracking-wider text-[#241A14]">
                CUSTOMER INFORMATION
              </p>

              <p className="mt-1 text-sm font-medium text-[#241A14]">
                {selectedOrder.shippingAddress?.fullName ||
                  selectedOrder.user?.name ||
                  "Customer"}
              </p>

              <p className="text-xs text-[#8B7A6B]">
                {selectedOrder.user?.email || "No email"}
              </p>

              <p className="mt-2 text-xs text-[#8B7A6B]">
                Phone: {selectedOrder.shippingAddress?.phone || "N/A"}
              </p>

              <p className="mt-2 text-xs leading-relaxed text-[#8B7A6B]">
                <span className="font-semibold text-[#241A14]">
                  Delivery Address:{" "}
                </span>

                {[
                  selectedOrder.shippingAddress?.addressLine,
                  selectedOrder.shippingAddress?.landmark,
                  selectedOrder.shippingAddress?.city,
                  selectedOrder.shippingAddress?.state,
                  selectedOrder.shippingAddress?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

            {/* ITEMS */}
            <div className="mt-4 border-t border-[#241A14]/10 pt-4">
              <p className="mb-2 text-xs font-semibold tracking-wider text-[#241A14]">
                ORDER ITEMS
              </p>

              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-center justify-between border-b border-[#241A14]/10 py-3 text-xs"
                  >
                    <div>
                      <p className="font-medium text-[#241A14]">
                        {item.name ||
                          (typeof item.product === "object"
                            ? item.product?.name
                            : "Product")}
                      </p>

                      <p className="text-[#8B7A6B]">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <span className="font-semibold text-[#241A14]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYMENT AND TOTAL */}
            <div className="flex items-center justify-between border-t border-[#241A14]/10 pt-4">
              <div>
                <p className="text-xs text-[#8B7A6B]">
                  Payment Method
                </p>

                <p className="text-sm font-semibold text-[#241A14]">
                  {selectedOrder.paymentMethod}
                </p>

                <p className="mt-1 text-xs text-[#8B7A6B]">
                  Payment: {selectedOrder.paymentStatus}
                </p>

                <p className="mt-2 text-xs text-[#8B7A6B]">
                  Order: {statusLabels[selectedOrder.orderStatus]}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-[#8B7A6B]">
                  Total Amount
                </p>

                <p className="text-xl font-bold text-[#845F42]">
                  {formatPrice(selectedOrder.totalAmount)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-[#241A14]/15 pt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-sm bg-[#241A14] px-4 py-2 text-xs font-medium text-white hover:bg-[#845F42]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// METRIC COMPONENT
function Metric({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="border-l-2 border-[#845F42] py-2 pl-4 pr-3">
      <p className="text-[10px] font-medium tracking-wider text-[#241A14]/60">
        {title}
      </p>

      <p className="mt-1 text-2xl font-semibold text-[#241A14]">
        {value}
      </p>
    </div>
  );
}