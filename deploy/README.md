# Review Terminal - AWS Deployment Guide

This directory contains deployment configurations for multiple AWS deployment strategies.

## 📋 Table of Contents
- [Deployment Options](#deployment-options)
- [Option 1: AWS Amplify + Lambda (Recommended)](#option-1-aws-amplify--lambda-recommended)
- [Option 2: Docker on AWS ECS](#option-2-docker-on-aws-ecs)
- [Cost Comparison](#cost-comparison)
- [Prerequisites](#prerequisites)
- [Post-Deployment Configuration](#post-deployment-configuration)

---

## Deployment Options

### ⭐ Option 1: AWS Amplify + Lambda (Recommended)
**Cost**: ~$12-15/month | **Complexity**: Medium | **Best for**: Most use cases

- **Frontend**: Amplify Hosting with built-in CloudFront CDN
- **Backend**: Lambda function with Function URLs
- **Pros**: Git-based deploys, automatic SSL, branch previews, 70% cheaper than ECS
- **Cons**: Slight vendor lock-in to Amplify

**Files**: `/deploy/amplify.yml`, `/deploy/lambda/*`

### Option 2: Docker on AWS ECS
**Cost**: ~$45-50/month | **Complexity**: High | **Best for**: Organizations requiring containers

- **Frontend + Backend**: Single Docker container on ECS Fargate
- **Pros**: Same-origin (no CORS), familiar Docker workflow
- **Cons**: More expensive, always-on compute, no CDN

**Files**: `/deploy/docker/*`

---

## Option 1: AWS Amplify + Lambda (Recommended)

### Architecture
```
GitHub Repo → Amplify CI/CD → CloudFront CDN → Users
                    ↓
              Lambda Function URL → Auth Backend
```

### Step-by-Step Deployment

#### Phase 1: Setup Lambda Backend (20 minutes)

##### 1.1 Install Lambda Dependencies
```bash
cd deploy/lambda
pnpm install --prod
```

##### 1.2 Create Lambda Deployment Package
```bash
# From deploy/lambda directory
zip -r function.zip . -x "*.git*" ".pnpm-store/*" "node_modules/.cache/*"
```

##### 1.3 Create IAM Role for Lambda
```bash
# Create trust policy
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create role
aws iam create-role \
  --role-name review-terminal-lambda-role \
  --assume-role-policy-document file://trust-policy.json

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name review-terminal-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Attach Secrets Manager read policy (for OAuth credentials)
aws iam attach-role-policy \
  --role-name review-terminal-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

##### 1.4 Deploy Lambda Function
```bash
# Create Lambda function
aws lambda create-function \
  --function-name review-terminal-auth \
  --runtime nodejs20.x \
  --handler handler.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/review-terminal-lambda-role \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    NODE_ENV=production,
    GHE_BASE_URL=https://github.com,
    LOG_LEVEL=info
  }"

# Note the function ARN from the output
```

##### 1.5 Create Lambda Function URL
```bash
# Create Function URL
aws lambda create-function-url-config \
  --function-name review-terminal-auth \
  --auth-type NONE \
  --cors '{
    "AllowOrigins": ["*"],
    "AllowMethods": ["GET", "POST", "OPTIONS"],
    "AllowHeaders": ["Content-Type", "Authorization"],
    "MaxAge": 86400,
    "AllowCredentials": true
  }'

# Note the Function URL from output (e.g., https://abc123.lambda-url.us-east-1.on.aws)
```

##### 1.6 Store GitHub OAuth Secrets
```bash
# Create secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name review-terminal/ghe-client-id \
  --secret-string "YOUR_GITHUB_CLIENT_ID"

aws secretsmanager create-secret \
  --name review-terminal/ghe-client-secret \
  --secret-string "YOUR_GITHUB_CLIENT_SECRET"

# Generate and store session secret
aws secretsmanager create-secret \
  --name review-terminal/session-secret \
  --secret-string "$(openssl rand -base64 32)"

# Get the secret ARNs for next step
aws secretsmanager describe-secret --secret-id review-terminal/ghe-client-id --query ARN
```

##### 1.7 Update Lambda Environment Variables
```bash
# Update with Amplify URL (will add after frontend deployment)
aws lambda update-function-configuration \
  --function-name review-terminal-auth \
  --environment Variables="{
    NODE_ENV=production,
    GHE_BASE_URL=https://github.com,
    LOG_LEVEL=info,
    GHE_CLIENT_ID_SECRET_ARN=arn:aws:secretsmanager:REGION:ACCOUNT:secret:review-terminal/ghe-client-id,
    GHE_CLIENT_SECRET_SECRET_ARN=arn:aws:secretsmanager:REGION:ACCOUNT:secret:review-terminal/ghe-client-secret,
    SESSION_SECRET_ARN=arn:aws:secretsmanager:REGION:ACCOUNT:secret:review-terminal/session-secret,
    FRONTEND_BASE_URL=https://main.d1234abcd.amplifyapp.com,
    AUTH_REDIRECT_URI=https://abc123.lambda-url.us-east-1.on.aws/auth/github-enterprise/callback
  }"
```

##### 1.8 Test Lambda Function
```bash
# Test health check
curl https://YOUR_LAMBDA_URL/healthz

# Should return: ok
```

---

#### Phase 2: Setup Amplify Frontend (15 minutes)

##### 2.1 Copy Amplify Configuration to Root
```bash
# From project root
cp deploy/amplify.yml amplify.yml
```

##### 2.2 Deploy via Amplify Console (Recommended)

1. **Open AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. **Click "New app" → "Host web app"**
3. **Connect GitHub**:
   - Select your repository
   - Select branch: `main`
4. **Build Settings**:
   - Amplify should auto-detect `amplify.yml`
   - If not, paste contents from `deploy/amplify.yml`
5. **Environment Variables** - Add these:
   ```
   VITE_API_BASE = https://YOUR_LAMBDA_URL
   VITE_GHE_BASE_URL = https://github.com
   VITE_AUTH_CALLBACK_PATH = /auth/callback
   VITE_AUTH_ENABLED = true
   ```
6. **Click "Save and deploy"**

##### 2.3 Get Amplify URL
```bash
# After deployment, note the Amplify URL (e.g., https://main.d1234abcd.amplifyapp.com)
# You'll need this for the next step
```

##### 2.4 Update Lambda with Amplify URL
```bash
# Update Lambda environment with actual Amplify URL
aws lambda update-function-configuration \
  --function-name review-terminal-auth \
  --environment Variables="{
    NODE_ENV=production,
    GHE_BASE_URL=https://github.com,
    LOG_LEVEL=info,
    GHE_CLIENT_ID_SECRET_ARN=arn:aws:secretsmanager:REGION:ACCOUNT:secret:review-terminal/ghe-client-id,
    GHE_CLIENT_SECRET_SECRET_ARN=arn:aws:secretsmanager:REGION:ACCOUNT:secret:review-terminal/ghe-client-secret,
    SESSION_SECRET_ARN=arn:aws:secretsmanager:REGION:ACCOUNT:secret:review-terminal/session-secret,
    FRONTEND_BASE_URL=https://main.d1234abcd.amplifyapp.com,
    AUTH_REDIRECT_URI=https://YOUR_LAMBDA_URL/auth/github-enterprise/callback
  }"

# Also update CORS in Lambda Function URL
aws lambda update-function-url-config \
  --function-name review-terminal-auth \
  --cors '{
    "AllowOrigins": ["https://main.d1234abcd.amplifyapp.com"],
    "AllowMethods": ["GET", "POST", "OPTIONS"],
    "AllowHeaders": ["Content-Type", "Authorization"],
    "MaxAge": 86400,
    "AllowCredentials": true
  }'
```

---

#### Phase 3: Configure GitHub OAuth (10 minutes)

##### 3.1 Create GitHub OAuth App
1. **Go to**: https://github.com/settings/developers
2. **Click "OAuth Apps" → "New OAuth App"**
3. **Fill in details**:
   - **Application name**: Review Terminal
   - **Homepage URL**: `https://main.d1234abcd.amplifyapp.com` (your Amplify URL)
   - **Authorization callback URL**: `https://YOUR_LAMBDA_URL/auth/github-enterprise/callback`
4. **Click "Register application"**
5. **Generate client secret** and save both Client ID and Secret

##### 3.2 Update AWS Secrets with OAuth Credentials
```bash
# Update client ID
aws secretsmanager update-secret \
  --secret-id review-terminal/ghe-client-id \
  --secret-string "YOUR_ACTUAL_CLIENT_ID"

# Update client secret
aws secretsmanager update-secret \
  --secret-id review-terminal/ghe-client-secret \
  --secret-string "YOUR_ACTUAL_CLIENT_SECRET"
```

---

#### Phase 4: Testing (10 minutes)

##### 4.1 Test Frontend
```bash
# Open your Amplify URL in browser
open https://main.d1234abcd.amplifyapp.com

# Verify:
# ✓ Page loads without errors
# ✓ No console errors in DevTools
```

##### 4.2 Test Backend
```bash
# Test health check
curl https://YOUR_LAMBDA_URL/healthz
# Expected: ok

# Test authorize endpoint
curl https://YOUR_LAMBDA_URL/auth/github-enterprise/authorize
# Expected: {"url":"https://github.com/login/oauth/authorize?..."}
```

##### 4.3 Test Full Auth Flow
1. Open frontend in browser
2. Click authentication button
3. Should redirect to GitHub OAuth
4. Authorize the application
5. Should redirect back with user info
6. Check CloudWatch Logs for Lambda to verify flow

##### 4.4 View CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/review-terminal-auth --follow

# Or in AWS Console:
# CloudWatch → Log groups → /aws/lambda/review-terminal-auth
```

---

#### Phase 5: Production Hardening (Optional, 20 minutes)

##### 5.1 Add Custom Domain to Amplify
1. **Amplify Console → Your App → Domain management**
2. **Add domain**: your-domain.com
3. **Follow DNS verification steps**

##### 5.2 Enable Branch Previews
1. **Amplify Console → Your App → Previews**
2. **Enable previews** for pull requests
3. Each PR will get a unique preview URL

##### 5.3 Set Up CloudWatch Alarms
```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name review-terminal-lambda-errors \
  --alarm-description "Alert on Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=review-terminal-auth \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:REGION:ACCOUNT:YOUR_SNS_TOPIC
```

##### 5.4 Configure Lambda Provisioned Concurrency (Optional)
```bash
# Eliminate cold starts by keeping 1 instance warm
aws lambda put-provisioned-concurrency-config \
  --function-name review-terminal-auth \
  --provisioned-concurrent-executions 1 \
  --qualifier '$LATEST'

# Note: This adds ~$12/month to costs
```

---

### Updating Your Application

#### Update Frontend
```bash
# Simply push to GitHub
git add .
git commit -m "Update frontend"
git push origin main

# Amplify automatically rebuilds and deploys
```

#### Update Lambda Backend
```bash
cd deploy/lambda

# Make your changes to authApp.js

# Rebuild package
zip -r function.zip . -x "*.git*" ".pnpm-store/*" "node_modules/.cache/*"

# Update Lambda
aws lambda update-function-code \
  --function-name review-terminal-auth \
  --zip-file fileb://function.zip
```

---

## Option 2: Docker on AWS ECS

### Architecture
```
User → ALB (Port 443) → ECS Fargate (Port 8080) → Frontend + Backend
```

### Step-by-Step Deployment

#### Phase 1: Build Docker Image (10 minutes)

##### 1.1 Build Locally
```bash
# From project root
docker build \
  --build-arg VITE_API_BASE=/ \
  --build-arg VITE_GHE_BASE_URL=https://github.com \
  --build-arg VITE_AUTH_CALLBACK_PATH=/auth/callback \
  --build-arg VITE_AUTH_ENABLED=true \
  -f deploy/docker/Dockerfile \
  -t review-terminal:latest \
  .
```

##### 1.2 Test Locally
```bash
# Run container
docker run -p 8080:8080 \
  -e GHE_BASE_URL=https://github.com \
  -e GHE_CLIENT_ID=your_test_client_id \
  -e GHE_CLIENT_SECRET=your_test_client_secret \
  -e AUTH_REDIRECT_URI=http://localhost:8080/auth/github-enterprise/callback \
  -e SESSION_SECRET=test_secret_key \
  -e FRONTEND_BASE_URL=http://localhost:8080 \
  -e NODE_ENV=production \
  review-terminal:latest

# Test
curl http://localhost:8080/healthz
# Expected: ok

# Open browser
open http://localhost:8080
```

---

#### Phase 2: Push to AWS ECR (5 minutes)

##### 2.1 Create ECR Repository
```bash
aws ecr create-repository \
  --repository-name review-terminal \
  --region us-east-1
```

##### 2.2 Authenticate Docker to ECR
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

##### 2.3 Tag and Push Image
```bash
# Tag image
docker tag review-terminal:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/review-terminal:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/review-terminal:latest
```

---

#### Phase 3: Deploy to ECS (20 minutes)

##### 3.1 Store Secrets in AWS Secrets Manager
```bash
# Create secret with all credentials
aws secretsmanager create-secret \
  --name review-terminal/env \
  --secret-string '{
    "GHE_CLIENT_ID": "your_client_id",
    "GHE_CLIENT_SECRET": "your_client_secret",
    "SESSION_SECRET": "'$(openssl rand -base64 32)'"
  }'
