import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Language AI</span>
            </Link>
          </div>

          <div className="flex space-x-8">
            <Link
              href="/scenarios"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === '/scenarios'
                  ? 'border-primary-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              Practice Scenarios
            </Link>
            <Link
              href="/conversation"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === '/conversation'
                  ? 'border-primary-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              Free Conversation
            </Link>
            <Link
              href="/history"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === '/history'
                  ? 'border-primary-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              History
            </Link>
          </div>

          <div className="flex items-center">
            <button className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 