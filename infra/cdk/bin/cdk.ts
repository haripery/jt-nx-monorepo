#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack, DatabaseStack } from '../lib/cdk-stack';
import { ServicesStack } from '../lib/services-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// Define environment
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Create the stacks
const networkStack = new NetworkStack(app, 'JobTrackerNetworkStack', { env });
const databaseStack = new DatabaseStack(app, 'JobTrackerDatabaseStack', networkStack, { env });
const servicesStack = new ServicesStack(app, 'JobTrackerServicesStack', networkStack, databaseStack, { env });
const frontendStack = new FrontendStack(app, 'JobTrackerFrontendStack', servicesStack, { env });

// Add tags to all stacks
const stacks = [networkStack, databaseStack, servicesStack, frontendStack];
stacks.forEach(stack => {
  cdk.Tags.of(stack).add('Project', 'JobTracker');
  cdk.Tags.of(stack).add('Environment', 'Production');
  cdk.Tags.of(stack).add('ManagedBy', 'CDK');
});