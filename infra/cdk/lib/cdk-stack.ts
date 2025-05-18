import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

// Base infrastructure stack with VPC, security groups, etc.
export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly ecsCluster: ecs.Cluster;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;
  public readonly servicesSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, 'JobTrackerVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // Create security groups
    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for DocumentDB cluster',
    });

    this.servicesSecurityGroup = new ec2.SecurityGroup(this, 'ServicesSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for microservices',
      allowAllOutbound: true,
    });

    // Allow microservices to connect to the database
    this.databaseSecurityGroup.addIngressRule(
      this.servicesSecurityGroup,
      ec2.Port.tcp(27017),
      'Allow microservices to connect to DocumentDB'
    );

    // Create ECS cluster
    this.ecsCluster = new ecs.Cluster(this, 'JobTrackerCluster', {
      vpc: this.vpc,
      containerInsights: true,
    });

    // Output the VPC ID
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'The ID of the VPC',
      exportName: 'JobTrackerVpcId',
    });
  }
}

// Database infrastructure stack for MongoDB
export class DatabaseStack extends cdk.Stack {
  public readonly docdbEndpoint: string;
  public readonly dbSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, networkStack: NetworkStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a username and password secret for DocumentDB
    this.dbSecret = new secretsmanager.Secret(this, 'DocDBSecret', {
      secretName: 'job-tracker/docdb-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'jobtracker' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 16,
      },
    });

    // Create a DocumentDB cluster (MongoDB compatible)
    const dbCluster = new docdb.DatabaseCluster(this, 'JobTrackerDocDB', {
      masterUser: {
        username: 'jobtracker',
        secretName: this.dbSecret.secretName,
        excludeCharacters: "'\" @/\\`%&*()+=^{}[]",
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      vpc: networkStack.vpc,
      securityGroup: networkStack.databaseSecurityGroup,
      instances: 1, // Start with 1 instance for development, increase for production
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      backupRetention: cdk.Duration.days(7),
    });

    this.docdbEndpoint = dbCluster.clusterEndpoint.socketAddress;

    // Output the DocumentDB connection information
    new cdk.CfnOutput(this, 'DocDBEndpoint', {
      value: this.docdbEndpoint,
      description: 'The endpoint of the DocumentDB cluster',
      exportName: 'JobTrackerDocDBEndpoint',
    });

    new cdk.CfnOutput(this, 'DocDBSecretArn', {
      value: this.dbSecret.secretArn,
      description: 'The ARN of the DocumentDB credentials secret',
      exportName: 'JobTrackerDocDBSecretArn',
    });
  }
}
