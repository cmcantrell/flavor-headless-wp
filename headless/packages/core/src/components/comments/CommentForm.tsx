"use client";

import { useState, FormEvent } from "react";
import { useSiteSettings } from "../../context/SiteContext";
import { useAuth } from "../../context/AuthContext";
import { graphqlFetcher } from "../../lib/swr";
import { CREATE_COMMENT } from "../../lib/wordpress/queries/comments";
import type { CreateCommentResponse } from "../../lib/wordpress/types";

interface CommentFormProps {
  postDatabaseId: number;
  parentId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentForm({
  postDatabaseId,
  parentId = null,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const { discussionConfig } = useSiteSettings();
  const { user } = useAuth();
  const requireNameEmail = discussionConfig?.requireNameEmail ?? true;
  const isLoggedIn = !!user;

  const [author, setAuthor] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const variables: Record<string, unknown> = {
        commentOn: postDatabaseId,
        content,
      };

      if (!isLoggedIn) {
        if (author) variables.author = author;
        if (authorEmail) variables.authorEmail = authorEmail;
      }

      if (parentId) variables.parent = parentId;

      const data = await graphqlFetcher<CreateCommentResponse>([
        CREATE_COMMENT,
        variables,
      ]);

      if (data.createComment?.success) {
        setContent("");
        setAuthor("");
        setAuthorEmail("");
        setSuccess(true);
        onSuccess?.();
      } else {
        setError("Failed to submit comment. It may be awaiting moderation.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit comment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800" role="alert">
        Your comment has been submitted.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {parentId && onCancel && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">
            Replying to comment
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      {isLoggedIn ? (
        <p className="text-sm text-gray-600">
          Commenting as <span className="font-medium">{user.name || user.email}</span>
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`comment-author${parentId ? `-${parentId}` : ""}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name{requireNameEmail && " *"}
            </label>
            <input
              id={`comment-author${parentId ? `-${parentId}` : ""}`}
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required={requireNameEmail}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor={`comment-email${parentId ? `-${parentId}` : ""}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email{requireNameEmail && " *"}
            </label>
            <input
              id={`comment-email${parentId ? `-${parentId}` : ""}`}
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              required={requireNameEmail}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor={`comment-content${parentId ? `-${parentId}` : ""}`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Comment *
        </label>
        <textarea
          id={`comment-content${parentId ? `-${parentId}` : ""}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && <div className="text-sm text-red-600" role="alert">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : parentId ? "Post Reply" : "Post Comment"}
      </button>
    </form>
  );
}
