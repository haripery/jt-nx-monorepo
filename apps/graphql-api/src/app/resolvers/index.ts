import { authResolvers } from './auth.resolvers';
import { jobApplicationResolvers } from './job-application.resolvers';
import { merge } from 'lodash';

// Merge all resolvers
export const resolvers = merge(
  authResolvers,
  jobApplicationResolvers
);
