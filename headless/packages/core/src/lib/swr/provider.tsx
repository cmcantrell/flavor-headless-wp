"use client";

import { SWRConfig } from "swr";
import { defaultSWRConfig } from "./config";

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={defaultSWRConfig}>{children}</SWRConfig>;
}
