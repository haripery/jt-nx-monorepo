'use client';

import JobApplicationForm from '../../../components/applications/job-application-form';

export default function NewApplicationPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Job Application</h1>
      </div>
      <JobApplicationForm />
    </div>
  );
}
