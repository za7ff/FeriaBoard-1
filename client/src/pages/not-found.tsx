import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <Link href="/">
          <a className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors">
            Go home
          </a>
        </Link>
      </div>
    </div>
  );
}
