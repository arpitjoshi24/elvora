"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// MAIN PRODUCT PAGE
function ProductPageContent() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState("");

  const [message, setMessage] = useState("");
  const [requestedCategory, setRequestedCategory] = useState("");

  // FETCH PRODUCTS
  const fetchProducts = async (type = "all") => {
    try {
      setLoading(true);
      setError("");

      let endpoint = "/api/products";

      if (type === "latest") {
        endpoint = "/api/products/latest";
      } else if (type === "featured") {
        endpoint = "/api/products/featured";
      }

      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      const productList = Array.isArray(data)
        ? data
        : data.products || [];

      setProducts(productList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      setCategories(
        Array.isArray(data) ? data : data.categories || []
      );
    } catch (err) {
      console.error("Category error:", err);
    }
  };

  // FETCH CATEGORIES ONLY ONCE
  useEffect(() => {
    fetchCategories();
  }, []);

  // READ NAVBAR URL
  useEffect(() => {
    const params = new URLSearchParams(queryString);

    const category = params.get("category") || "";
    const sort = params.get("sort") || "";

    setRequestedCategory(category);
    setSelectedPrices([]);
    setSelectedSize("");

    if (sort === "newest") {
      setActiveTab("latest");
      fetchProducts("latest");
    } else {
      setActiveTab("all");
      fetchProducts("all");
    }
  }, [queryString]);

  // APPLY CATEGORY FROM URL
  useEffect(() => {
    if (!requestedCategory) {
      setActiveCategory("all");
      return;
    }

    if (categories.length === 0) {
      return;
    }

    const selectedCategory = categories.find(
      (category) =>
        category.name.trim().toLowerCase() ===
        requestedCategory.trim().toLowerCase()
    );

    if (selectedCategory) {
      setActiveCategory(selectedCategory._id);
    } else {
      setActiveCategory("no-match");
    }
  }, [requestedCategory, categories]);

  // CATEGORY NAME
  const getCategoryName = (category: Category | string) => {
    if (typeof category === "object" && category !== null) {
      return category.name;
    }

    const foundCategory = categories.find(
      (item) => item._id === category
    );

    return foundCategory?.name || "Uncategorized";
  };

  // CATEGORY ID
  const getCategoryId = (category: Category | string) => {
    if (typeof category === "object" && category !== null) {
      return category._id;
    }

    return category;
  };

  // PRICE FORMATTING
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // PRICE RANGES
  const priceRanges = [
    { label: "₹0 - ₹1,000", min: 0, max: 1000 },
    { label: "₹1,000 - ₹2,000", min: 1000, max: 2000 },
    { label: "₹2,000 - ₹3,000", min: 2000, max: 3000 },
    { label: "₹3,000 - ₹4,000", min: 3000, max: 4000 },
    { label: "Over ₹4,000", min: 4000, max: Infinity },
  ];

  // PRICE FILTER
  const handlePriceChange = (label: string) => {
    setSelectedPrices((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  // FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    const categoryId = getCategoryId(product.category);

    const categoryMatch =
      activeCategory === "all" ||
      (activeCategory !== "no-match" &&
        categoryId === activeCategory);

    const price = product.discountPrice ?? product.price;

    const priceMatch =
      selectedPrices.length === 0 ||
      selectedPrices.some((label) => {
        const range = priceRanges.find(
          (item) => item.label === label
        );

        return (
          range &&
          price >= range.min &&
          price <= range.max
        );
      });

    return categoryMatch && priceMatch;
  });

  // UPDATE CATEGORY FROM SIDEBAR
  const handleCategoryClick = (category: Category | null) => {
    if (category === null) {
      setActiveCategory("all");
      setRequestedCategory("");

      window.history.replaceState(null, "", "/product_page");
    } else {
      setActiveCategory(category._id);
      setRequestedCategory(category.name);

      window.history.replaceState(
        null,
        "",
        `/product_page?category=${encodeURIComponent(category.name)}`
      );
    }
  };

  // ADD TO CART
  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/cart/${productId}`,
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

      setMessage("Product added to cart successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );

      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ADD TO WISHLIST
  const handleAddToWishlist = async (productId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/wishlist/${productId}`,
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

      setMessage("Product added to wishlist!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );

      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#4A2A02]">

      {/* SUCCESS / ERROR MESSAGE */}
      {message && (
        <div className="fixed top-5 right-5 z-50 bg-[#8A7356] text-white px-6 py-3 shadow-lg">
          {message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 px-6 md:px-10 py-10">

        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-64 shrink-0 bg-white/70 p-6 rounded-sm h-fit">

          <h2 className="bg-[#8A7356] text-white text-center py-3 text-lg font-bold">
            Category
          </h2>

          <div className="flex flex-col gap-3 mt-5 text-lg font-semibold">

            {/* ALL */}
            <button
              onClick={() => handleCategoryClick(null)}
              className={`text-left hover:text-[#8A7356] ${
                activeCategory === "all" ? "text-[#8A7356]" : ""
              }`}
            >
              All
            </button>

            {/* DYNAMIC CATEGORIES */}
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                className={`text-left hover:text-[#8A7356] ${
                  activeCategory === category._id
                    ? "text-[#8A7356]"
                    : ""
                }`}
              >
                {category.name}
              </button>
            ))}

          </div>

          {/* FILTERS */}
          <h2 className="bg-[#8A7356] text-white text-center py-2 mt-8 font-bold text-lg">
            Filter By
          </h2>

          {/* PRICE */}
          <div className="mt-5">
            <h3 className="font-bold mb-3">Price</h3>

            {priceRanges.map((range) => (
              <label
                key={range.label}
                className="flex items-center gap-3 mb-3 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(range.label)}
                  onChange={() => handlePriceChange(range.label)}
                  className="accent-[#8A7356] w-4 h-4"
                />

                {range.label}
              </label>
            ))}
          </div>

          {/* SIZE */}
          <div className="mt-7">
            <h3 className="bg-[#8A7356] text-white px-3 py-2 font-bold">
              Size
            </h3>

            <div className="flex flex-wrap gap-2 mt-3">
              {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    setSelectedSize(
                      selectedSize === size ? "" : size
                    )
                  }
                  className={`border border-[#8A7356] px-3 py-1 text-sm ${
                    selectedSize === size
                      ? "bg-[#8A7356] text-white"
                      : "hover:bg-[#8A7356] hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Size filtering will work once size is available in your product model.
            </p>
          </div>

        </aside>

        {/* PRODUCTS SECTION */}
        <main className="flex-1 min-w-0">

          {/* TABS */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

            <h2 className="text-2xl font-bold">
              {requestedCategory
                ? `${requestedCategory} Collection`
                : "Our Collection"}
            </h2>

            <div className="flex flex-wrap gap-5 text-sm font-semibold">

              {/* NEW ARRIVAL */}
              <button
                onClick={() => {
                  setActiveTab("latest");

                  window.history.replaceState(
                    null,
                    "",
                    "/product_page?sort=newest"
                  );

                  setRequestedCategory("");
                  setActiveCategory("all");

                  fetchProducts("latest");
                }}
                className={`pb-2 ${
                  activeTab === "latest"
                    ? "border-b-2 border-[#8A7356]"
                    : "hover:border-b-2 hover:border-[#8A7356]"
                }`}
              >
                New Arrival
              </button>

              {/* FEATURED */}
              <button
                onClick={() => {
                  setActiveTab("featured");

                  window.history.replaceState(
                    null,
                    "",
                    "/product_page"
                  );

                  setRequestedCategory("");
                  setActiveCategory("all");

                  fetchProducts("featured");
                }}
                className={`pb-2 ${
                  activeTab === "featured"
                    ? "border-b-2 border-[#8A7356]"
                    : "hover:border-b-2 hover:border-[#8A7356]"
                }`}
              >
                Featured
              </button>

              {/* ALL PRODUCTS */}
              <button
                onClick={() => {
                  setActiveTab("all");

                  window.history.replaceState(
                    null,
                    "",
                    "/product_page"
                  );

                  setRequestedCategory("");
                  setActiveCategory("all");

                  fetchProducts("all");
                }}
                className={`pb-2 ${
                  activeTab === "all"
                    ? "border-b-2 border-[#8A7356]"
                    : "hover:border-b-2 hover:border-[#8A7356]"
                }`}
              >
                All Products
              </button>

            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="text-center py-20 text-lg">
              Loading products...
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="text-center py-20 text-red-600">
              {error}
            </div>
          )}

          {/* EMPTY PRODUCTS */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold">
                No products found
              </h3>

              <p className="text-gray-500 mt-2">
                No products are available in this category yet.
              </p>
            </div>
          )}

          {/* PRODUCT GRID */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white p-3 group"
                >

                  {/* PRODUCT IMAGE */}
                  <div className="h-64 bg-[#E5DED3] flex items-center justify-center relative overflow-hidden">

                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <span className="text-[#8A7356] text-sm">
                        No Image Available
                      </span>
                    )}

                    {/* WISHLIST */}
                    <button
                      onClick={() => handleAddToWishlist(product._id)}
                      aria-label="Add to wishlist"
                      className="absolute top-3 right-3 bg-white rounded-full w-9 h-9 text-xl hover:bg-[#8A7356] hover:text-white"
                    >
                      ♡
                    </button>

                    {/* LABEL */}
                    <span className="absolute top-3 left-3 bg-[#8A7356] text-white text-xs px-3 py-1">
                      {product.isFeatured ? "FEATURED" : "NEW"}
                    </span>

                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="pt-4">

                    <p className="text-xs text-[#8A7356] mb-1">
                      {getCategoryName(product.category)}
                    </p>

                    <Link
                      href={`/paticular_product_page?id=${product._id}`}
                      className="hover:text-[#8A7356]"
                    >
                      <h3 className="font-bold text-lg">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    {/* PRICE AND STOCK */}
                    <div className="flex items-center justify-between mt-4">

                      <div>
                        {product.discountPrice != null &&
                        product.discountPrice < product.price ? (
                          <div className="flex flex-col">
                            <span className="text-xl font-bold">
                              {formatPrice(product.discountPrice)}
                            </span>

                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stock <= 0}
                        className="bg-[#8A7356] text-white px-4 py-2 text-sm hover:bg-[#4A2A02] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// PAGE WITH SUSPENSE
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center text-[#4A2A02]">
          Loading collection...
        </div>
      }
    >
      <ProductPageContent />
    </Suspense>
  );
}