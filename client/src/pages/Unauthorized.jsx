// Unauthorized Page
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Unauthorized</h1>
      <p className="text-xl text-gray-600 mb-8">
        You don't have permission to access this page.
      </p>
      <a
        href="/home"
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

export default Unauthorized;
