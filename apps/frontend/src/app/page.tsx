'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Index() {
  const router = useRouter();
  
  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/dashboard/applications');
      }
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Job Tracker</h1>
          <p className="mt-2">Track and manage your job applications in one place</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Your Job Search, Organized</h2>
            <p className="text-xl text-gray-600">Keep track of all your job applications in one place and never miss an opportunity again.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Track Applications</h3>
              <p className="text-gray-600">Keep a record of all your job applications and their current status.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">Never Miss Follow-ups</h3>
              <p className="text-gray-600">Set reminders for interviews and follow-up activities.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Visualize your job search progress and improve your strategy.</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link href="/login" 
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
              Login
            </Link>
            <Link href="/register"
                  className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Job Tracker Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
