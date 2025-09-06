const AWS = require('aws-sdk');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Configure AWS S3 for S3-compatible storage
const s3 = new AWS.S3({
  endpoint: config.storage.s3.endpoint,
  accessKeyId: config.storage.s3.accessKey,
  secretAccessKey: config.storage.s3.secretKey,
  region: process.env.S3_REGION || 'us-east-1',
  s3ForcePathStyle: true, // Required for S3-compatible services
  signatureVersion: 'v4'
});

const bucketName = config.storage.s3.bucket;

// Storage configuration
const storageConfig = {
  bucketName: bucketName,

  // File upload settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp'],

  // File organization
  folders: {
    jobAttachments: 'job-attachments',
    userResumes: 'user-resumes',
    onboardingMaterials: 'onboarding-materials',
    profileImages: 'profile-images',
    companyLogos: 'company-logos',
    temp: 'temp'
  }
};

class S3StorageUtils {
  /**
   * Upload a file to S3-compatible storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} companyId - Company ID
   * @param {string} jobId - Job ID (optional)
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Upload result with file URL and metadata
   */
  static async uploadJobAttachment(fileBuffer, originalName, companyId, jobId = null, mimeType) {
    try {
      // Validate file type
      if (!storageConfig.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not allowed`);
      }

      // Validate file size
      if (fileBuffer.length > storageConfig.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${storageConfig.maxFileSize / (1024 * 1024)}MB`);
      }

      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const uniqueId = uuidv4();
      const fileName = `${uniqueId}${fileExtension}`;

      // Create file path
      const folderPath = jobId
        ? `${storageConfig.folders.jobAttachments}/${companyId}/${jobId}`
        : `${storageConfig.folders.jobAttachments}/${companyId}`;

      const filePath = `${folderPath}/${fileName}`;

      // Upload to S3
      const uploadParams = {
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          originalName: originalName,
          companyId: companyId,
          jobId: jobId || '',
          uploadedAt: new Date().toISOString()
        }
      };

