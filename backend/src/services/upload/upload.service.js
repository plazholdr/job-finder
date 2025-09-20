const { upload, storageUtils } = require('../../utils/storage');
const { BadRequest } = require('@feathersjs/errors');

class UploadService {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  async create(data, params) {
    return new Promise((resolve, reject) => {
      // Use multer middleware
      const uploadMiddleware = upload.fields([
        { name: 'resume', maxCount: 1 },
        { name: 'avatar', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
        { name: 'portfolio', maxCount: 5 },
        { name: 'document', maxCount: 10 }
      ]);

      uploadMiddleware(params.req, params.res, async (err) => {
        if (err) {
          return reject(new BadRequest(err.message));
        }

        const files = params.req.files;
        if (!files || Object.keys(files).length === 0) {
          return reject(new BadRequest('No files uploaded'));
        }

        const uploadedFiles = {};

        // Process uploaded files
        for (const [fieldName, fileArray] of Object.entries(files)) {
          const processedFiles = [];
          for (const file of fileArray) {
            const signedUrl = await storageUtils.getSignedUrl(file.key);
            processedFiles.push({
              key: file.key,
              originalName: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              url: storageUtils.getFileUrl(file.key),
              signedUrl: signedUrl
            });
          }
          uploadedFiles[fieldName] = processedFiles;
        }

        resolve({
          message: 'Files uploaded successfully',
          files: uploadedFiles
        });
      });
    });
  }

  async remove(id, params) {
    try {
      // id should be the file key
      await storageUtils.deleteFile(id);
      return { message: 'File deleted successfully', key: id };
    } catch (error) {
      throw new BadRequest(`Failed to delete file: ${error.message}`);
    }
  }

  async get(id, params) {
    try {
      // Generate signed URL for file access
      const signedUrl = await storageUtils.getSignedUrl(id, 3600); // 1 hour expiry
      return {
        key: id,
        signedUrl,
        publicUrl: storageUtils.getFileUrl(id)
      };
    } catch (error) {
      throw new BadRequest(`Failed to get file URL: ${error.message}`);
    }
  }
}

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/upload', new UploadService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('upload');

  service.hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [
        // Authenticate user before upload
        require('@feathersjs/authentication').hooks.authenticate('jwt')
      ],
      update: [],
      patch: [],
      remove: [
        require('@feathersjs/authentication').hooks.authenticate('jwt')
      ]
    },
    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  });
};
