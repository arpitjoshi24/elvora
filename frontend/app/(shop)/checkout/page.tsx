"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  images?: string[];
  stock: number;
  category?: {
    name: string;
  } | string;
}

interface CartItem {
  _id?: string;
  product: Product | string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartProduct {
  productId: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  size?: string;
  color?: string;
}

export default function Page() {
  const router = useRouter();
  const [showDevelopmentAlert, setShowDevelopmentAlert] = useState(false);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch Cart
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/cart`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch cart");
      }

      // Handle different possible response structures
      const cartData =
        data.cart?.items ||
        data.cart?.products ||
        data.items ||
        [];

      if (!Array.isArray(cartData)) {
        throw new Error("Invalid cart response from server");
      }

      const formattedProducts: CartProduct[] = cartData
        .map((item: CartItem) => {
          const product = item.product;

          // Ignore products that are not populated
          if (!product || typeof product === "string") {
            return null;
          }

          const category =
            typeof product.category === "object"
              ? product.category?.name || ""
              : product.category || "";

          return {
            productId: product._id,
            name: product.name,
            category,
            image: product.images?.[0] || "",
            price:
              product.discountPrice != null &&
              product.discountPrice < product.price
                ? product.discountPrice
                : product.price,
            quantity: item.quantity,
            stock: product.stock,
            size: item.size || "",
            color: item.color || "",
          };
        })
        .filter(
          (item: CartProduct | null): item is CartProduct =>
            item !== null
        );

      setProducts(formattedProducts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // INR Formatter
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Notification
  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // Update Quantity
  const updateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    const product = products.find(
      (item) => item.productId === productId
    );

    if (!product) return;

    if (newQuantity > product.stock) {
      showMessage(`Only ${product.stock} items are available`);
      return;
    }

    try {
      setProcessingId(productId);

      const response = await fetch(
        `${API_URL}/api/cart/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update quantity");
      }

