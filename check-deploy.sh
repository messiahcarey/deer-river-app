#!/bin/bash

# Simple deployment status checker
APP_ID="d25mi5h1ems0sj"
BRANCH="development"

echo "🔍 Checking deployment status..."
echo "=================================="

# Get the latest job status
aws amplify list-jobs --app-id $APP_ID --branch-name $BRANCH --max-results 1 --query 'jobSummaries[0].{JobId:jobId,Status:status,Commit:commitMessage}' --output table

echo ""
echo "🔄 Run this script again to check status"
echo "📋 For detailed logs, use: aws amplify get-job --app-id $APP_ID --branch-name $BRANCH --job-id [JOB_ID]"
