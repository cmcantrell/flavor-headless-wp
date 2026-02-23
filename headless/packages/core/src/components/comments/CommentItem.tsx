"use client";

import type { Comment, DiscussionConfig } from "../../lib/wordpress/types";

interface CommentItemProps {
  comment: Comment;
  discussionConfig: DiscussionConfig | null;
  depth?: number;
  onReply?: (commentId: string) => void;
}

export function CommentItem({
  comment,
  discussionConfig,
  depth = 1,
  onReply,
}: CommentItemProps) {
  const showAvatars = discussionConfig?.showAvatars ?? true;
  const threadingEnabled = discussionConfig?.threadComments ?? true;
  const maxDepth = discussionConfig?.threadCommentsDepth ?? 5;
  const canNest = threadingEnabled && depth < maxDepth;
  const avatarUrl = comment.author?.node?.avatar?.url;
  const authorName = comment.author?.node?.name || "Anonymous";

  return (
    <div
      className={depth > 1 ? "ml-8 border-l-2 border-gray-100 pl-6" : ""}
      id={`comment-${comment.databaseId}`}
    >
      <div className="py-4">
        <div className="flex items-start gap-3">
          {showAvatars && avatarUrl && (
            <img
              src={avatarUrl}
              alt={authorName}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 text-sm">
                {authorName}
              </span>
              <time className="text-xs text-gray-500">
                {new Date(comment.date).toLocaleDateString()}
              </time>
            </div>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            {canNest && onReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {comment.replies?.nodes && comment.replies.nodes.length > 0 && (
        <div>
          {comment.replies.nodes.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              discussionConfig={discussionConfig}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
