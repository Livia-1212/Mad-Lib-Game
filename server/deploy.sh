#!/bin/bash

# === CONFIGURATION ===
FUNCTION_NAME="mad-lib-backend"
ZIP_NAME="lambda.zip"
S3_BUCKET="mad-lib-upload-bucket"
S3_KEY="lambda-uploads/$ZIP_NAME"
HASH_FILE=".package-lock.hash"

echo "🚀 Starting Lambda deploy for $FUNCTION_NAME..."

# === STEP 1: Compare package.json hash ===
echo "🔍 Checking if package.json changed..."

NEW_HASH=$(shasum package.json | awk '{ print $1 }')
OLD_HASH=""

if [ -f "$HASH_FILE" ]; then
  OLD_HASH=$(cat $HASH_FILE)
fi

if [ "$NEW_HASH" != "$OLD_HASH" ]; then
  echo "📦 Detected change in package.json. Reinstalling dependencies..."
  rm -rf node_modules package-lock.json
  npm install

  echo "$NEW_HASH" > $HASH_FILE
else
  echo "✅ No changes in package.json. Skipping npm install."
fi

# === STEP 2: Remove old zip ===
echo "🧼 Removing old zip..."
rm -f $ZIP_NAME

# === STEP 3: Create new zip ===
echo "📦 Creating new lambda.zip..."
zip -r $ZIP_NAME . -x "*.git*" "*.DS_Store" "*.sh" "node_modules/aws-sdk/*"

# === STEP 4: Upload to S3 ===
echo "☁️ Uploading to S3: s3://$S3_BUCKET/$S3_KEY"
aws s3 cp $ZIP_NAME s3://$S3_BUCKET/$S3_KEY

# === STEP 5: Update Lambda function ===
echo "🛠️ Updating Lambda function code..."
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --s3-bucket $S3_BUCKET \
  --s3-key $S3_KEY

echo "🎉 Deployment complete!"
