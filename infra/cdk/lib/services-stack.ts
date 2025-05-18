import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';
import { NetworkStack } from './cdk-stack';
import { DatabaseStack } from './cdk-stack';

// Stack for microservices (User Service, Job Tracker Service, GraphQL API)
export class ServicesStack extends cdk.Stack {
  public readonly userServiceUrl: string;
  public readonly jobTrackerServiceUrl: string;
  public readonly graphqlApiUrl: string;

  constructor(scope: Construct, id: string, networkStack: NetworkStack, databaseStack: DatabaseStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create ECR repositories for each service
    const userServiceRepo = new ecr.Repository(this, 'UserServiceRepo', {
      repositoryName: 'job-tracker/user-service',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const jobTrackerServiceRepo = new ecr.Repository(this, 'JobTrackerServiceRepo', {
      repositoryName: 'job-tracker/job-tracker-service',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const graphqlApiRepo = new ecr.Repository(this, 'GraphqlApiRepo', {
      repositoryName: 'job-tracker/graphql-api',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create a task execution role that can access secrets
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Add permissions to read the database secret
    databaseStack.dbSecret.grantRead(executionRole);

    // Create a JWT secret for authentication
    const jwtSecret = new secretsmanager.Secret(this, 'JwtSecret', {
      secretName: 'job-tracker/jwt-secret',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'secret',
        excludePunctuation: false,
        passwordLength: 32,
      },
    });

    // Grant access to the JWT secret
    jwtSecret.grantRead(executionRole);

    // Create task definition for the User Service
    const userServiceTaskDef = new ecs.FargateTaskDefinition(this, 'UserServiceTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole,
    });

    userServiceTaskDef.addContainer('UserServiceContainer', {
      image: ecs.ContainerImage.fromEcrRepository(userServiceRepo, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'user-service',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        // Non-sensitive environment variables
        'NODE_ENV': 'production',
      },
      secrets: {
        // Sensitive environment variables from Secrets Manager
        'MONGO_URI': ecs.Secret.fromSecretsManager(databaseStack.dbSecret, 'uri'),
        'JWT_SECRET': ecs.Secret.fromSecretsManager(jwtSecret, 'secret'),
      },
      portMappings: [{
        containerPort: 3333,
        protocol: ecs.Protocol.TCP,
      }],
    });

    // Create task definition for the Job Tracker Service
    const jobTrackerServiceTaskDef = new ecs.FargateTaskDefinition(this, 'JobTrackerServiceTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole,
    });

    jobTrackerServiceTaskDef.addContainer('JobTrackerServiceContainer', {
      image: ecs.ContainerImage.fromEcrRepository(jobTrackerServiceRepo, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'job-tracker-service',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        // Non-sensitive environment variables
        'NODE_ENV': 'production',
      },
      secrets: {
        // Sensitive environment variables from Secrets Manager
        'MONGO_URI': ecs.Secret.fromSecretsManager(databaseStack.dbSecret, 'uri'),
        'JWT_SECRET': ecs.Secret.fromSecretsManager(jwtSecret, 'secret'),
      },
      portMappings: [{
        containerPort: 3334,
        protocol: ecs.Protocol.TCP,
      }],
    });

    // Create a Fargate service for the User Service
    const userService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'UserService', {
      cluster: networkStack.ecsCluster,
      taskDefinition: userServiceTaskDef,
      desiredCount: 2,
      securityGroups: [networkStack.servicesSecurityGroup],
      publicLoadBalancer: true,
      assignPublicIp: false,
      listenerPort: 443,
      targetProtocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
    });

    // Create a Fargate service for the Job Tracker Service
    const jobTrackerService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'JobTrackerService', {
      cluster: networkStack.ecsCluster,
      taskDefinition: jobTrackerServiceTaskDef,
      desiredCount: 2,
      securityGroups: [networkStack.servicesSecurityGroup],
      publicLoadBalancer: true,
      assignPublicIp: false,
      listenerPort: 443,
      targetProtocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
    });

    // Create task definition for the GraphQL API
    const graphqlApiTaskDef = new ecs.FargateTaskDefinition(this, 'GraphqlApiTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole,
    });

    graphqlApiTaskDef.addContainer('GraphqlApiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(graphqlApiRepo, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'graphql-api',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        // Non-sensitive environment variables
        'NODE_ENV': 'production',
        'USER_SERVICE_URL': userService.loadBalancer.loadBalancerDnsName + '/api/',
        'JOB_TRACKER_SERVICE_URL': jobTrackerService.loadBalancer.loadBalancerDnsName + '/api/',
      },
      secrets: {
        // Sensitive environment variables from Secrets Manager
        'JWT_SECRET': ecs.Secret.fromSecretsManager(jwtSecret, 'secret'),
      },
      portMappings: [{
        containerPort: 4000,
        protocol: ecs.Protocol.TCP,
      }],
    });

    // Create a Fargate service for the GraphQL API
    const graphqlApi = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'GraphqlApi', {
      cluster: networkStack.ecsCluster,
      taskDefinition: graphqlApiTaskDef,
      desiredCount: 2,
      securityGroups: [networkStack.servicesSecurityGroup],
      publicLoadBalancer: true,
      assignPublicIp: false,
      listenerPort: 443,
      targetProtocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
    });

    // Store the service URLs
    this.userServiceUrl = `https://${userService.loadBalancer.loadBalancerDnsName}`;
    this.jobTrackerServiceUrl = `https://${jobTrackerService.loadBalancer.loadBalancerDnsName}`;
    this.graphqlApiUrl = `https://${graphqlApi.loadBalancer.loadBalancerDnsName}`;

    // Output the service endpoints
    new cdk.CfnOutput(this, 'UserServiceEndpoint', {
      value: this.userServiceUrl,
      description: 'The endpoint of the User Service',
      exportName: 'JobTrackerUserServiceEndpoint',
    });

    new cdk.CfnOutput(this, 'JobTrackerServiceEndpoint', {
      value: this.jobTrackerServiceUrl,
      description: 'The endpoint of the Job Tracker Service',
      exportName: 'JobTrackerServiceEndpoint',
    });

    new cdk.CfnOutput(this, 'GraphqlApiEndpoint', {
      value: this.graphqlApiUrl,
      description: 'The endpoint of the GraphQL API',
      exportName: 'JobTrackerGraphqlApiEndpoint',
    });
  }
}
