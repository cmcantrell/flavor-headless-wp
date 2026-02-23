import Link from "next/link";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_FRONT_PAGE } from "@flavor/core/lib/wordpress/queries/pages";
import { GET_POSTS } from "@flavor/core/lib/wordpress/queries/posts";
import type { FrontPageResponse, PostsResponse } from "@flavor/core/lib/wordpress/types";
import { PostCard } from "@flavor/core/components/blog/PostCard";

async function getHomePage() {
  try {
    const data = await wpFetch<FrontPageResponse>(GET_FRONT_PAGE);
    return data.nodeByUri;
  } catch {
    return null;
  }
}

async function getRecentPosts() {
  try {
    const data = await wpFetch<PostsResponse>(GET_POSTS, { first: 3 });
    return data.posts.nodes;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [page, posts] = await Promise.all([getHomePage(), getRecentPosts()]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero / Homepage Content */}
      {page ? (
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {page.title}
          </h1>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </section>
      ) : (
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome
          </h1>
          <p className="text-lg text-gray-600">
            Headless WordPress, powered by WPGraphQL and Next.js.
          </p>
        </section>
      )}

      {/* Recent Posts */}
      {posts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Posts
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all posts &rarr;
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
