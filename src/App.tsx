import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            SVR Co-Living PG — Management System
          </h1>
          <p className="mt-4 text-gray-600">
            Welcome to SVR Co-Living PG Management System
          </p>
        </div>
      </div>
      <Analytics />
    </>
  );
}

export default App;
