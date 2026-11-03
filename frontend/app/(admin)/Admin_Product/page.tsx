"use client";

import React, { useEffect, useState } from "react";

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
isActive: boolean;
}

interface FormData {
name: string;
description: string;
price: string;
discountPrice: string;
category: string;
stock: string;
images: string;
isFeatured: boolean;
}

const INITIAL_FORM: FormData = {
name: "",
description: "",
price: "",
discountPrice: "",
category: "",
stock: "",
images: "",
isFeatured: false,
};

export default function AdminProductPage() {
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<Category[]>([]);

const [showModal, setShowModal] = useState(false);
const [editingProduct, setEditingProduct] = useState<Product | null>(null);

const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [isDeleting, setIsDeleting] = useState<string | null>(null);

const [errorMsg, setErrorMsg] = useState("");
const [successMsg, setSuccessMsg] = useState("");

const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

// FETCH PRODUCTS AND CATEGORIES
const fetchData = async () => {
try {
setIsLoading(true);
setErrorMsg("");

  const [productResponse, categoryResponse] = await Promise.all([
    fetch(`${API_URL}/api/products`, {
      credentials: "include",
    }),
    fetch(`${API_URL}/api/categories`, {
      credentials: "include",
    }),
  ]);

  const productData = await productResponse.json();
  const categoryData = await categoryResponse.json();

  if (!productResponse.ok) {
    throw new Error(productData.message || "Unable to fetch products.");
  }

  if (!categoryResponse.ok) {
    throw new Error(categoryData.message || "Unable to fetch categories.");
  }

  setProducts(productData.products || []);
  setCategories(categoryData.categories || []);
} catch (error) {
  setErrorMsg(
    error instanceof Error ? error.message : "Something went wrong."
  );
} finally {
  setIsLoading(false);
}

};

useEffect(() => {
fetchData();
}, []);

// INPUT HANDLER
const handleChange = (
e: React.ChangeEvent<
HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>
) => {
const { name, value } = e.target;

setFormData((prev) => ({
  ...prev,
  [name]: value,
}));

};

// OPEN ADD PRODUCT MODAL
const openAddModal = () => {
setEditingProduct(null);
setFormData({ ...INITIAL_FORM });
setErrorMsg("");
setShowModal(true);
};

// OPEN UPDATE PRODUCT MODAL
const openEditModal = (product: Product) => {
setEditingProduct(product);

setFormData({
  name: product.name,
  description: product.description,
  price: String(product.price),
  discountPrice:
    product.discountPrice !== null &&
    product.discountPrice !== undefined
      ? String(product.discountPrice)
      : "",
  category:
    typeof product.category === "object"
      ? product.category?._id || ""
      : product.category || "",
  stock: String(product.stock),
  images: product.images?.join(", ") || "",
  isFeatured: product.isFeatured,
});

setErrorMsg("");
setSuccessMsg("");
setShowModal(true);

};

// CLOSE MODAL
const closeModal = () => {
setShowModal(false);
setEditingProduct(null);
setFormData({ ...INITIAL_FORM });
setErrorMsg("");
};

// VALIDATE FORM
const validateForm = () => {
const price = Number(formData.price);
const stock = Number(formData.stock);

const discountPrice =
  formData.discountPrice.trim() === ""
    ? null
    : Number(formData.discountPrice);

if (!formData.name.trim() || !formData.description.trim()) {
  setErrorMsg("Please enter product name and description.");
  return null;
}

if (!formData.price.trim() || !Number.isFinite(price) || price < 0) {
  setErrorMsg("Please enter a valid product price.");
  return null;
}

if (
  !formData.stock.trim() ||
  !Number.isInteger(stock) ||
  stock < 0
) {
  setErrorMsg("Please enter a valid stock quantity.");
  return null;
}

if (
  discountPrice !== null &&
  (!Number.isFinite(discountPrice) ||
    discountPrice < 0 ||
    discountPrice > price)
) {
  setErrorMsg(
    "Discount price must be between 0 and the original price."
  );
  return null;
}

if (!formData.category) {
  setErrorMsg("Please select a category.");
  return null;
}

const images = formData.images
  .split(",")
  .map((image) => image.trim())
  .filter(Boolean);

return {
  name: formData.name.trim(),
  description: formData.description.trim(),
  price,
  discountPrice,
  category: formData.category,
  stock,
  images,
  isFeatured: formData.isFeatured,
};

};

// ADD PRODUCT
const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();

setErrorMsg("");
setSuccessMsg("");

const productData = validateForm();

if (!productData) return;

try {
  setIsSaving(true);

  const response = await fetch(`${API_URL}/api/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(productData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to add product.");
  }

  closeModal();
  setSuccessMsg("Product added successfully!");

  await fetchData();
} catch (error) {
  setErrorMsg(
    error instanceof Error ? error.message : "Something went wrong."
  );
} finally {
  setIsSaving(false);
}

};

// UPDATE PRODUCT
const handleUpdateProduct = async (
e: React.FormEvent<HTMLFormElement>
) => {
e.preventDefault();

if (!editingProduct) return;

setErrorMsg("");
setSuccessMsg("");

const productData = validateForm();

if (!productData) return;

try {
  setIsSaving(true);

  const response = await fetch(
    `${API_URL}/api/admin/products/${editingProduct._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(productData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update product.");
  }

  closeModal();
  setSuccessMsg("Product updated successfully!");

  await fetchData();
} catch (error) {
  setErrorMsg(
    error instanceof Error ? error.message : "Something went wrong."
  );
} finally {
  setIsSaving(false);
}

};

// DELETE PRODUCT
const handleDeleteProduct = async (productId: string) => {
const confirmed = window.confirm(
"Are you sure you want to delete this product?"
);

if (!confirmed) return;

setErrorMsg("");
setSuccessMsg("");

try {
  setIsDeleting(productId);

  const response = await fetch(
    `${API_URL}/api/admin/products/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete product.");
  }

  setSuccessMsg("Product deleted successfully!");

  await fetchData();
} catch (error) {
  setErrorMsg(
    error instanceof Error ? error.message : "Something went wrong."
  );
} finally {
  setIsDeleting(null);
}

};

return (
<div className="min-h-screen bg-[#F4EFE6] p-5 md:p-10">
{/* HEADER */}
<div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
<div>
<p className="text-sm font-semibold tracking-[3px] text-[#8A7356]">
ELVORA ADMIN PANEL
</p>

      <h1 className="mt-2 font-serif text-3xl font-bold text-[#4A2A02] md:text-4xl">
        Product Management
      </h1>

      <p className="mt-2 text-sm text-[#8A7356]">
        Manage your store products here.
      </p>
    </div>

    <button
      onClick={openAddModal}
      className="rounded-md bg-[#6B4423] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#4A2A02]"
    >
      + ADD PRODUCT
    </button>
  </div>

  {/* SUCCESS MESSAGE */}
  {successMsg && (
    <div className="mb-5 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
      {successMsg}
    </div>
  )}

  {/* ERROR MESSAGE */}
  {errorMsg && !showModal && (
    <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
      {errorMsg}
    </div>
  )}

  {/* PRODUCT COUNT */}
  <div className="mb-6 rounded-lg border border-[#D5C2A9] bg-[#EDE3D5] p-5">
    <p className="text-sm font-medium text-[#8A7356]">TOTAL PRODUCTS</p>

    <h2 className="mt-1 text-3xl font-bold text-[#4A2A02]">
      {products.length}
    </h2>
  </div>

  {/* PRODUCT LIST */}
  <div className="overflow-hidden rounded-lg border border-[#D5C2A9] bg-[#F8F5F0] shadow-sm">
    <div className="border-b border-[#D5C2A9] px-6 py-5">
      <h2 className="font-serif text-xl font-bold text-[#4A2A02]">
        All Products
      </h2>
    </div>

    {isLoading ? (
      <div className="py-16 text-center text-[#8A7356]">
        Loading products...
      </div>
    ) : products.length === 0 ? (
      <div className="py-16 text-center text-[#8A7356]">
        No products found. Add your first product!
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#EDE3D5] text-[#4A2A02]">
            <tr>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Stock</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#D5C2A9]">
            {products.map((product) => (
              <tr
                key={product._id}
                className="hover:bg-[#EDE3D5]/50"
              >
                {/* PRODUCT */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-12 w-12 rounded-md border border-[#D5C2A9] object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#EDE3D5] text-xs text-[#8A7356]">
                        No Image
                      </div>
                    )}

                    <span className="font-semibold text-[#4A2A02]">
                      {product.name}
                    </span>
                  </div>
                </td>

                {/* PRICE */}
                <td className="px-5 py-4 text-[#4A2A02]">
                  <p>
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  {product.discountPrice !== null &&
                    product.discountPrice !== undefined && (
                      <p className="text-sm text-green-700">
                        ₹
                        {product.discountPrice.toLocaleString("en-IN")}
                      </p>
                    )}
                </td>

                {/* CATEGORY */}
                <td className="px-5 py-4 text-[#6B4423]">
                  {typeof product.category === "object"
                    ? product.category?.name || "—"
                    : "—"}
                </td>

                {/* STOCK */}
                <td className="px-5 py-4 text-[#4A2A02]">
                  {product.stock}
                </td>

                {/* STATUS */}
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="rounded-md bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                    >
                      UPDATE
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      disabled={isDeleting === product._id}
                      className="rounded-md bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting === product._id ? "DELETING..." : "DELETE"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  {/* ADD / UPDATE PRODUCT MODAL */}
  {showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#D5C2A9] bg-[#F8F5F0] shadow-2xl">
        {/* MODAL HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D5C2A9] bg-[#F8F5F0] px-6 py-5">
          <h2 className="font-serif text-2xl font-bold text-[#4A2A02]">
            {editingProduct ? "Update Product" : "Add New Product"}
          </h2>

          <button
            type="button"
            onClick={closeModal}
            className="text-3xl text-[#8A7356] hover:text-[#4A2A02]"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          className="space-y-5 p-6"
        >
          {errorMsg && (
            <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {/* PRODUCT NAME */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4A2A02]">
              PRODUCT NAME *
            </label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
              className="w-full rounded-md border border-[#D5C2A9] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#8A7356]"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4A2A02]">
              DESCRIPTION *
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={3}
              required
              className="w-full resize-none rounded-md border border-[#D5C2A9] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#8A7356]"
            />
          </div>

          {/* PRICE AND DISCOUNT */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4A2A02]">
                PRICE (₹) *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="1999"
                className="w-full rounded-md border border-[#D5C2A9] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#8A7356]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4A2A02]">
                DISCOUNT PRICE (₹)
              </label>

              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="1499"
                className="w-full rounded-md border border-[#D5C2A9] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#8A7356]"
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4A2A02]">
              CATEGORY *
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-[#D5C2A9] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#8A7356]"
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {categories.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                No categories available. Please add a category first.
              </p>
            )}
          </div>

          {/* STOCK */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4A2A02]">
              STOCK QUANTITY *
            </label>

            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              step="1"
              required
              placeholder="50"
              className="w-full rounded-md border border-[#D5C2A9] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#8A7356]"
            />
          </div>

          {/* IMAGES */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4A2A02]">
              PRODUCT IMAGE URLS
            </label>

            <textarea
              name="images"
              value={formData.images}
              onChange={handleChange}
              rows={3}
              placeholder="Paste image URLs separated by commas"
              className="w-full resize-none rounded-md border border-[#D5C2A9] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#8A7356]"
            />

            <p className="mt-1 text-xs text-[#8A7356]">
              Add multiple image URLs separated by commas.
            </p>
          </div>

          {/* FEATURED */}
          <label className="flex items-center gap-3 text-sm font-semibold text-[#4A2A02]">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isFeatured: e.target.checked,
                }))
              }
              className="h-4 w-4 accent-[#6B4423]"
            />
            Mark as Featured Product
          </label>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 border-t border-[#D5C2A9] pt-5">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-[#8A7356] px-5 py-2.5 text-[#6B4423] hover:bg-[#EDE3D5]"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={isSaving || categories.length === 0}
              className="rounded-md bg-[#6B4423] px-6 py-2.5 font-semibold text-white hover:bg-[#4A2A02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? editingProduct
                  ? "UPDATING..."
                  : "ADDING..."
                : editingProduct
                  ? "UPDATE PRODUCT"
                  : "ADD PRODUCT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

);
}