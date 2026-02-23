"use client";

import { useState, useCallback, useRef } from "react";
import { graphqlFetcher } from "../swr";
import type { PageInfo } from "../wordpress/types";

interface LoadMoreResult<T> {
  items: T[];
  pageInfo: PageInfo;
  loading: boolean;
  loadMore: () => void;
}

export function useLoadMore<TItem, TResponse>(
  initialItems: TItem[],
  initialPageInfo: PageInfo,
  query: string,
  variables: Record<string, unknown>,
  batchSize: number,
  extractItems: (data: TResponse) => TItem[],
  extractPageInfo: (data: TResponse) => PageInfo,
): LoadMoreResult<TItem> {
  const [items, setItems] = useState<TItem[]>(initialItems);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [loading, setLoading] = useState(false);
  const variablesRef = useRef(variables);
  variablesRef.current = variables;

  const loadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || loading) return;
    setLoading(true);

    try {
      const data = await graphqlFetcher<TResponse>([
        query,
        { ...variablesRef.current, first: batchSize, after: pageInfo.endCursor },
      ]);
      setItems((prev) => [...prev, ...extractItems(data)]);
      setPageInfo(extractPageInfo(data));
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoading(false);
    }
  }, [pageInfo.hasNextPage, pageInfo.endCursor, loading, query, batchSize, extractItems, extractPageInfo]);

  return { items, pageInfo, loading, loadMore };
}
