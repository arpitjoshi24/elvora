"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  category: Category | string;
  stock: number;
  isFeatured: boolean;

  // These are optional until supported by your backend schema
  sizes?: string[];
  colors?: string[];
}

export default function Page() {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

 const [selectedSize, setSelectedSize] = useState("S");

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const [selectedColor, setSelectedColor] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);

  const [isWishlisted, setIsWishlisted] = useState(false);

  const [processing, setProcessing] = useState(false);

  // Get product ID from URL
  const [productId, setProductId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      setError("Product ID not found.");
      setLoading(false);
      return;
    }

    setProductId(id);
    fetchProduct(id);
  }, []);

  // Fetch Product Details
  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products/${id}`
      );

      const data = await response.json();

      console.log("Product API Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch product"
        );
      }

      const productData = data.product || data;

      if (!productData?._id) {
        throw new Error("Product not found.");
      }

      setProduct(productData);

      // Select first available size and color, if provided
      if (productData.sizes?.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }

      if (productData.colors?.length > 0) {
        setSelectedColor(productData.colors[0]);
      }

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

  // Format Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate Discount
  const discount =
    product?.discountPrice != null &&
    product.discountPrice < product.price
      ? Math.round(
          ((product.price - product.discountPrice) /
            product.price) *
            100
        )
      : 0;

  const finalPrice =
    product?.discountPrice != null &&
    product.discountPrice < product.price
      ? product.discountPrice
      : product?.price || 0;

  // Show Notification
  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // Add to Cart
  const handleAddToCart = async (buyNow = false) => {
    if (!product) return;

    try {
      setProcessing(true);

      const response = await fetch(
        `${API_URL}/api/cart/${product._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add product to cart"
        );
      }

      if (buyNow) {
        showMessage("Product added to cart. Redirecting...");

        setTimeout(() => {
          router.push("/cart_page");
        }, 1000);
      } else {
        showMessage("Product added to cart successfully!");
      }

    } catch (err) {
      showMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setProcessing(false);
    }
  };

  // Add to Wishlist
  const handleWishlist = async () => {
    if (!product) return;

    try {
      setProcessing(true);

      const response = await fetch(
        `${API_URL}/api/wishlist/${product._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add product to wishlist"
        );
      }

      setIsWishlisted(true);

      showMessage("Product added to wishlist!");

    } catch (err) {
      showMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setProcessing(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3EBD7] text-[#845F42]">
        Loading product details...
      </div>
    );
  }

  // Error Screen
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3EBD7] text-[#241A14]">

        <h2 className="text-2xl font-semibold">
          {error || "Product not found"}
        </h2>

        <Link
          href="/product_page"
          className="mt-5 bg-[#241A14] px-6 py-3 text-white"
        >
          Back to Products
        </Link>

      </div>
    );
  }

  const productImages =
    product.images?.length > 0
      ? product.images
      : [];

  const categoryName =
    typeof product.category === "object"
      ? product.category.name
      : "ELVORA COLLECTION";

  return (
    <div className="min-h-screen bg-[#F3EBD7] text-[#241A14]">

      {/* Notification */}
      {message && (
        <div className="fixed right-5 top-5 z-50 bg-[#241A14] px-6 py-3 text-sm text-white shadow-lg">
          {message}
        </div>
      )}

      {/* HEADER */}
      {/* <Header /> */}

      <main className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 md:px-10 md:py-9">

        {/* BREADCRUMB */}
        <div className="mb-7 text-xs text-[#845F42]">

          <Link href="/product_page" className="hover:underline">
            Home
          </Link>

          {" / "}

          <span>{categoryName}</span>

          {" / "}

          <span className="text-[#241A14]">
            {product.name}
          </span>

        </div>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_0.9fr] md:gap-10 lg:gap-14">

          {/* PRODUCT GALLERY */}
          <div>

            {/* MAIN IMAGE */}
            <div className="flex aspect-[4/4.5] max-h-[560px] w-full items-center justify-center bg-[#EDE5D8] p-8 sm:p-10">

              {productImages.length > 0 ? (
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="text-[#845F42]">
                  No Product Image Available
                </p>
              )}

            </div>

            {/* THUMBNAILS */}
            {productImages.length > 1 && (
              <div className="mt-5 flex gap-3 overflow-x-auto">

                {productImages.map((image, index) => (

                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 shrink-0 border p-1 transition-colors sm:h-24 sm:w-24 ${
                      selectedImage === index
                        ? "border-[#845F42]"
                        : "border-[#D7CEC2] hover:border-[#845F42]"
                    }`}
                  >

                    <img
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      className="h-full w-full object-contain"
                    />

                  </button>

                ))}

              </div>
            )}

          </div>

          {/* PRODUCT INFORMATION */}
          <div className="pt-2 md:pt-4">

            <p className="mb-3 font-kulim text-xs font-semibold tracking-[3px] text-[#845F42]">
              {categoryName}
            </p>

            <h1 className="font-kulim text-3xl font-semibold leading-tight tracking-wide text-[#241A14] sm:text-4xl">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mt-5 flex flex-wrap items-center gap-3">

              <p className="font-kulim text-2xl font-semibold text-[#845F42]">
                {formatPrice(finalPrice)}
              </p>

              {discount > 0 && (
                <>
                  <p className="font-kulim text-sm text-[#A99580] line-through">
                    {formatPrice(product.price)}
                  </p>

                  <span className="font-kulim text-xs font-semibold text-[#6E4728]">
                    {discount}% OFF
                  </span>
                </>
              )}

            </div>

            <p className="mt-2 font-kulim text-xs text-[#845F42]">
              Inclusive of all taxes
            </p>

            <div className="my-7 border-t border-[#D7CEC2]" />

            {/* SIZE SELECTION */}
            {/* SIZE SELECTION */}
