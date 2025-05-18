import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { ServicesStack } from './services-stack';

// Stack for the frontend (Next.js application)
export class FrontendStack extends cdk.Stack {
  public readonly cloudfrontUrl: string;

  constructor(scope: Construct, id: string, servicesStack: ServicesStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for the static website content
    const siteBucket = new s3.Bucket(this, 'JobTrackerFrontendBucket', {
      bucketName: `job-tracker-frontend-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });

    // Create a CloudFront origin access identity
    const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOAI', {
      comment: 'OAI for Job Tracker Frontend',
    });

    // Grant the OAI read access to the bucket
    siteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [siteBucket.arnForObjects('*')],
      principals: [new ServicePrincipal('cloudfront.amazonaws.com')],
      conditions: {
        'StringEquals': {
          'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/*`
        }
      }
    }));

    // CloudFront distribution for the website
    const distribution = new cloudfront.Distribution(this, 'JobTrackerDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket, {
          originAccessIdentity: cloudFrontOAI
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(servicesStack.graphqlApiUrl.replace('https://', '')),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      defaultRootObject: 'index.html',
      enableIpv6: true,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Store the CloudFront URL
    this.cloudfrontUrl = `https://${distribution.distributionDomainName}`;

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'CloudFrontEndpoint', {
      value: this.cloudfrontUrl,
      description: 'The URL of the Job Tracker frontend',
      exportName: 'JobTrackerFrontendUrl',
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, 'BucketName', {
      value: siteBucket.bucketName,
      description: 'The name of the S3 bucket hosting the frontend',
      exportName: 'JobTrackerFrontendBucketName',
    });
  }
}