```

##### 3.2 Create ECS Task Definition
```bash
# Create task-definition.json (see deploy/docker/task-definition.json)
aws ecs register-task-definition \
  --cli-input-json file://deploy/docker/task-definition.json
```

##### 3.3 Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name review-terminal-cluster \
  --capacity-providers FARGATE \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
```

##### 3.4 Create Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name review-terminal-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345 \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name review-terminal-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-12345 \
  --target-type ip \
  --health-check-path /healthz \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

##### 3.5 Create ECS Service
```bash
aws ecs create-service \
  --cluster review-terminal-cluster \
  --service-name review-terminal-service \
  --task-definition review-terminal:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-12345,subnet-67890],
    securityGroups=[sg-12345],
    assignPublicIp=ENABLED
  }" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=review-terminal,containerPort=8080
```

---

## Cost Comparison

| Component | Amplify + Lambda | Docker on ECS |
|-----------|------------------|---------------|
| **Compute** | $0.02/mo (Lambda) | $29/mo (Fargate 0.25 vCPU) |
| **Frontend Hosting** | $12/mo (Amplify) | Included in Fargate |
| **Load Balancer** | $0 (Function URL) | $16/mo (ALB) |
| **Data Transfer** | Included (CloudFront) | ~$1/mo |
| **Total** | **~$12-15/mo** | **~$46-50/mo** |
| **Savings** | **70% cheaper** | Baseline |

