'use client';

import { useParams } from 'next/navigation';
import JobApplicationForm from '../../../../components/applications/job-application-form';

export default function EditApplicationPage() {
  const params = useParams();
  const applicationId = params.id as string;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Job Application</h1>
      </div>
      <JobApplicationForm applicationId={applicationId} />
    </div>
  );
}
