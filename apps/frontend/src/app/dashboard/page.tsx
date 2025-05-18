'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', !!token);
      console.log('User object:', user);
      
      if (!token) {
        // Only redirect if no token exists
        console.log('No token found, redirecting to login');
        router.push('/login');
      } else {
        // We have a token, so we're authenticated even if user data isn't loaded yet
        console.log('Token found, staying on dashboard');
        setIsLoading(false);
      }
    };
    
    // Short timeout to ensure everything is loaded
    const timer = setTimeout(checkAuth, 500);
    return () => clearTimeout(timer);
  }, [user, router]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-xl text-gray-600 mb-4">Loading your dashboard...</div>
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Welcome to your Job Tracker Dashboard{user?.firstName ? `, ${user.firstName}` : ''}!
      </h1>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">My Applications</h2>
            <p className="text-gray-600 mb-4">View, manage, and track all your job applications in one place.</p>
            <Link 
              href="/dashboard/applications" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              View Applications
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Add New Application</h2>
            <p className="text-gray-600 mb-4">Track a new job opportunity by adding it to your application list.</p>
            <Link 
              href="/dashboard/applications/new" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Add New Application
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-gray-600">
        <p>Track your job search progress and stay organized with Job Tracker.</p>
      </div>
    </div>
  );
}