### Cost Optimization Tips

**Amplify + Lambda**:
- Use Lambda Function URLs instead of API Gateway (saves $3.50/mo)
- Enable Amplify caching (included)
- Consider reserved concurrency only if cold starts are an issue (+$12/mo)

**Docker on ECS**:
- Use Fargate Spot (up to 70% discount, but can be interrupted)
- Consider ECS on EC2 for long-term (requires more management)
- Use VPC endpoints to avoid NAT Gateway costs ($32/mo)

---

## Prerequisites

### AWS Account Requirements
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- IAM permissions for:
  - Lambda (create, update functions)
  - Amplify (create apps, configure)
  - Secrets Manager (create, read secrets)
  - CloudWatch (view logs)
  - ECR (if using Docker)
  - ECS, ALB (if using Docker)

### Local Development Tools
- Node.js 20+ installed
- PNPM 10.24.0 installed
- Docker (if using Docker deployment)
- Git

### GitHub Requirements
- GitHub account (or GitHub Enterprise)
- Repository access for OAuth app creation
- Admin rights to create OAuth applications

---

## Post-Deployment Configuration

### Environment Variables Reference

#### Frontend (Amplify)
```bash
VITE_API_BASE=https://YOUR_LAMBDA_URL  # or / for Docker
VITE_GHE_BASE_URL=https://github.com
VITE_AUTH_CALLBACK_PATH=/auth/callback
VITE_AUTH_ENABLED=true
```

