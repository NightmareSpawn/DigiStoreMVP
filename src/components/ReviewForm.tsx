"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) return <p className="text-sm text-green-600">نظر شما ثبت شد. سپاسگزاریم!</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">امتیاز شما:</span>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ⭐
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="نظر شما درباره این محصول..."
        rows={2}
        className="border rounded-lg px-3 py-2 w-full text-sm"
      />
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <button
        disabled={loading}
        className="bg-brand-500 text-white rounded-lg px-4 py-1.5 text-sm disabled:opacity-50"
      >
        {loading ? "در حال ثبت..." : "ثبت نظر"}
      </button>
    </form>
  );
}
