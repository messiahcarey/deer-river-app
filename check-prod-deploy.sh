#!/bin/bash

echo "🔍 Checking PRODUCTION deployment status..."
echo "=================================="

aws amplify list-jobs --app-id d25mi5h1ems0sj --branch-name main --max-results 3 --no-paginate

echo ""
echo "🔄 Run this script again to check status"
echo "📋 For detailed logs, use: aws amplify get-job --app-id d25mi5h1ems0sj --branch-name main --job-id [JOB_ID]"
