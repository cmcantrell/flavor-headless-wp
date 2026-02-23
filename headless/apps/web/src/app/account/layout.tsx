import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