<div className="mt-7">

  <div className="flex items-center justify-between">
    <h3 className="font-kulim text-sm font-semibold">
      Select Size
    </h3>

    <button
      type="button"
      onClick={() =>
        alert("Please check the size chart before selecting your size.")
      }
      className="font-kulim text-xs text-[#845F42] underline underline-offset-4"
    >
      Size Guide
    </button>
  </div>

  <div className="mt-4 flex flex-wrap gap-3">

    {sizes.map((size) => (
      <button
        key={size}
        type="button"
        onClick={() => setSelectedSize(size)}
        className={`h-11 w-12 border font-kulim text-sm transition-colors ${
          selectedSize === size
            ? "border-[#241A14] bg-[#241A14] text-[#F3EBD7]"
            : "border-[#D7CEC2] bg-[#FAF7F0] text-[#241A14] hover:border-[#845F42]"
        }`}
      >
        {size}
      </button>
    ))}

  </div>

  <p className="mt-2 font-kulim text-xs text-[#845F42]">
    Selected Size: {selectedSize}
  </p>

</div>

            {/* COLOR SELECTION */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-7">

                <h3 className="font-kulim text-sm font-semibold">
                  Select Color
                </h3>

                <div className="mt-4 flex flex-wrap gap-3">

                  {product.colors.map((color) => (

                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`border px-4 py-2 text-sm capitalize ${
                        selectedColor === color
                          ? "border-[#241A14] bg-[#241A14] text-white"
                          : "border-[#D7CEC2] bg-[#FAF7F0] hover:border-[#845F42]"
                      }`}
                    >
                      {color}
                    </button>

                  ))}

                </div>

              </div>
            )}

            {/* STOCK */}
            <div className="mt-6">

              {product.stock > 0 ? (
                <p className="text-sm text-green-700">
                  In Stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Currently Out of Stock
                </p>
              )}

            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-3">

              <button
                type="button"
                disabled={processing || product.stock <= 0}
                onClick={() => handleAddToCart(false)}
                className="flex-1 bg-[#241A14] py-4 font-kulim text-xs font-semibold tracking-[1.5px] text-[#F3EBD7] transition-colors hover:bg-[#6E4728] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? "PLEASE WAIT..." : "ADD TO CART"}
              </button>

              <button
                type="button"
                disabled={processing || product.stock <= 0}
                onClick={() => handleAddToCart(true)}
                className="flex-1 border border-[#241A14] bg-transparent py-4 font-kulim text-xs font-semibold tracking-[1.5px] text-[#241A14] transition-colors hover:bg-[#EDE5D8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                BUY NOW
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={handleWishlist}
                aria-label="Add to wishlist"
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-[#D7CEC2] text-xl transition-colors ${
                  isWishlisted
                    ? "bg-[#845F42] text-[#F3EBD7]"
                    : "bg-[#FAF7F0] text-[#241A14] hover:border-[#845F42]"
                }`}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>

            </div>

            {/* DELIVERY INFORMATION */}
            <div className="mt-7 border-y border-[#D7CEC2] py-5">

              <h3 className="font-kulim text-sm font-semibold">
                Delivery & Returns
              </h3>

              <p className="mt-2 font-kulim text-sm leading-6 text-[#845F42]">
                Free delivery on eligible orders.
              </p>

              <p className="font-kulim text-sm leading-6 text-[#845F42]">
                Easy returns according to our return policy.
              </p>

            </div>

            {/* PRODUCT DETAILS */}
            <div className="mt-7">

              <h3 className="font-kulim text-base font-semibold">
                Product Details
              </h3>

              <p className="mt-4 whitespace-pre-line font-kulim text-sm leading-7 text-[#845F42]">
                {product.description || "No product description available."}
              </p>

            </div>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      {/* <Footer /> */}

    </div>
  );
}