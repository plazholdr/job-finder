const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'job-finder-464817',
  keyFilename: path.join(__dirname, '../../job-finder-464817-c5c7e72ff0bf.json'),
});

const bucketName = 'job-finder';
const bucket = storage.bucket(bucketName);

// Storage configuration
const storageConfig = {
  projectId: 'job-finder-464817',
  bucketName: 'job-finder',
  bucket: bucket,
  
  // File upload settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
  
  // File organization
  folders: {
    jobAttachments: 'job-attachments',
    temp: 'temp'
  }
};

module.exports = {
  storage,
  bucket,
  storageConfig
};
