import { gql } from '@apollo/client';

export const GET_APPLICATIONS_QUERY = gql`
  query GetApplications {
    applications {
      id
      company
      position
      location
      appliedDate
      status
      notes
      contactName
      contactEmail
      nextFollowUp
      salary
      createdAt
      updatedAt
    }
  }
`;

export const GET_APPLICATION_QUERY = gql`
  query GetApplication($id: ID!) {
    application(id: $id) {
      id
      company
      position
      location
      appliedDate
      status
      notes
      contactName
      contactEmail
      nextFollowUp
      salary
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_APPLICATION_MUTATION = gql`
  mutation CreateJobApplication($input: JobApplicationInput!) {
    createJobApplication(input: $input) {
      id
      company
      position
      location
      appliedDate
      status
      notes
      contactName
      contactEmail
      nextFollowUp
      salary
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_APPLICATION_MUTATION = gql`
  mutation UpdateJobApplication($input: JobApplicationInput!) {
    updateJobApplication(input: $input) {
      id
      company
      position
      location
      appliedDate
      status
      notes
      contactName
      contactEmail
      nextFollowUp
      salary
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_APPLICATION_MUTATION = gql`
  mutation DeleteJobApplication($id: ID!) {
    deleteJobApplication(id: $id)
  }
`;