#### Backend (Lambda)
```bash
NODE_ENV=production
GHE_BASE_URL=https://github.com
FRONTEND_BASE_URL=https://YOUR_AMPLIFY_URL
AUTH_REDIRECT_URI=https://YOUR_LAMBDA_URL/auth/github-enterprise/callback
LOG_LEVEL=info
# Plus secrets from Secrets Manager via ARNs
```

#### Backend (Docker)
```bash
NODE_ENV=production
PORT=8080
GHE_BASE_URL=https://github.com
GHE_CLIENT_ID=from_secrets_manager
GHE_CLIENT_SECRET=from_secrets_manager
SESSION_SECRET=from_secrets_manager
FRONTEND_BASE_URL=https://YOUR_ALB_URL
AUTH_REDIRECT_URI=https://YOUR_ALB_URL/auth/github-enterprise/callback
```

---

## Troubleshooting

### Lambda Issues

#### Cold Starts
**Problem**: First request takes 1-2 seconds
**Solution**:
```bash
# Enable provisioned concurrency (adds $12/mo)
aws lambda put-provisioned-concurrency-config \
  --function-name review-terminal-auth \
  --provisioned-concurrent-executions 1
```

#### CORS Errors
**Problem**: Browser shows CORS error
**Solution**: Update Lambda Function URL CORS config with exact Amplify URL

