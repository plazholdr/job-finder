export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Test Page Working!
        </h1>
        <p className="text-lg text-gray-600">
          If you can see this, the Next.js server is running correctly.
        </p>
        <div className="mt-8">
          <a 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Go to Home Page
          </a>
        </div>
      </div>
    </div>
  );
}
