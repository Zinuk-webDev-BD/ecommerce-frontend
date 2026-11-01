"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  // when this has an id, the form updates that category, otherwise it creates a new one
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);

  // load categories (again after every change)
  useEffect(() => {
    api("/categories")
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message));
  }, [reload]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingId) {
        await api(`/categories/${editingId}`, { method: "PUT", token, body: form });
        setMessage("Category updated");
      } else {
        await api("/categories", { method: "POST", token, body: form });
        setMessage("Category created");
      }
      resetForm();
      setReload((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, description: category.description || "" });
    setMessage("");
    setError("");
  };

  const handleDelete = async (category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    setError("");
    setMessage("");
    try {
      await api(`/categories/${category._id}`, { method: "DELETE", token });
      setMessage("Category deleted");
      setReload((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Categories</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-start gap-2">
        <input
          name="name"
          placeholder="Category name"
          value={form.name}
          onChange={handleChange}
          required
          className="rounded border p-2"
        />
        <input
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="min-w-60 flex-1 rounded border p-2"
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          {editingId ? "Update" : "Add category"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="rounded border px-4 py-2">
            Cancel
          </button>
        )}
      </form>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-3 text-sm text-green-600">{message}</p>}

      {categories.length === 0 && <p className="text-gray-500">No categories yet.</p>}

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c._id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-500">{c.description || "No description"}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => startEdit(c)} className="text-blue-600 underline">
                Edit
              </button>
              <button onClick={() => handleDelete(c)} className="text-red-600 underline">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}