"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// product is given when we edit, empty when we create a new one
export default function AdminProductForm({ product }) {
  const router = useRouter();
  const { token } = useAuth();
  const editing = Boolean(product);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? "",
    stock: product?.stock ?? "",
    category: product?.category?._id || "",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // categories for the dropdown
  useEffect(() => {
    api("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => {
    const chosen = Array.from(e.target.files);
    if (chosen.length > 5) {
      setError("You can upload at most 5 images");
      return;
    }
    setError("");
    setFiles(chosen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editing) {
        // the backend update does not change images, only these fields
        await api(`/products/${product._id}`, {
          method: "PUT",
          token,
          body: {
            name: form.name,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            category: form.category,
          },
        });
      } else {
        // images are sent as a form with files
        const data = new FormData();
        data.append("name", form.name);
        data.append("description", form.description);
        data.append("price", form.price);
        data.append("stock", form.stock || 0);
        data.append("category", form.category);
        files.forEach((file) => data.append("images", file));
        await api("/products", { method: "POST", token, body: data });
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-3">
      <h1 className="text-2xl font-bold">{editing ? "Edit product" : "New product"}</h1>

      <input
        name="name"
        placeholder="Product name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full rounded border p-2"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        rows={3}
        className="w-full rounded border p-2"
      />
      <div className="flex gap-3">
        <input
          name="price"
          type="number"
          min="0"
          placeholder="Price (BDT)"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        <input
          name="stock"
          type="number"
          min="0"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          className="w-full rounded border p-2"
        />
      </div>

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
        className="w-full rounded border p-2"
      >
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      {!editing && (
        <div>
          <label className="mb-1 block text-sm">Images (up to 5, jpg/png/webp, 2MB each)</label>
          <input type="file" accept="image/*" multiple onChange={handleFiles} />
          {files.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">{files.length} image(s) selected</p>
          )}
        </div>
      )}

      {editing && (
        <p className="text-xs text-gray-500">
          Images cannot be changed here. To use new images, delete this product and create it again.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : editing ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}