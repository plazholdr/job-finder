const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS S3 for S3-compatible storage
const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION || 'us-east-1',
  s3ForcePathStyle: true, // Required for S3-compatible services
  signatureVersion: 'v4'
});

const bucketName = process.env.S3_BUCKET;

async function testS3Connection() {
  console.log('Testing S3 connection...');
  console.log('Endpoint:', process.env.S3_ENDPOINT);
  console.log('Bucket:', bucketName);
  console.log('Access Key:', process.env.S3_ACCESS_KEY ? 'Set' : 'Not set');
  console.log('Secret Key:', process.env.S3_SECRET_KEY ? 'Set' : 'Not set');
  
  try {
    // Test 1: List bucket contents
    console.log('\n1. Testing bucket listing...');
    const listResult = await s3.listObjectsV2({
      Bucket: bucketName,
      MaxKeys: 10
    }).promise();
    
    console.log('✅ Bucket listing successful!');
    console.log(`Found ${listResult.Contents.length} objects`);
    
    if (listResult.Contents.length > 0) {
      console.log('First few objects:');
      listResult.Contents.slice(0, 3).forEach(obj => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
      });
    }
    
    // Test 2: Check if a specific logo file exists
    const logoKey = 'company-logos/68c4dc6a50b0e761c084347/logo_68c4dc6a50b0e761c084347_951e0359b1e6.png';
    console.log(`\n2. Testing specific file: ${logoKey}`);
    
    try {
      const headResult = await s3.headObject({
        Bucket: bucketName,
        Key: logoKey
      }).promise();
      
      console.log('✅ File exists!');
      console.log('File size:', headResult.ContentLength);
      console.log('Content type:', headResult.ContentType);
      
      // Test 3: Generate signed URL
      console.log('\n3. Testing signed URL generation...');
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: logoKey,
        Expires: 60 * 10 // 10 minutes
      });
      
      console.log('✅ Signed URL generated!');
      console.log('URL:', signedUrl);
      
    } catch (fileError) {
      console.log('❌ File not found or not accessible');
      console.log('Error:', fileError.message);
    }
    
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testS3Connection();
