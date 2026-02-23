import Link from "next/link";
import type { Post } from "../../lib/wordpress/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <time className="text-xs text-gray-500">
        {new Date(post.date).toLocaleDateString()}
      </time>
      <h2 className="text-xl font-semibold text-gray-900 mt-1 mb-2">
        <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
          {post.title}
        </Link>
      </h2>
      <div
        className="text-gray-600 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: post.excerpt }}
      />
      {post.categories && post.categories.nodes.length > 0 && (
        <div className="mt-3 flex gap-2">
          {post.categories.nodes.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
