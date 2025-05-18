#!/bin/bash
set -e

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo -e "${YELLOW}AWS CDK is not installed. Please install it first.${NC}"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deploying Job Tracker to AWS using CDK${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AWS Account: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${BLUE}AWS Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}========================================${NC}"

# Ask for confirmation
read -p "Do you want to proceed with the deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment canceled.${NC}"
    exit 1
fi

# Bootstrap CDK if needed
echo -e "${GREEN}Bootstrapping CDK for AWS account ${AWS_ACCOUNT_ID} in region ${AWS_REGION}...${NC}"
cdk bootstrap aws://${AWS_ACCOUNT_ID}/${AWS_REGION}

# Build and deploy network stack
echo -e "${GREEN}Deploying Network Stack...${NC}"
cdk deploy JobTrackerNetworkStack --require-approval never

# Build and deploy database stack
echo -e "${GREEN}Deploying Database Stack...${NC}"
cdk deploy JobTrackerDatabaseStack --require-approval never

# Create ECR repositories and build/push Docker images
echo -e "${GREEN}Creating ECR repositories and building/pushing Docker images...${NC}"

# Create or get ECR repositories
USER_SERVICE_REPO="job-tracker/user-service"
JOB_TRACKER_SERVICE_REPO="job-tracker/job-tracker-service"
GRAPHQL_API_REPO="job-tracker/graphql-api"

create_or_get_repo() {
    local repo_name=$1
    if ! aws ecr describe-repositories --repository-names ${repo_name} &> /dev/null; then
        echo -e "${GREEN}Creating ECR repository ${repo_name}...${NC}"
        aws ecr create-repository --repository-name ${repo_name}
    else
        echo -e "${GREEN}ECR repository ${repo_name} already exists.${NC}"
    fi
    echo "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${repo_name}"
}

USER_SERVICE_REPO_URI=$(create_or_get_repo ${USER_SERVICE_REPO})
JOB_TRACKER_SERVICE_REPO_URI=$(create_or_get_repo ${JOB_TRACKER_SERVICE_REPO})
GRAPHQL_API_REPO_URI=$(create_or_get_repo ${GRAPHQL_API_REPO})

# Login to ECR
echo -e "${GREEN}Logging in to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build and push Docker images
cd ../../

echo -e "${GREEN}Building and pushing User Service...${NC}"
docker build -t ${USER_SERVICE_REPO_URI}:latest -f apps/user-service/Dockerfile .
docker push ${USER_SERVICE_REPO_URI}:latest

echo -e "${GREEN}Building and pushing Job Tracker Service...${NC}"
docker build -t ${JOB_TRACKER_SERVICE_REPO_URI}:latest -f apps/job-tracker-service/Dockerfile .
docker push ${JOB_TRACKER_SERVICE_REPO_URI}:latest

echo -e "${GREEN}Building and pushing GraphQL API...${NC}"
docker build -t ${GRAPHQL_API_REPO_URI}:latest -f apps/graphql-api/Dockerfile .
docker push ${GRAPHQL_API_REPO_URI}:latest

cd infra/cdk/

# Deploy services stack
echo -e "${GREEN}Deploying Services Stack...${NC}"
cdk deploy JobTrackerServicesStack --require-approval never

# Build and deploy the static frontend
echo -e "${GREEN}Building Next.js frontend for production...${NC}"
cd ../../
npx nx build frontend

# Get the S3 bucket name from CloudFormation output
echo -e "${GREEN}Deploying Frontend Stack...${NC}"
cd infra/cdk/
cdk deploy JobTrackerFrontendStack --require-approval never

BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name JobTrackerFrontendStack --query "Stacks[0].Outputs[?ExportName=='JobTrackerFrontendBucketName'].OutputValue" --output text)
CLOUDFRONT_URL=$(aws cloudformation describe-stacks --stack-name JobTrackerFrontendStack --query "Stacks[0].Outputs[?ExportName=='JobTrackerFrontendUrl'].OutputValue" --output text)

# Build the frontend for production
cd ../../
npx nx export frontend

# Upload the frontend build to S3
echo -e "${GREEN}Uploading Next.js frontend to S3 bucket ${BUCKET_NAME}...${NC}"
aws s3 sync dist/apps/frontend/exported s3://${BUCKET_NAME}/ --delete

# Create CloudFront invalidation to clear cache
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items!=null] | [?contains(Aliases.Items, '${BUCKET_NAME}')].Id" --output text)
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "${GREEN}Creating CloudFront invalidation for distribution ${DISTRIBUTION_ID}...${NC}"
    aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Job Tracker Application Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Frontend URL: ${CLOUDFRONT_URL}${NC}"
echo -e "${GREEN}GraphQL API: $(aws cloudformation describe-stacks --stack-name JobTrackerServicesStack --query "Stacks[0].Outputs[?ExportName=='JobTrackerGraphqlApiEndpoint'].OutputValue" --output text)${NC}"
echo -e "${BLUE}========================================${NC}"
