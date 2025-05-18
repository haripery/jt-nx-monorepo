'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_APPLICATION_MUTATION, UPDATE_APPLICATION_MUTATION, GET_APPLICATION_QUERY } from '../../graphql/job-applications';
import { useRouter } from 'next/navigation';
import { ApplicationStatus } from '@jt-nx/shared-models';

interface JobApplicationFormProps {
  applicationId?: string; // If provided, we're editing an existing application
}

export default function JobApplicationForm({ applicationId }: JobApplicationFormProps) {
  const router = useRouter();
  const isEditing = !!applicationId;
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    appliedDate: new Date().toISOString().split('T')[0], // Default to today in YYYY-MM-DD format
    status: ApplicationStatus.APPLIED,
    notes: '',
    contactName: '',
    contactEmail: '',
    nextFollowUp: '',
    salary: ''
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch existing application data if editing
  const { loading: fetchLoading, error: fetchError } = useQuery(
    GET_APPLICATION_QUERY,
    {
      variables: { id: applicationId },
      skip: !isEditing,
      onCompleted: (data) => {
        if (data?.application) {
          const app = data.application;
          setFormData({
            company: app.company,
            position: app.position,
            location: app.location,
            appliedDate: new Date(app.appliedDate).toISOString().split('T')[0],
            status: app.status,
            notes: app.notes || '',
            contactName: app.contactName || '',
            contactEmail: app.contactEmail || '',
            nextFollowUp: app.nextFollowUp ? new Date(app.nextFollowUp).toISOString().split('T')[0] : '',
            salary: app.salary || ''
          });
        }
      }
    }
  );

  // Create application mutation
  const [createApplication, { loading: createLoading }] = useMutation(
    CREATE_APPLICATION_MUTATION,
    {
      onCompleted: () => {
        setSuccessMessage('Application created successfully!');
        setTimeout(() => {
          router.push('/dashboard/applications');
        }, 1500);
      },
      onError: (error) => {
        setFormError(`Error creating application: ${error.message}`);
      }
    }
  );

  // Update application mutation
  const [updateApplication, { loading: updateLoading }] = useMutation(
    UPDATE_APPLICATION_MUTATION,
    {
      onCompleted: () => {
        setSuccessMessage('Application updated successfully!');
        setTimeout(() => {
          router.push('/dashboard/applications');
        }, 1500);
      },
      onError: (error) => {
        setFormError(`Error updating application: ${error.message}`);
      }
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    
    try {
      if (isEditing) {
        await updateApplication({
          variables: {
            input: {
              id: applicationId,
              ...formData
            }
          }
        });
      } else {
        await createApplication({
          variables: {
            input: formData
          }
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isLoading = fetchLoading || createLoading || updateLoading;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Job Application' : 'Add New Job Application'}</h2>
      
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading application data: {fetchError.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company *
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              value={formData.company}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position *
            </label>
            <input
              id="position"
              name="position"
              type="text"
              required
              value={formData.position}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Applied Date */}
          <div>
            <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700">
              Applied Date *
            </label>
            <input
              id="appliedDate"
              name="appliedDate"
              type="date"
              required
              value={formData.appliedDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {Object.values(ApplicationStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          {/* Salary */}
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
              Salary (optional)
            </label>
            <input
              id="salary"
              name="salary"
              type="text"
              value={formData.salary}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Contact Name */}
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
              Contact Name (optional)
            </label>
            <input
              id="contactName"
              name="contactName"
              type="text"
              value={formData.contactName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
              Contact Email (optional)
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Next Follow-up */}
          <div>
            <label htmlFor="nextFollowUp" className="block text-sm font-medium text-gray-700">
              Next Follow-up Date (optional)
            </label>
            <input
              id="nextFollowUp"
              name="nextFollowUp"
              type="date"
              value={formData.nextFollowUp}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Application' : 'Add Application')
            }
          </button>
        </div>
      </form>
    </div>
  );
}