      const result = await s3.upload(uploadParams).promise();

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: result.Location,
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };

    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload user resume to S3-compatible storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} userId - User ID
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Upload result with file URL and metadata
   */
  static async uploadUserResume(fileBuffer, originalName, userId, mimeType) {
    try {
      // Validate file type
      if (!storageConfig.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not allowed`);
      }

      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const fileName = `resume_${userId}_${uuidv4()}${fileExtension}`;

      // Create folder path for user resumes
      const folderPath = `${storageConfig.folders.userResumes}/${userId}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to S3
      const uploadParams = {
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          originalName: originalName,
          userId: userId,
          uploadedAt: new Date().toISOString(),
          fileType: 'resume'
        }
      };

      const result = await s3.upload(uploadParams).promise();

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: result.Location,
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };

    } catch (error) {
      console.error('Error uploading resume to S3:', error);
      throw new Error(`Resume upload failed: ${error.message}`);
    }
  }

  /**
   * Upload profile image to S3-compatible storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} userId - User ID
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Upload result with file URL and metadata
   */
  static async uploadProfileImage(fileBuffer, originalName, userId, mimeType) {
    try {
      // Validate file type (only images)
      const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!imageMimeTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not allowed for profile images`);
      }

      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const fileName = `profile_${userId}_${uuidv4()}${fileExtension}`;

      // Create folder path for profile images
      const folderPath = `${storageConfig.folders.profileImages}/${userId}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to S3
      const uploadParams = {
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          originalName: originalName,
          userId: userId,
          uploadedAt: new Date().toISOString(),
          fileType: 'profile-image'
        }
      };

      const result = await s3.upload(uploadParams).promise();

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: result.Location,
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };

    } catch (error) {
      console.error('Error uploading profile image to S3:', error);
      throw new Error(`Profile image upload failed: ${error.message}`);
    }
  }

  /**
   * Upload company logo to S3-compatible storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} companyId - Company ID
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Upload result with file URL and metadata
   */
  static async uploadCompanyLogo(fileBuffer, originalName, companyId, mimeType) {
    try {
      // Validate file type (only images)
      const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!imageMimeTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not allowed for company logos`);
      }

      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const fileName = `logo_${companyId}_${uuidv4()}${fileExtension}`;

      // Create folder path for company logos
      const folderPath = `${storageConfig.folders.companyLogos}/${companyId}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to S3
      const uploadParams = {
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          originalName: originalName,
          companyId: companyId,
          uploadedAt: new Date().toISOString(),
          fileType: 'company-logo'
        }
      };

      const result = await s3.upload(uploadParams).promise();

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: result.Location,
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };

    } catch (error) {
      console.error('Error uploading company logo to S3:', error);
      throw new Error(`Company logo upload failed: ${error.message}`);
    }
  }

  /**
   * Upload onboarding materials to S3-compatible storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} internshipId - Internship ID
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Upload result with file URL and metadata
   */
  static async uploadOnboardingMaterials(fileBuffer, originalName, internshipId, mimeType) {
    try {
      // Validate file type
      if (!storageConfig.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not allowed`);
      }

      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const fileName = `onboarding_${internshipId}_${uuidv4()}${fileExtension}`;

      // Create folder path for onboarding materials
      const folderPath = storageConfig.folders.onboardingMaterials;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to S3
      const uploadParams = {
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          originalName: originalName,
          internshipId: internshipId,
          uploadedAt: new Date().toISOString(),
          fileType: 'onboarding-materials'
        }
      };

      const result = await s3.upload(uploadParams).promise();

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: result.Location,
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };

    } catch (error) {
      console.error('Error uploading onboarding materials to S3:', error);
      throw new Error(`Onboarding materials upload failed: ${error.message}`);
    }
  }

  /**
   * Generate a signed download URL for a file
   * @param {string} filePath - File path in S3
   * @param {number} expiresInMinutes - URL expiration time in minutes (default: 60)
   * @returns {Promise<string>} Signed download URL
   */
  static async generateDownloadUrl(filePath, expiresInMinutes = 60) {
    try {
      // Check if file exists
      const headParams = {
        Bucket: bucketName,
        Key: filePath
      };

      await s3.headObject(headParams).promise();

      // Generate signed URL
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: filePath,
        Expires: expiresInMinutes * 60
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3-compatible storage
   * @param {string} filePath - File path in S3
   * @returns {Promise<boolean>} Success status
   */
  static async deleteFile(filePath) {
    try {
      const deleteParams = {
        Bucket: bucketName,
        Key: filePath
      };

      await s3.deleteObject(deleteParams).promise();
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   * @param {string} folderPath - Folder path in S3
   * @param {number} maxKeys - Maximum number of files to return
   * @returns {Promise<Array>} List of files
   */
  static async listFiles(folderPath, maxKeys = 100) {
    try {
      const listParams = {
        Bucket: bucketName,
        Prefix: folderPath,
        MaxKeys: maxKeys
      };

      const result = await s3.listObjectsV2(listParams).promise();

      return result.Contents.map(file => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
        etag: file.ETag
      }));
    } catch (error) {
      console.error('Error listing files from S3:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for private file access
   * @param {string} filePath - File path in S3
   * @param {number} expiresInMinutes - URL expiration time in minutes
   * @returns {Promise<string>} Signed URL
   */
  static async generateSignedUrl(filePath, expiresInMinutes = 60) {
    return this.generateDownloadUrl(filePath, expiresInMinutes);
  }

  /**
   * Validate file before upload
   * @param {Object} file - File object from multer
   * @returns {Object} Validation result
   */
  static validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > storageConfig.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${storageConfig.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check MIME type
    if (!storageConfig.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, WEBP`);
    }

    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!storageConfig.allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension ${fileExtension} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get file metadata
   * @param {string} filePath - File path in S3
   * @returns {Promise<Object>} File metadata
   */
  static async getFileMetadata(filePath) {
    try {
      const headParams = {
        Bucket: bucketName,
        Key: filePath
      };

      const result = await s3.headObject(headParams).promise();

      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }
}

module.exports = {
  S3StorageUtils,
  storageConfig,
  s3
};
