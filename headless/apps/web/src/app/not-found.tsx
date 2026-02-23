import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">Page not found.</p>
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        Go home &rarr;
      </Link>
    </div>
  );
}
