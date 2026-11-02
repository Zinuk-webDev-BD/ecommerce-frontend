"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StarRating from "@/components/StarRating";

export default function ProductReviews({ productId }) {
  const { token, user } = useAuth();

  const [data, setData] = useState({ ratingAverage: 0, ratingCount: 0, reviews: [] });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // the form (used for a new review and for editing my own review)
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // load the reviews, again when the page changes or after any change
  useEffect(() => {
    api(`/products/${productId}/reviews?page=${page}&limit=5`)
      .then((res) => {
        setData(res);
        setTotalPages(res.totalPages);
      })
      .catch((err) => setError(err.message));
  }, [productId, page, reload]);

  // is there a review of mine in this page?
  const myReview = user ? data.reviews.find((r) => r.user?._id === user._id) : null;

  const resetForm = () => {
    setRating(0);
    setComment("");
    setEditingId(null);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (rating < 1) {
      setFormError("Please choose a star rating");
      return;
    }

    setSaving(true);
    try {
      // rating must be a number for the backend
      const body = { rating: Number(rating), comment };

      if (editingId) {
        await api(`/reviews/${editingId}`, { method: "PUT", token, body });
      } else {
        await api(`/products/${productId}/reviews`, { method: "POST", token, body });
      }

      resetForm();
      setPage(1);
      setReload((n) => n + 1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setRating(review.rating);
    setComment(review.comment || "");
    setFormError("");
  };

  const handleDelete = async (review) => {
    if (!confirm("Delete this review?")) return;
    setFormError("");
    try {
      await api(`/reviews/${review._id}`, { method: "DELETE", token });
      resetForm();
      setReload((n) => n + 1);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // show the form for a new review, or when I am editing
  const showForm = user && (!myReview || editingId);

  return (
    <section className="mt-10 border-t pt-6">
      <h2 className="text-xl font-bold">Reviews</h2>

      <div className="mt-2 flex items-center gap-2">
        <StarRating value={data.ratingAverage} />
        <span className="text-sm text-gray-600">
          {data.ratingCount > 0
            ? `${data.ratingAverage} out of 5 (${data.ratingCount} review${
                data.ratingCount > 1 ? "s" : ""
              })`
            : "No reviews yet"}
        </span>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 max-w-xl space-y-2 rounded border p-4">
          <p className="text-sm font-semibold">
            {editingId ? "Edit your review" : "Write a review"}
          </p>
          <StarRating value={rating} onChange={setRating} size="text-2xl" />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Write your comment (optional, 500 characters at most)"
            className="w-full rounded border p-2"
          />
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-2">
            <button
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-1 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update review" : "Submit review"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded border px-4 py-1">
                Cancel
              </button>
            )}
          </div>
          {!editingId && (
            <p className="text-xs text-gray-500">
              You can review only products that were delivered to you.
            </p>
          )}
        </form>
      )}

      {!user && (
        <p className="mt-4 text-sm text-gray-500">
          <Link href="/login" className="text-blue-600 underline">
            Login
          </Link>{" "}
          to write a review.
        </p>
      )}

      {/* delete error when the form is hidden */}
      {!showForm && formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}

      {/* review list */}
      <ul className="mt-6 space-y-4">
        {data.reviews.map((review) => {
          const mine = user && review.user?._id === user._id;
          const canDelete = mine || user?.role === "admin";

          return (
            <li key={review._id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{review.user?.name || "Deleted user"}</span>
                  <StarRating value={review.rating} size="text-base" />
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="mt-1 text-sm text-gray-700">{review.comment}</p>}

              {(mine || canDelete) && (
                <div className="mt-2 flex gap-3 text-sm">
                  {mine && (
                    <button onClick={() => startEdit(review)} className="text-blue-600 underline">
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(review)} className="text-red-600 underline">
                      Delete
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}