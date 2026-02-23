"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { useSiteSettings } from "../../context/SiteContext";
import { useAuth } from "../../context/AuthContext";
import { GET_COMMENTS_BY_POST } from "../../lib/wordpress/queries/comments";
import { graphqlFetcher } from "../../lib/swr";
import type { Comment } from "../../lib/wordpress/types";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { AuthModal } from "../auth/AuthModal";

interface CommentsByPostResponse {
  post: {
    commentCount: number;
    commentStatus: string;
    comments: {
      nodes: Comment[];
    };
  };
}

interface CommentSectionProps {
  postDatabaseId: number;
  commentStatus: string;
  initialComments: Comment[];
  initialCount: number;
}

export function CommentSection({
  postDatabaseId,
  commentStatus,
  initialComments,
  initialCount,
}: CommentSectionProps) {
  const { discussionConfig } = useSiteSettings();
  const { user } = useAuth();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { data, mutate } = useSWR<CommentsByPostResponse>(
    [GET_COMMENTS_BY_POST, { postId: postDatabaseId }],
    graphqlFetcher,
    {
      fallbackData: {
        post: {
          commentCount: initialCount,
          commentStatus,
          comments: { nodes: initialComments },
        },
      },
      revalidateOnMount: false,
      dedupingInterval: 2000,
    }
  );

  const comments = data?.post?.comments?.nodes ?? initialComments;
  const commentCount = data?.post?.commentCount ?? initialCount;
  const isOpen = commentStatus === "open";

  const handleReply = useCallback((commentId: string) => {
    setReplyTo(commentId);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleCommentSuccess = useCallback(async () => {
    setReplyTo(null);
    await mutate();
  }, [mutate]);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {commentCount > 0
          ? `${commentCount} Comment${commentCount !== 1 ? "s" : ""}`
          : "Comments"}
      </h2>

      {comments.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                discussionConfig={discussionConfig}
                onReply={isOpen ? handleReply : undefined}
              />
              {replyTo === comment.id && (
                <div className="ml-8 pl-6 pb-4">
                  <CommentForm
                    postDatabaseId={postDatabaseId}
                    parentId={comment.id}
                    onSuccess={handleCommentSuccess}
                    onCancel={handleCancelReply}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        isOpen && (
          <p className="text-gray-500 text-sm mb-6">
            No comments yet. Be the first to comment!
          </p>
        )
      )}

      {isOpen ? (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leave a Comment
          </h3>
          {discussionConfig?.commentRegistration && !user ? (
            <div className="text-sm text-gray-500">
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>{" "}
              to post a comment.
            </div>
          ) : (
            <CommentForm
              postDatabaseId={postDatabaseId}
              onSuccess={handleCommentSuccess}
            />
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mt-4">
          Comments are closed for this post.
        </p>
      )}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </section>
  );
}
