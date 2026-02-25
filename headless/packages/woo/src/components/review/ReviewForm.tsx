"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@flavor/core/context/AuthContext";
import { graphqlFetcher } from "@flavor/core/lib/swr";
import { WRITE_REVIEW } from "../../lib/queries/reviews";
import type { WriteReviewResponse } from "../../lib/types";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
  productDatabaseId: number;
  onSuccess?: () => void;
}

export function ReviewForm({ productDatabaseId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const input: Record<string, unknown> = {
        rating,
        commentOn: productDatabaseId,
        content,
      };

      if (!isLoggedIn) {
        if (author) input.author = author;
        if (authorEmail) input.authorEmail = authorEmail;
      }

      await graphqlFetcher<WriteReviewResponse>([
        WRITE_REVIEW,
        { input },
      ]);

      setContent("");
      setRating(0);
      setAuthor("");
      setAuthorEmail("");
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div
        className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800"
        role="alert"
      >
        Your review has been submitted. It may need to be approved before
        appearing.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLoggedIn ? (
        <p className="text-sm text-gray-600">
          Reviewing as{" "}
          <span className="font-medium">{user.name || user.email}</span>
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="review-author"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              id="review-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="review-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              id="review-email"
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
      </div>

      <div>
        <label
          htmlFor="review-content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Review *
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
