# Job Tracker Application

A full-stack job application tracking system built with NX Monorepo.

## Overview

This application helps users track and manage their job applications with a modern, responsive UI. It includes user authentication, job application management, and a GraphQL API middleware.

## Architecture

This project is built using an NX Monorepo with the following components:

1. **Frontend**: Next.js application with React components, Apollo Client, authentication context, and a responsive UI for tracking job applications
2. **Middle Tier**: GraphQL API using Apollo Server that acts as a gateway between frontend and backend services
3. **Backend Services**:
   - User Service: Express.js REST API for user authentication (register, login)
   - Job Tracker Service: Express.js REST API for job application management (CRUD operations)
4. **Shared Libraries**:
   - shared-models: TypeScript interfaces and types shared across the stack
   - shared-utils: Utility functions for authentication and common operations

## Prerequisites

- Node.js (v16+)
- MongoDB (running locally or remotely)
- npm or yarn

## Running the Application

### 1. Start MongoDB

Make sure MongoDB is running, either locally or via a remote connection. Update the MongoDB connection strings in the `.env` files if necessary.

### 2. Start the Services

Run each service in a separate terminal window in the following order:

```bash
# Start User Service
npx nx serve user-service

# Start Job Tracker Service
npx nx serve job-tracker-service

# Start GraphQL API
npx nx serve graphql-api

# Start Frontend
npx nx serve frontend
```

## Deployment to GitHub

### Initial Setup

1. Create a new GitHub repository
2. Configure your local repository and push to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Security Considerations

Before deploying to GitHub:

1. Ensure `.env` files are ignored in `.gitignore` (already configured)
2. Use environment variables for all sensitive information
3. Review code for hardcoded credentials or API keys
4. Set up proper branch protection rules in GitHub

## Environment Variables

Create a `.env` file based on the `.env.example` template. The following variables are required:

```
MONGO_URI=mongodb://localhost:27017/jobtracker
JWT_SECRET=your-secret-key-here
PORT=4000
HOST=localhost
USER_SERVICE_URL=http://localhost:3333/api/
NEXT_PUBLIC_GRAPHQL_URI=http://localhost:4000/graphql
```

**IMPORTANT**: Never commit your actual `.env` file to version control.

### 3. Access the Application

Once all services are running, you can access the application at:

- Frontend: http://localhost:4200
- GraphQL API and Playground: http://localhost:4000/graphql
- User Service API: http://localhost:3333/api
- Job Tracker Service API: http://localhost:3334/api

## Features

### Frontend

- Landing page with login/registration links
- User authentication (login/register) with form validation
- Protected dashboard for authenticated users
- Job application table with filtering and sorting
- Create, view, edit, and delete job applications
- Status tracking for job applications (Applied, Interview, Offer, etc.)
- Responsive design using Tailwind CSS

### Backend

- User authentication with JWT token
- GraphQL API for unified data access
- RESTful services for user and job application management
- MongoDB integration for data storage
- Shared code between services using NX libraries

## Project Structure

```
/apps
  /frontend               # NextJS frontend application
    /src/app              # Next.js App Router structure
      /components         # React components
      /contexts           # React contexts (auth)
      /graphql            # GraphQL queries/mutations
  /graphql-api            # Apollo Server GraphQL middleware
    /src/app
      /datasources        # Apollo data sources connecting to backend services
      /resolvers          # GraphQL resolvers
      /schemas            # GraphQL schema definitions
  /user-service           # User authentication service
    /src/app
      /controllers        # Request handlers
      /routes             # API endpoint definitions
      /schemas            # MongoDB schemas
  /job-tracker-service    # Job application management service
    /src/app
      /controllers        # Request handlers
      /routes             # API endpoint definitions
      /schemas            # MongoDB schemas
/libs
  /shared-models         # Shared TypeScript interfaces and types
  /shared-utils          # Shared utility functions
```

## Development

To run the application in development mode, use the commands in the "Running the Application" section. NX provides helpful commands for developing in a monorepo:

```bash
# Get a visual representation of your project dependencies
npx nx graph

# Run tests across the monorepo
npx nx run-many --target=test --all

# Generate a new library
npx nx g @nx/js:lib new-shared-lib
```

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
