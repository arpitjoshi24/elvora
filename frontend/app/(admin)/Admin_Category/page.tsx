"use client";

import React, { useEffect, useState } from "react";

interface Category {
_id: string;
name: string;
description: string;
image: string;
isActive: boolean;
}

export default function Page() {
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const [categories, setCategories] = useState<Category[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);

const [showModal, setShowModal] = useState(false);
const [editId, setEditId] = useState<string | null>(null);

const [formData, setFormData] = useState({
name: "",
description: "",
image: "",
});

const [errorMsg, setErrorMsg] = useState("");
const [successMsg, setSuccessMsg] = useState("");

// FETCH ALL CATEGORIES
const fetchCategories = async () => {
try {
setIsLoading(true);
setErrorMsg("");


  const response = await fetch(
    `${API_URL}/api/admin/categories`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch categories.");
  }

  setCategories(data.categories || []);

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
fetchCategories();
}, []);

// OPEN ADD MODAL
const handleAddClick = () => {
setEditId(null);


setFormData({
  name: "",
  description: "",
  image: "",
});

setErrorMsg("");
setSuccessMsg("");
setShowModal(true);


};

// OPEN UPDATE MODAL
const handleEditClick = (category: Category) => {
setEditId(category._id);


setFormData({
  name: category.name,
  description: category.description || "",
  image: category.image || "",
});

setErrorMsg("");
setSuccessMsg("");
setShowModal(true);


};

// HANDLE INPUT CHANGES
const handleChange = (
e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
const { name, value } = e.target;


setFormData((prev) => ({
  ...prev,
  [name]: value,
}));


};

// ADD / UPDATE CATEGORY
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();


setErrorMsg("");
setSuccessMsg("");

if (!formData.name.trim()) {
  setErrorMsg("Please enter category name.");
  return;
}

try {
  setIsSaving(true);

  const url = editId
    ? `${API_URL}/api/admin/categories/${editId}`
    : `${API_URL}/api/admin/categories`;

  const response = await fetch(url, {
    method: editId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to save category.");
  }

  setShowModal(false);

  setSuccessMsg(
    editId
      ? "Category updated successfully!"
      : "Category added successfully!"
  );

  setFormData({
    name: "",
    description: "",
    image: "",
  });

  setEditId(null);

  await fetchCategories();

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

// DELETE CATEGORY
const handleDelete = async (categoryId: string) => {
const confirmDelete = window.confirm(
"Are you sure you want to delete this category?"
);

if (!confirmDelete) return;

try {
  setErrorMsg("");
  setSuccessMsg("");

  const response = await fetch(
    `${API_URL}/api/admin/categories/${categoryId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete category.");
  }

  setSuccessMsg("Category deleted successfully!");

  await fetchCategories();

} catch (error) {
  setErrorMsg(
    error instanceof Error
      ? error.message
      : "Something went wrong."
  );
}

};

return ( <div className="min-h-screen bg-[#F4EFE6] p-5 md:p-10">


  {/* PAGE HEADER */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-10">

    <div>
      <p className="text-sm tracking-[3px] text-[#8A7356] font-semibold">
        ELVORA ADMIN PANEL
      </p>

      <h1 className="mt-2 text-3xl md:text-4xl font-serif font-bold text-[#4A2A02]">
        Category Management
      </h1>

      <p className="mt-2 text-sm text-[#8A7356]">
        Manage your store categories here.
      </p>
    </div>

    <button
      onClick={handleAddClick}
      className="bg-[#6B4423] hover:bg-[#4A2A02] text-white px-6 py-3 rounded-md font-semibold transition duration-300 shadow-md"
    >
      + ADD CATEGORY
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

  {/* CATEGORY COUNT */}
  <div className="mb-6 bg-[#EDE3D5] border border-[#D5C2A9] rounded-lg p-5">
    <p className="text-sm text-[#8A7356] font-medium">
      TOTAL CATEGORIES
    </p>

    <h2 className="text-3xl font-bold text-[#4A2A02] mt-1">
      {categories.length}
    </h2>
  </div>

  {/* CATEGORY LIST */}
  <div className="bg-[#F8F5F0] border border-[#D5C2A9] rounded-lg shadow-sm overflow-hidden">

    <div className="px-6 py-5 border-b border-[#D5C2A9]">
      <h2 className="text-xl font-serif font-bold text-[#4A2A02]">
        All Categories
      </h2>
    </div>

    {isLoading ? (

      <div className="py-16 text-center text-[#8A7356]">
        Loading categories...
      </div>

    ) : categories.length === 0 ? (

      <div className="py-16 text-center">
        <p className="text-xl font-serif text-[#4A2A02]">
          No categories found
        </p>

        <p className="mt-2 text-sm text-[#8A7356]">
          Click Add Category to create your first category.
        </p>
      </div>

    ) : (

      <div className="divide-y divide-[#D5C2A9]">

        {categories.map((category) => (

          <div
            key={category._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 md:px-6 py-5 hover:bg-[#EDE3D5]/50 transition"
          >

            {/* CATEGORY INFORMATION */}
            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-full bg-[#EDE3D5] border border-[#D5C2A9] flex items-center justify-center text-[#6B4423] font-serif font-bold text-lg">
                {category.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#4A2A02]">
                  {category.name}
                </h3>

                <p className="text-sm text-[#8A7356] mt-1">
                  {category.description || "No description available"}
                </p>

                <span
                  className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                    category.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">

              <button
                onClick={() => handleEditClick(category)}
                className="bg-[#8A7356] hover:bg-[#6B4423] text-white px-5 py-2 rounded-md text-sm font-semibold transition"
              >
                UPDATE
              </button>

              <button
                onClick={() => handleDelete(category._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md text-sm font-semibold transition"
              >
                DELETE
              </button>

            </div>

          </div>

        ))}

      </div>

    )}

  </div>

  {/* ADD / UPDATE MODAL */}
  {showModal && (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">

      <div className="w-full max-w-lg bg-[#F8F5F0] rounded-lg shadow-2xl border border-[#D5C2A9]">

        {/* MODAL HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#D5C2A9]">

          <h2 className="text-2xl font-serif font-bold text-[#4A2A02]">
            {editId ? "Update Category" : "Add Category"}
          </h2>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="text-2xl text-[#8A7356] hover:text-[#4A2A02]"
            aria-label="Close modal"
          >
            ×
          </button>

        </div>

        {/* MODAL FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {errorMsg && (
            <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {/* CATEGORY NAME */}
          <div>
            <label className="block text-sm font-semibold text-[#4A2A02] mb-2">
              CATEGORY NAME *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              required
              className="w-full bg-[#EDE3D5] border border-[#D5C2A9] rounded-md px-4 py-3 text-[#4A2A02] outline-none focus:ring-2 focus:ring-[#8A7356]"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold text-[#4A2A02] mb-2">
              DESCRIPTION
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description"
              rows={3}
              className="w-full resize-none bg-[#EDE3D5] border border-[#D5C2A9] rounded-md px-4 py-3 text-[#4A2A02] outline-none focus:ring-2 focus:ring-[#8A7356]"
            />
          </div>

          {/* IMAGE URL */}
          <div>
            <label className="block text-sm font-semibold text-[#4A2A02] mb-2">
              IMAGE URL
            </label>

            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Enter category image URL"
              className="w-full bg-[#EDE3D5] border border-[#D5C2A9] rounded-md px-4 py-3 text-[#4A2A02] outline-none focus:ring-2 focus:ring-[#8A7356]"
            />
          </div>

          {/* FORM BUTTONS */}
          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="border border-[#8A7356] text-[#6B4423] px-5 py-2.5 rounded-md hover:bg-[#EDE3D5] transition"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#6B4423] hover:bg-[#4A2A02] text-white px-6 py-2.5 rounded-md font-semibold transition disabled:opacity-60"
            >
              {isSaving
                ? "SAVING..."
                : editId
                ? "UPDATE CATEGORY"
                : "ADD CATEGORY"}
            </button>

          </div>

        </form>

      </div>

    </div>

  )}

</div>

);
}
