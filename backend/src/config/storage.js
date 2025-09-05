const { Storage } = require('@google-cloud/storage');
const path = require('path');
const config = require('./index');

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: config.storage.gcs.projectId,
  keyFilename: path.join(__dirname, '../../', config.storage.gcs.keyFilename),
});

const bucketName = config.storage.gcs.bucketName;
const bucket = storage.bucket(bucketName);

// Storage configuration
const storageConfig = {
  projectId: config.storage.gcs.projectId,
  bucketName: config.storage.gcs.bucketName,
  bucket: bucket,
  
  // File upload settings
  maxFileSize: config.storage.gcs.maxFileSize,
  allowedMimeTypes: config.storage.gcs.allowedMimeTypes,
  allowedExtensions: config.storage.gcs.allowedExtensions,
  
  // File organization
  folders: config.storage.gcs.folders
};

module.exports = {
  storage,
  bucket,
  storageConfig
};
