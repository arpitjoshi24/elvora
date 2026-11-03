"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  stock: number;
}

interface WishlistItem {
  product: Product | string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch Wishlist
  const fetchWishlist = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(`${API_URL}/api/wishlist`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    // Check actual backend response
    console.log("Wishlist API Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch wishlist");
    }

    // Find the actual array in the response
    let wishlistData = [];

    if (Array.isArray(data)) {
      wishlistData = data;
    } 
    else if (Array.isArray(data.wishlist)) {
      wishlistData = data.wishlist;
    } 
    else if (Array.isArray(data.wishlist?.items)) {
      wishlistData = data.wishlist.items;
    } 
    else if (Array.isArray(data.wishlist?.products)) {
      wishlistData = data.wishlist.products;
    } 
    else if (Array.isArray(data.items)) {
      wishlistData = data.items;
    } 
    else if (Array.isArray(data.products)) {
      wishlistData = data.products;
    }

    const products = wishlistData
      .map((item: any) => {
        return item.product || item;
      })
      .filter((product: any) => {
        return product && typeof product === "object" && product._id;
      });

    setItems(products);

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
    fetchWishlist();
  }, []);

  // Format Price in INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Show Message
  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // Remove Product from Wishlist
  const remove = async (productId: string) => {
    try {
      setProcessingId(productId);

      const response = await fetch(
        `${API_URL}/api/wishlist/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove product");
      }

      setItems((prev) =>
        prev.filter((item) => item._id !== productId)
      );

      showMessage("Product removed from wishlist");
    } catch (err) {
      showMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Move Product to Cart
  const moveToBag = async (productId: string) => {
    try {
      setProcessingId(productId);

      // First add product to cart
      const cartResponse = await fetch(
        `${API_URL}/api/cart/${productId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const cartData = await cartResponse.json();

      if (!cartResponse.ok) {
        throw new Error(
          cartData.message || "Unable to add product to cart"
        );
      }

      // Then remove it from wishlist
      const wishlistResponse = await fetch(
        `${API_URL}/api/wishlist/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const wishlistData = await wishlistResponse.json();

      if (!wishlistResponse.ok) {
        throw new Error(
          wishlistData.message ||
            "Product added to cart, but could not be removed from wishlist"
        );
      }

      // Update UI
      setItems((prev) =>
        prev.filter((item) => item._id !== productId)
      );

      showMessage("Product successfully moved to your bag!");
    } catch (err) {
      showMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Clear Entire Wishlist
  const clearWishlist = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to clear wishlist");
      }

      setItems([]);
      showMessage("Wishlist cleared successfully");
    } catch (err) {
      showMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    }
  };

  const count = items.length;

  const countLabel =
    count === 1 ? "1 item" : `${count} items`;

  return (
    <div className="min-h-screen bg-white text-[#1A1714] antialiased">

      {/* Notification */}
      {message && (
        <div className="fixed right-5 top-5 z-50 bg-[#1A1714] px-6 py-3 text-sm text-white shadow-lg">
          {message}
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">

        {/* Breadcrumb */}
        <nav
          className="text-xs text-[#1A1714]/50"
          aria-label="Breadcrumb"
        >
          <Link
            href="/product_page"
            className="hover:text-[#8C7355]"
          >
            Home
          </Link>

          {" / "}

          <span className="text-[#1A1714]">
            Wishlist
          </span>
        </nav>

        {/* Wishlist Heading */}
        <div className="mt-3 flex items-end justify-between border-b border-[#CDB79A]/40 pb-5">

          <h1 className="font-serif text-4xl font-semibold md:text-5xl">
            Your Wishlist
          </h1>

          <p className="text-sm text-[#1A1714]/50">
            {countLabel}
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="py-24 text-center">
            <p className="text-lg">
              Loading your wishlist...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-24 text-center">

            <p className="text-red-600">
              {error}
            </p>

            <button
              onClick={fetchWishlist}
              className="mt-5 bg-[#1A1714] px-6 py-3 text-sm text-white hover:bg-[#8C7355]"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Wishlist Products */}
        {!loading && !error && count > 0 && (
          <>

            {/* Clear Wishlist */}
            <div className="mt-6 flex justify-end">

              <button
                onClick={clearWishlist}
                className="text-xs text-red-600 hover:underline"
              >
                Clear Wishlist
              </button>

            </div>

            <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">

              {items.map((item) => (

                <li key={item._id}>

                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F0EBE3]">

                    {item.images?.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#8C7355]">
                        No Image Available
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => remove(item._id)}
                      disabled={processingId === item._id}
                      aria-label={`Remove ${item.name} from wishlist`}
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#8C7355] shadow-sm transition hover:bg-white disabled:opacity-50"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5 fill-current"
                        aria-hidden="true"
                      >
                        <path d="M12 21s-7.5-4.6-9.6-9.2C.8 8.2 3 4.5 6.7 4.5c2 0 3.5 1 5.3 3 1.8-2 3.3-3 5.3-3 3.7 0 5.9 3.7 4.3 7.3C19.5 16.4 12 21 12 21z" />
                      </svg>
                    </button>

                    {/* Out of Stock */}
                    {item.stock <= 0 && (
                      <span className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 text-xs text-white">
                        Out of Stock
                      </span>
                    )}

                  </div>

                  {/* Product Details */}
                  <div className="mt-3">

                    <Link
                      href={`/paticular_product_page?id=${item._id}`}
                      className="hover:text-[#8C7355]"
                    >
                      <h2 className="font-serif text-xl font-semibold leading-tight">
                        {item.name}
                      </h2>
                    </Link>

                    {/* Price */}
                    <div className="mt-2">

                      {item.discountPrice != null &&
                      item.discountPrice < item.price ? (

                        <div className="flex items-center gap-2">

                          <p className="text-sm font-semibold">
                            {formatPrice(item.discountPrice)}
                          </p>

                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(item.price)}
                          </p>

                        </div>

                      ) : (

                        <p className="text-sm font-semibold">
                          {formatPrice(item.price)}
                        </p>

                      )}

                    </div>

                    {/* Move to Bag */}
                    <button
                      disabled={
                        processingId === item._id ||
                        item.stock <= 0
                      }
                      onClick={() => moveToBag(item._id)}
                      className="mt-4 w-full bg-[#1A1714] py-2.5 text-xs font-medium tracking-wide text-white transition hover:bg-[#8C7355] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#1A1714]"
                    >
                      {processingId === item._id
                        ? "Please wait..."
                        : item.stock <= 0
                        ? "Out of Stock"
                        : "Move to Bag"}
                    </button>

                  </div>

                </li>

              ))}

            </ul>

            {/* Continue Shopping */}
            <Link
              href="/product_page"
              className="mt-12 inline-block text-xs text-[#1A1714]/60 hover:text-[#8C7355]"
            >
              ← Continue shopping
            </Link>

          </>
        )}

        {/* Empty Wishlist */}
        {!loading && !error && count === 0 && (

          <div className="py-24 text-center">

            <img
              src="/images/logo.jpeg"
              alt="Elvora Logo"
              className="mx-auto h-16 w-16 rounded-full object-cover opacity-80"
            />

            <h2 className="mt-4 font-serif text-3xl font-semibold">
              Your wishlist is empty
            </h2>

            <p className="mt-2 text-sm text-[#1A1714]/60">
              Tap the heart on any product to save it here.
            </p>

            <Link
              href="/product_page"
              className="mt-6 inline-block bg-[#1A1714] px-8 py-3 text-xs font-medium tracking-wide text-white transition hover:bg-[#8C7355]"
            >
              Browse New Arrivals
            </Link>

          </div>

        )}

      </main>

    </div>
  );
}