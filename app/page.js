"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, total: 0 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "newest",
    page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load categories once for the filter dropdown
  useEffect(() => {
    api("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  // load products again whenever a filter changes
  useEffect(() => {
    const query = new URLSearchParams({ limit: "8", sort: filters.sort, page: String(filters.page) });
    if (filters.search) query.set("search", filters.search);
    if (filters.category) query.set("category", filters.category);

    setLoading(true);
    setError("");
    api(`/products?${query.toString()}`)
      .then((data) => {
        setProducts(data.products);
        setPageInfo({ totalPages: data.totalPages, total: data.total });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  // any filter change should go back to page 1
  const changeFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    changeFilter("search", searchText.trim());
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* search, category and sort */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search products..."
            className="w-full min-w-40 rounded border p-2"
          />
          <button className="rounded bg-blue-600 px-4 text-white">Search</button>
        </form>

        <select
          value={filters.category}
          onChange={(e) => changeFilter("category", e.target.value)}
          className="rounded border p-2"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => changeFilter("sort", e.target.value)}
          className="rounded border p-2"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && products.length === 0 && !error && (
        <p className="text-gray-500">No products found.</p>
      )}

      {/* product grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {/* pagination */}
      {pageInfo.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {filters.page} of {pageInfo.totalPages}
          </span>
          <button
            disabled={filters.page >= pageInfo.totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}