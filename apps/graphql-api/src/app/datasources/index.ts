import { UserAPI } from './user-api';
import { JobAPI } from './job-api';

export const dataSources = () => ({
  userAPI: new UserAPI(),
  jobAPI: new JobAPI(),
});

export { UserAPI, JobAPI };
