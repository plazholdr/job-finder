const { bucket, storageConfig } = require('../config/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class StorageUtils {
  /**
   * Upload a file to Google Cloud Storage
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

      // Upload to GCS
      const file = bucket.file(filePath);
      
      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: originalName,
            companyId: companyId,
            jobId: jobId || '',
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Don't make file public - we'll generate signed URLs on demand
      // Store the file path instead of a public URL
      const publicUrl = null; // Will be generated on download

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: publicUrl,
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };

    } catch (error) {
      console.error('Error uploading file to GCS:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload user resume to Google Cloud Storage
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
      const folderPath = `user-resumes/${userId}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to GCS
      const file = bucket.file(filePath);

      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: originalName,
            userId: userId,
            uploadedAt: new Date().toISOString(),
            fileType: 'resume'
          }
        }
      });

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: null, // Will be generated on download
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading user resume:', error);
      throw new Error(`Resume upload failed: ${error.message}`);
    }
  }

  /**
   * Upload offer letter to Google Cloud Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} applicationId - Application ID
   * @param {string} companyId - Company ID
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Upload result with file URL and metadata
   */
  static async uploadOfferLetter(fileBuffer, originalName, applicationId, companyId, mimeType) {
    try {
      // Validate file type (only PDF for offer letters)
      if (mimeType !== 'application/pdf') {
        throw new Error('Only PDF files are allowed for offer letters');
      }

      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const fileName = `offer_letter_${applicationId}_${uuidv4()}${fileExtension}`;

      // Create folder path for offer letters
      const folderPath = `offer-letters/${companyId}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to GCS
      const file = bucket.file(filePath);

      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: originalName,
            applicationId: applicationId,
            companyId: companyId,
            uploadedAt: new Date().toISOString(),
            fileType: 'offer_letter'
          }
        }
      });

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: null, // Will be generated on download
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };

    } catch (error) {
      console.error('Error uploading offer letter:', error);
      throw new Error(`Offer letter upload failed: ${error.message}`);
    }
  }

  /**
   * Upload onboarding materials to Google Cloud Storage
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
      const folderPath = `onboarding-materials`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to GCS
      const file = bucket.file(filePath);

      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: originalName,
            internshipId: internshipId,
            uploadedAt: new Date().toISOString(),
            fileType: 'onboarding-materials'
          }
        }
      });

      return {
        success: true,
        fileName: fileName,
        originalName: originalName,
        filePath: filePath,
        publicUrl: null, // Will be generated on download
        size: fileBuffer.length,
        mimeType: mimeType,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading onboarding materials:', error);
      throw new Error(`Onboarding materials upload failed: ${error.message}`);
    }
  }

  /**
   * Generate a signed download URL for a file
   * @param {string} filePath - File path in GCS
   * @param {number} expiresInMinutes - URL expiration time in minutes (default: 60)
   * @returns {Promise<string>} Signed download URL
   */
  static async generateDownloadUrl(filePath, expiresInMinutes = 60) {
    try {
      const file = bucket.file(filePath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found');
      }

      // Generate signed URL
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param {string} filePath - File path in GCS
   * @returns {Promise<boolean>} Success status
   */
  static async deleteFile(filePath) {
    try {
      const file = bucket.file(filePath);
      await file.delete();
      return true;
    } catch (error) {
      console.error('Error deleting file from GCS:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   * @param {string} filePath - File path in GCS
   * @returns {Promise<Object>} File metadata
   */
  static async getFileMetadata(filePath) {
    try {
      const file = bucket.file(filePath);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for private file access
   * @param {string} filePath - File path in GCS
   * @param {number} expiresInMinutes - URL expiration time in minutes
   * @returns {Promise<string>} Signed URL
   */
  static async generateSignedUrl(filePath, expiresInMinutes = 60) {
    try {
      const file = bucket.file(filePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000
      });
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
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
      errors.push(`File type ${file.mimetype} is not allowed. Allowed types: PDF, DOC, DOCX, TXT`);
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
   * Download a file from Google Cloud Storage
   * @param {string} filePath - Path to the file in the bucket
   * @returns {Promise<Object>} Download result with file buffer and metadata
   */
  static async downloadFile(filePath) {
    try {
      if (!filePath) {
        throw new Error('File path is required');
      }

      // Get file from GCS
      const file = bucket.file(filePath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found in storage');
      }

      // Download file
      const [fileBuffer] = await file.download();

      // Get file metadata
      const [metadata] = await file.getMetadata();

      return {
        success: true,
        fileBuffer: fileBuffer,
        fileName: path.basename(filePath),
        mimeType: metadata.contentType || 'application/octet-stream',
        size: metadata.size,
        uploadedAt: metadata.timeCreated
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }
}

module.exports = StorageUtils;