      setProducts((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      showMessage("Cart updated successfully");
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Increase Quantity
  const increaseQuantity = (productId: string) => {
    const product = products.find(
      (item) => item.productId === productId
    );

    if (product) {
      updateQuantity(productId, product.quantity + 1);
    }
  };

  // Decrease Quantity
  const decreaseQuantity = (productId: string) => {
    const product = products.find(
      (item) => item.productId === productId
    );

    if (product && product.quantity > 1) {
      updateQuantity(productId, product.quantity - 1);
    }
  };

  // Remove Product
  const removeProduct = async (productId: string) => {
    try {
      setProcessingId(productId);

      const response = await fetch(
        `${API_URL}/api/cart/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove product");
      }

      setProducts((prev) =>
        prev.filter((item) => item.productId !== productId)
      );

      showMessage("Product removed from cart");
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Price Calculations
  const subtotal = products.reduce(
    (total, product) =>
      total + product.price * product.quantity,
    0
  );

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const totalItems = products.reduce(
    (total, product) => total + product.quantity,
    0
  );
const placeOrder = async () => {
  try {
    setProcessingId("checkout");
    setError("");
    setMessage("");

    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to place order");
    }

    // Order successfully placed
    setProducts([]);

    setShowDevelopmentAlert(false);

    alert(
      `Order placed successfully!\nOrder ID: ${
        data.order?._id || data.order?.orderId || "Confirmed"
      }`
    );

    // Refresh cart from backend
    await fetchCart();

  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : "Something went wrong"
    );
  } finally {
    setProcessingId(null);
  }
};
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#4A2A02]">
      {/* Development Alert */}
{showDevelopmentAlert && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">

    <div className="w-full max-w-md bg-[#F4EFE6] p-8 text-center shadow-2xl">

      {/* Icon */}
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#8A7356]/15 text-3xl">
        ⚙️
      </div>

      {/* Heading */}
      <h2 className="font-serif text-3xl font-bold text-[#4A2A02]">
        We're Still Working!
      </h2>

      {/* Message */}
      <p className="mt-4 text-sm leading-7 text-[#8A7356]">
        Thank you for shopping with Elvora!
        Our website is currently under development,
        and the checkout feature is not available yet.
        We'll be launching it soon!
      </p>

      {/* Button */}
      <button
        onClick={() => setShowDevelopmentAlert(false)}
        className="mt-7 w-full bg-[#4A2A02] py-3 text-sm font-semibold tracking-wider text-white transition hover:bg-[#8A7356]"
      >
        CONTINUE SHOPPING
      </button>

      <p className="mt-4 text-xs tracking-widest text-[#8A7356]">
        ELVORA — COMING SOON
      </p>

    </div>
  </div>
)}
      {/* Notification */}
      {message && (
        <div className="fixed right-5 top-5 z-50 bg-[#4A2A02] px-6 py-3 text-sm text-white shadow-lg">
          {message}
        </div>
      )}

      <main className="px-6 py-10 md:px-12">

        {/* Page Heading */}
        <div className="mb-10 flex items-end justify-between">

          <div>
            <p className="mb-2 text-sm text-[#8A7356]">
              Home / Cart
            </p>

            <h1 className="font-serif text-4xl font-bold">
              Your Cart
            </h1>

            <p className="mt-2 text-sm text-[#8A7356]">
              {totalItems} Items
            </p>
          </div>

          <Link
            href="/product_page"
            className="text-sm font-semibold transition hover:text-[#8A7356]"
          >
            ← Continue Shopping
          </Link>

        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white py-20 text-center">
            <p>Loading your cart...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white py-20 text-center">

            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchCart}
              className="mt-5 bg-[#4A2A02] px-6 py-3 text-white hover:bg-[#8A7356]"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Cart Content */}
        {!loading && !error && (

          products.length > 0 ? (

            <div className="flex flex-col gap-8 lg:flex-row">

              {/* LEFT SECTION */}
              <div className="w-full lg:w-2/3">

                <div className="mb-5 flex items-center justify-between border-b border-[#8A7356]/30 pb-4">

                  <h2 className="text-xl font-bold">
                    Shopping Bag
                  </h2>

                  <p className="text-sm text-[#8A7356]">
                    {products.length} Products
                  </p>

                </div>

                <div className="flex flex-col gap-5">

                  {products.map((product) => (

                    <div
                      key={product.productId}
                      className="flex flex-col items-center gap-5 border border-[#8A7356]/20 bg-white p-4 sm:flex-row"
                    >

                      {/* Product Image */}
                      <div className="flex h-32 w-32 shrink-0 items-center justify-center bg-[#E5DED3]">

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-[#8A7356]">
                            No Image
                          </span>
                        )}

                      </div>

                      {/* Product Details */}
                      <div className="flex-1 text-center sm:text-left">

                        <p className="mb-1 text-xs text-[#8A7356]">
                          {product.category}
                        </p>

                        <h3 className="text-lg font-bold">
                          {product.name}
                        </h3>

                        {(product.color || product.size) && (
                          <p className="mt-2 text-sm text-gray-500">
                            {product.color && `Color: ${product.color}`}
                            {product.color && product.size && " | "}
                            {product.size && `Size: ${product.size}`}
                          </p>
                        )}

                        <p className="mt-2 text-sm font-semibold">
                          {formatPrice(product.price)}
                        </p>

                        <button
                          onClick={() =>
                            removeProduct(product.productId)
                          }
                          disabled={processingId === product.productId}
                          className="mt-3 text-xs text-[#8A7356] underline hover:text-red-600 disabled:opacity-50"
                        >
                          Remove
                        </button>

                      </div>

                      {/* Quantity */}
                      <div className="flex items-center border border-[#8A7356]/30">

                        <button
                          onClick={() =>
                            decreaseQuantity(product.productId)
                          }
                          disabled={
                            product.quantity <= 1 ||
                            processingId === product.productId
                          }
                          className="px-3 py-2 hover:bg-[#F4EFE6] disabled:opacity-40"
                        >
                          -
                        </button>

                        <span className="px-3 text-sm">
                          {product.quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(product.productId)
                          }
                          disabled={
                            product.quantity >= product.stock ||
                            processingId === product.productId
                          }
                          className="px-3 py-2 hover:bg-[#F4EFE6] disabled:opacity-40"
                        >
                          +
                        </button>

                      </div>

                      {/* Price */}
                      <div className="w-28 text-center text-lg font-bold sm:text-right">
                        {formatPrice(
                          product.price * product.quantity
                        )}
                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* RIGHT SECTION */}
              <div className="w-full lg:w-1/3">

                <div className="border border-[#8A7356]/20 bg-white p-7">

                  <h2 className="mb-7 text-xl font-bold">
                    Order Summary
                  </h2>

                  {/* Subtotal */}
                  <div className="mb-5 flex justify-between text-sm">

                    <span className="text-gray-600">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      {formatPrice(subtotal)}
                    </span>

                  </div>

                  {/* Shipping */}
                  <div className="mb-5 flex justify-between text-sm">

                    <span className="text-gray-600">
                      Shipping
                    </span>

                    <span className="text-[#8A7356]">
                      Calculated at checkout
                    </span>

                  </div>

                  {/* Tax */}
                  <div className="mb-5 flex justify-between text-sm">

                    <span className="text-gray-600">
                      Estimated Tax (8%)
                    </span>

                    <span className="font-semibold">
                      {formatPrice(tax)}
                    </span>

                  </div>

                  <div className="my-6 border-t border-[#8A7356]/30" />

                  {/* Total */}
                  <div className="mb-7 flex justify-between text-lg font-bold">

                    <span>Total</span>

                    <span>{formatPrice(total)}</span>

                  </div>

                  {/* Checkout */}
                  <button
  onClick={placeOrder}
  disabled={products.length === 0 || processingId === "checkout"}
  className="w-full bg-[#4A2A02] py-4 text-sm font-semibold tracking-wider text-white transition hover:bg-[#8A7356] disabled:opacity-50"
>
  {processingId === "checkout"
    ? "PLACING ORDER..."
    : "PROCEED TO CHECKOUT"}
</button>

                </div>

                {/* Additional Information */}
                <div className="mt-6 flex flex-col gap-3 text-sm text-[#8A7356]">

                  <p>✓ Free returns within 30 days</p>
                  <p>✓ Secure checkout</p>
                  <p>✓ Premium quality products</p>

                </div>

              </div>

            </div>

          ) : (

            /* Empty Cart */
            <div className="bg-white py-24 text-center">

              <h2 className="text-2xl font-bold">
                Your Cart is Empty
              </h2>

              <p className="mt-3 text-sm text-[#8A7356]">
                Looks like you haven't added anything to your cart yet.
              </p>

              <Link
                href="/product_page"
                className="mt-6 inline-block bg-[#4A2A02] px-8 py-3 text-sm text-white transition hover:bg-[#8A7356]"
              >
                Continue Shopping
              </Link>

            </div>
            
          )

        )}

      </main>

    </div>
  );
}