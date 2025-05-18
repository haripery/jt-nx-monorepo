'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_APPLICATIONS_QUERY, DELETE_APPLICATION_MUTATION } from '../../graphql/job-applications';
import { ApplicationStatus } from '@jt-nx/shared-models';
import Link from 'next/link';

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Status badge component
const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return 'bg-yellow-100 text-yellow-800';
      case ApplicationStatus.INTERVIEW:
        return 'bg-blue-100 text-blue-800';
      case ApplicationStatus.OFFER:
        return 'bg-green-100 text-green-800';
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ApplicationStatus.ACCEPTED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
      {status}
    </span>
  );
};

export default function JobApplicationTable() {
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Fetch job applications
  const { loading, error, data, refetch } = useQuery(GET_APPLICATIONS_QUERY);
  
  // Delete mutation
  const [deleteApplication] = useMutation(DELETE_APPLICATION_MUTATION, {
    onCompleted: () => {
      setDeleteMessage({ type: 'success', text: 'Application deleted successfully' });
      refetch();
      setTimeout(() => setDeleteMessage(null), 3000);
    },
    onError: () => {
      setDeleteMessage({ type: 'error', text: 'Failed to delete application' });
      setTimeout(() => setDeleteMessage(null), 3000);
    }
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      await deleteApplication({ variables: { id } });
    }
  };

  if (loading) return <div className="text-center py-10">Loading applications...</div>;
  if (error) return <div className="text-red-500 text-center py-10">Error loading applications: {error.message}</div>;

  const applications = data?.applications || [];

  return (
    <div className="overflow-x-auto">
      {deleteMessage && (
        <div className={`mb-4 p-3 rounded ${deleteMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {deleteMessage.text}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No job applications yet.</p>
          <Link href="/dashboard/applications/new" 
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Your First Application
          </Link>
        </div>
      ) : (
        <table className="min-w-full bg-white border divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="divide-x divide-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((app: any) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{app.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.position}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(app.appliedDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link href={`/dashboard/applications/${app.id}`} className="text-blue-600 hover:text-blue-900">
                    View
                  </Link>
                  <Link href={`/dashboard/applications/${app.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6 flex justify-end">
        <Link href="/dashboard/applications/new" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add New Application
        </Link>
      </div>
    </div>
  );
}
