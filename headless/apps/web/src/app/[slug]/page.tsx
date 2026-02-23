import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_PAGE_BY_URI } from "@flavor/core/lib/wordpress/queries/pages";
import type { PageByUriResponse } from "@flavor/core/lib/wordpress/types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPage(slug: string) {
  try {
    const data = await wpFetch<PageByUriResponse>(GET_PAGE_BY_URI, {
      uri: `/${slug}/`,
    });
    return data.pageBy;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page Not Found" };
  return { title: page.title };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
