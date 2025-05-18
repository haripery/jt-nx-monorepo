'use client';

import JobApplicationTable from '../../components/applications/job-application-table';

export default function ApplicationsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Applications</h1>
      </div>
      <JobApplicationTable />
    </div>
  );
}
