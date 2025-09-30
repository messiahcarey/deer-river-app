#!/bin/bash

# Monitor AWS Amplify deployment
APP_ID="d25mi5h1ems0sj"
BRANCH="development"

echo "🔍 Monitoring deployment for app $APP_ID, branch $BRANCH"
echo "=================================================="

# Get the latest job
LATEST_JOB=$(aws amplify list-jobs --app-id $APP_ID --branch-name $BRANCH --max-results 1 --query 'jobSummaries[0]' --output json)

if [ "$LATEST_JOB" = "null" ]; then
    echo "❌ No jobs found"
    exit 1
fi

JOB_ID=$(echo $LATEST_JOB | jq -r '.jobId')
STATUS=$(echo $LATEST_JOB | jq -r '.status')
COMMIT_MSG=$(echo $LATEST_JOB | jq -r '.commitMessage' | head -1)

echo "📋 Job ID: $JOB_ID"
echo "📝 Commit: $COMMIT_MSG"
echo "📊 Status: $STATUS"
echo ""

if [ "$STATUS" = "RUNNING" ]; then
    echo "⏳ Deployment is running... checking details"
    
    # Get detailed job info
    JOB_DETAILS=$(aws amplify get-job --app-id $APP_ID --branch-name $BRANCH --job-id $JOB_ID --query 'job' --output json)
    
    echo "📋 Build Steps:"
    echo $JOB_DETAILS | jq -r '.steps[] | "  \(.stepName): \(.status)"'
    
    # Check if there are any failed steps
    FAILED_STEPS=$(echo $JOB_DETAILS | jq -r '.steps[] | select(.status == "FAILED") | .stepName')
    if [ ! -z "$FAILED_STEPS" ]; then
        echo ""
        echo "❌ Failed steps: $FAILED_STEPS"
        echo "📋 Check logs for details"
    fi
    
elif [ "$STATUS" = "SUCCEED" ]; then
    echo "✅ Deployment succeeded!"
    echo "🌐 App should be available at: https://development.d25mi5h1ems0sj.amplifyapp.com"
    
elif [ "$STATUS" = "FAILED" ]; then
    echo "❌ Deployment failed!"
    echo "📋 Check build logs for details"
    
else
    echo "ℹ️  Status: $STATUS"
fi

echo ""
echo "🔄 Run this script again to check status"
