'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_APPLICATION_QUERY, DELETE_APPLICATION_MUTATION } from '../../../graphql/job-applications';
import Link from 'next/link';
import { useState } from 'react';
import { ApplicationStatus } from '@jt-nx/shared-models';

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch the application details
  const { loading, error, data } = useQuery(GET_APPLICATION_QUERY, {
    variables: { id: applicationId },
  });

  // Delete mutation
  const [deleteApplication] = useMutation(DELETE_APPLICATION_MUTATION, {
    onCompleted: () => {
      router.push('/dashboard/applications');
    },
    onError: (error) => {
      setDeleteError(`Failed to delete: ${error.message}`);
    }
  });

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      await deleteApplication({ variables: { id: applicationId } });
    }
  };

  if (loading) return <div className="text-center py-10">Loading application details...</div>;
  if (error) return <div className="text-red-500 text-center py-10">Error loading application: {error.message}</div>;
  if (!data?.application) return <div className="text-center py-10">Application not found</div>;

  const application = data.application;

  return (
    <div>
      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {deleteError}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{application.company} - {application.position}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/applications/${applicationId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Application Details</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.company}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Position</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.position}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.location}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Applied Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(application.appliedDate)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full
                  ${application.status === ApplicationStatus.APPLIED ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${application.status === ApplicationStatus.INTERVIEW ? 'bg-blue-100 text-blue-800' : ''}
                  ${application.status === ApplicationStatus.OFFER ? 'bg-green-100 text-green-800' : ''}
                  ${application.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-800' : ''}
                  ${application.status === ApplicationStatus.ACCEPTED ? 'bg-purple-100 text-purple-800' : ''}
                `}>
                  {application.status}
                </span>
              </dd>
            </div>
            {application.salary && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Salary</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.salary}</dd>
              </div>
            )}
            {application.contactName && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.contactName}</dd>
              </div>
            )}
            {application.contactEmail && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a href={`mailto:${application.contactEmail}`} className="text-blue-600 hover:underline">
                    {application.contactEmail}
                  </a>
                </dd>
              </div>
            )}
            {application.nextFollowUp && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Next Follow-up</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(application.nextFollowUp)}</dd>
              </div>
            )}
            {application.notes && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/dashboard/applications" className="text-blue-600 hover:underline">
          ← Back to applications
        </Link>
      </div>
    </div>
  );
}