#### Secrets Not Loading
**Problem**: Lambda returns 500 errors
**Solution**:
1. Check IAM role has `SecretsManagerReadWrite` policy
2. Verify secret ARNs are correct
3. Check CloudWatch logs: `aws logs tail /aws/lambda/review-terminal-auth`

### Amplify Issues

#### Build Fails
**Problem**: Amplify build fails with PNPM error
**Solution**: Ensure `amplify.yml` has correct PNPM setup:
```yaml
preBuild:
  commands:
    - corepack enable
    - corepack prepare pnpm@10.24.0 --activate
```

#### Environment Variables Not Working
**Problem**: Frontend can't reach backend
**Solution**: Rebuild after adding env vars (Amplify doesn't auto-rebuild)

### Docker Issues

#### Image Too Large
**Problem**: Docker image > 1GB
**Solution**: Multi-stage build is already optimized. Check:
- Node modules only has production deps
- No `.git` directory in image

#### Container Crashes
**Problem**: ECS task fails health checks
**Solution**:
1. Check logs: `aws logs tail /ecs/review-terminal`
2. Verify port 8080 is exposed
3. Test `/healthz` endpoint

### GitHub OAuth Issues

#### Callback URL Mismatch
**Problem**: OAuth returns "redirect_uri_mismatch"
**Solution**: Ensure GitHub OAuth app callback URL exactly matches:
- Lambda: `https://YOUR_LAMBDA_URL/auth/github-enterprise/callback`
- Docker: `https://YOUR_ALB_URL/auth/github-enterprise/callback`

---

## Monitoring and Logging

### CloudWatch Logs

**Lambda**:
```bash
# View logs
aws logs tail /aws/lambda/review-terminal-auth --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/review-terminal-auth \
  --filter-pattern "ERROR"
```

**Amplify**:
- Console → Amplify → Your App → Build logs

**ECS**:
```bash
aws logs tail /ecs/review-terminal --follow
```

### Metrics to Monitor

- **Lambda**: Invocations, Errors, Duration, Throttles
- **Amplify**: Build success rate, Deploy time
- **ECS**: CPU utilization, Memory utilization, Task health

---

## Security Best Practices

1. **Secrets Management**:
   - ✅ Use AWS Secrets Manager (never hardcode)
   - ✅ Rotate secrets every 90 days
   - ✅ Use IAM roles, not access keys

2. **Network Security**:
   - ✅ Lambda Function URL with CORS restrictions
   - ✅ ALB with security groups (ECS)
   - ✅ HTTPS only (Amplify auto-configures)

3. **Application Security**:
   - ✅ Validate OAuth state parameter
   - ✅ HTTP-only cookies for sessions
   - ✅ Secure cookie flag in production

4. **Access Control**:
   - ✅ Principle of least privilege for IAM roles
   - ✅ VPC for ECS tasks (optional)
   - ✅ Private subnets for ECS (optional)

---

## Support and Resources

- **AWS Documentation**:
  - [AWS Amplify](https://docs.aws.amazon.com/amplify/)
  - [AWS Lambda](https://docs.aws.amazon.com/lambda/)
  - [Amazon ECS](https://docs.aws.amazon.com/ecs/)

- **Framework Documentation**:
  - [Hono](https://hono.dev/)
  - [Vite](https://vitejs.dev/)
  - [React](https://react.dev/)

- **GitHub OAuth**:
  - [OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

## License

This deployment configuration is part of the Review Terminal project.

## Questions?

For issues or questions, please refer to the main project README or open an issue in the repository.
