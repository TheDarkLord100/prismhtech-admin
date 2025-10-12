"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function EditProductPage() {
  const [image, setImage] = useState("/Assets/aluminium-scrap.jpg"); // default image

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex justify-center py-12 px-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-semibold text-gray-800 mb-8">Edit product</h1>

        <form className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Product name
            </label>
            <input
              type="text"
              placeholder="Aluminum Scrap"
              className="w-full rounded-xl border border-gray-400 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Product description
            </label>
            <input
              type="text"
              placeholder="Electroplating Chemicals/GTZ Pvt. Ltd./All Star Chemicals"
              className="w-full rounded-xl border border-gray-400 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Product category
            </label>
            <input
              type="text"
              placeholder="Electroplating Chemicals"
              className="w-full rounded-xl border border-gray-400 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Product Company */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Product company
            </label>
            <input
              type="text"
              placeholder="GTZ Pvt. Ltd."
              className="w-full rounded-xl border border-gray-400 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Product Channel Partner */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Product channel partner
            </label>
            <input
              type="text"
              placeholder="All Star Chemicals"
              className="w-full rounded-xl border border-gray-400 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Product Price */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              Product price per Kg
            </label>
            <input
              type="text"
              placeholder="₹23.6 per Kg"
              className="w-full rounded-xl border border-gray-400 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Image Upload */}
          <div className="flex items-center space-x-4 pt-3">
            <div className="w-42 h-34 rounded-md overflow-hidden border border-gray-300">
              <Image
                src={image}
                alt="Product"
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
            </div>
            <label className="cursor-pointer bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
              Change image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50] hover:opacity-90 text-white font-medium px-8 py-2 rounded-full shadow-md transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
