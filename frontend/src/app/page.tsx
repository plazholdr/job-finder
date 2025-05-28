import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Job Finder Portal
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Find your dream job today
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link 
            href="/auth/login" 
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Sign in
          </Link>
          <Link 
            href="/auth/register" 
            className="group relative flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
