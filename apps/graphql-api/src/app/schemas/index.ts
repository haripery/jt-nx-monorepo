import { gql } from 'apollo-server-express';

// Define the GraphQL schema inline to avoid file path issues during build
const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    createdAt: String!
    updatedAt: String!
  }

  enum ApplicationStatus {
    APPLIED
    INTERVIEW
    OFFER
    REJECTED
    ACCEPTED
  }

  type JobApplication {
    id: ID!
    company: String!
    position: String!
    location: String!
    appliedDate: String!
    status: ApplicationStatus!
    notes: String
    contactName: String
    contactEmail: String
    nextFollowUp: String
    salary: String
    createdAt: String!
    updatedAt: String!
  }

  input UserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input JobApplicationInput {
    id: ID
    company: String!
    position: String!
    location: String!
    appliedDate: String!
    status: ApplicationStatus!
    notes: String
    contactName: String
    contactEmail: String
    nextFollowUp: String
    salary: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    applications: [JobApplication]!
    application(id: ID!): JobApplication
  }

  type Mutation {
    register(input: UserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createJobApplication(input: JobApplicationInput!): JobApplication!
    updateJobApplication(input: JobApplicationInput!): JobApplication!
    deleteJobApplication(id: ID!): Boolean!
  }
`;

export { typeDefs };
