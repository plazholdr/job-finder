const InternshipModel = require('../models/internship.model');
const ApplicationModel = require('../models/application.model');
const JobModel = require('../models/job.model');
const UserModel = require('../models/user.model');

class InternshipsService {
  constructor(app) {
    this.app = app;
    this.internshipModel = new InternshipModel(app.get('mongoClient').db());
    this.applicationModel = new ApplicationModel(app.get('mongoClient').db());
    this.jobModel = new JobModel(app.get('mongoClient').db());
    this.userModel = new UserModel(app.get('mongoClient').db());
  }

  async create(data, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      console.log('🏭 InternshipsService.create called');
      console.log('📊 Input data:', data);
      console.log('👤 User ID:', userId, 'Role:', userRole);
      console.log('🔗 Database connection status:', this.app.get('mongoClient') ? 'Connected' : 'Not connected');

      // Validate required fields
      const { applicationId, jobId, companyId } = data;
      if (!applicationId || !jobId || !companyId) {
        throw new Error('Application ID, Job ID, and Company ID are required');
      }

      // Verify the application exists and is accepted
      const application = await this.applicationModel.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      if (application.status !== 'accepted') {
        throw new Error('Can only create internship for accepted applications');
      }

      // Verify user has permission (student who owns the application or company admin)
      if (userRole === 'student' && application.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only create internships for your own applications');
      } else if (userRole === 'company' && application.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only create internships for your company\'s applications');
      }

      // Get job details for internship information
      const job = await this.jobModel.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Get user details
      const user = await this.userModel.findById(application.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Prepare internship data
      const internshipData = {
        userId: application.userId,
        jobId: jobId,
        companyId: companyId,
        applicationId: applicationId,
        position: job.title || 'Intern',
        department: job.department || null,
        description: job.description || '',
        requirements: job.requirements || [],
        location: job.location || '',
        workType: job.workType || 'onsite',
        duration: job.duration || null,
        stipend: job.salary || null,
        startDate: data.startDate || new Date(),
        endDate: data.endDate || null,
        status: 'active',
        internshipStatus: 'ongoing', // Student has accepted the offer and internship is ongoing
        letterOfOffer: application.offerLetterUrl || null,
        onboardingMaterialUrl: data.onboardingMaterialUrl || null,
        review: null, // Will be filled during/after internship
        remarks: data.remarks || ''
      };

      // Create the internship
      const internship = await this.internshipModel.create(internshipData);

      console.log('Internship created successfully:', internship._id);

      // Return enriched internship data
      return {
        ...internship,
        jobInfo: job,
        userInfo: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        },
        applicationInfo: {
          _id: application._id,
          submittedAt: application.submittedAt,
          status: application.status
        }
      };

    } catch (error) {
      console.error('Error creating internship:', error);
      throw error;
    }
  }

  async find(params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;
      const query = params.query || {};

      if (!userId) {
        throw new Error('Authentication required');
      }

      console.log('Finding internships for user:', userId, 'role:', userRole);

      // Build filter based on user role and permissions
      const filter = {};

      if (userRole === 'student') {
        // Students can only see their own internships
        filter.userId = userId;
      } else if (userRole === 'company') {
        // Companies can only see internships for their jobs
        filter.companyId = userId;
      } else if (userRole === 'admin') {
        // Admins can see all internships
        // No additional filter needed
      } else {
        throw new Error('Access denied');
      }

      // Add query filters
      if (query.status) {
        filter.status = query.status;
      }

      if (query.startDate) {
        filter.startDate = { $gte: new Date(query.startDate) };
      }

      if (query.endDate) {
        filter.endDate = { $lte: new Date(query.endDate) };
      }

      const internships = await this.internshipModel.find({
        ...filter,
        limit: parseInt(query.limit) || 50,
        skip: parseInt(query.skip) || 0,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: parseInt(query.sortOrder) || -1
      });

      // Enrich with related data
      const enrichedInternships = await Promise.all(
        internships.map(async (internship) => {
          const [job, user, application] = await Promise.all([
            this.jobModel.findById(internship.jobId),
            this.userModel.findById(internship.userId, {
              projection: {
                password: 0,
                resetPasswordToken: 0,
                resetPasswordExpires: 0
              }
            }),
            this.applicationModel.findById(internship.applicationId)
          ]);

          return {
            ...internship,
            jobInfo: job,
            userInfo: user,
            applicationInfo: application,
            letterOfOffer: application?.offerLetterUrl || null
          };
        })
      );

      return enrichedInternships;

    } catch (error) {
      console.error('Error finding internships:', error);
      throw error;
    }
  }

  async get(id, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      const internship = await this.internshipModel.findById(id);
      if (!internship) {
        const error = new Error('Internship not found');
        error.code = 404;
        throw error;
      }

      // Check access permissions
      if (userRole === 'student' && internship.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only view your own internships');
      } else if (userRole === 'company' && internship.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only view internships for your company');
      }

      // Enrich with related data
      const [job, user, application] = await Promise.all([
        this.jobModel.findById(internship.jobId),
        this.userModel.findById(internship.userId, {
          projection: {
            password: 0,
            resetPasswordToken: 0,
            resetPasswordExpires: 0
          }
        }),
        this.applicationModel.findById(internship.applicationId)
      ]);

      return {
        ...internship,
        jobInfo: job,
        userInfo: user,
        applicationInfo: application,
        letterOfOffer: application?.offerLetterUrl || null
      };

    } catch (error) {
      console.error('Error getting internship:', error);
      throw error;
    }
  }

  async patch(id, data, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      const internship = await this.internshipModel.findById(id);
      if (!internship) {
        const error = new Error('Internship not found');
        error.code = 404;
        throw error;
      }

      // Check access permissions
      if (userRole === 'student' && internship.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only update your own internships');
      } else if (userRole === 'company' && internship.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only update internships for your company');
      }

      // Handle status updates
      if (data.status && data.status !== internship.status) {
        const updatedInternship = await this.internshipModel.updateStatus(
          id,
          data.status,
          userId,
          data.reason || ''
        );
        return updatedInternship;
      }

      // Handle onboarding materials upload
      if (data.onboardingMaterial) {
        console.log('Uploading onboarding materials for internship:', id);

        // Here you would typically upload to your file storage service
        // For now, we'll store the file info in the database
        const updateData = {
          onboardingMaterialUrl: `onboarding_${id}_${Date.now()}.pdf`,
          updatedAt: new Date()
        };

        const { ObjectId } = require('mongodb');
        const objectId = new ObjectId(id);

        const result = await this.internshipModel.collection.updateOne(
          { _id: objectId },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          throw new Error('Internship not found');
        }

        console.log('Onboarding materials uploaded successfully');
        return await this.internshipModel.findById(id);
      }

      // Handle internship status updates (completion, termination)
      if (data.internshipStatus) {
        console.log('Updating internship status to:', data.internshipStatus);

        const updateData = {
          internshipStatus: data.internshipStatus,
          updatedAt: new Date()
        };

        // Handle completion
        if (data.internshipStatus === 'completed') {
          if (data.review) {
            updateData.review = data.review;
          }
          if (data.endDate) {
            updateData.endDate = new Date(data.endDate);
          }
          console.log('Completing internship with review');
        }

        // Handle termination
        if (data.internshipStatus === 'terminated') {
          if (data.remarks) {
            updateData.remarks = data.remarks;
          }
          if (data.endDate) {
            updateData.endDate = new Date(data.endDate);
          }
          console.log('Terminating internship with reason');
        }

        const { ObjectId } = require('mongodb');
        const objectId = new ObjectId(id);

        const result = await this.internshipModel.collection.updateOne(
          { _id: objectId },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          throw new Error('Internship not found');
        }

        const updatedInternship = await this.internshipModel.findById(id);

        // Get the updated internship with application data for offer letter
        const enrichedInternship = await this.enrichInternshipWithApplicationData(updatedInternship);

        console.log('Internship status updated successfully');
        return enrichedInternship;
      }

      // Handle other general updates
      const allowedUpdates = ['review', 'remarks', 'onboardingMaterialUrl', 'endDate'];
      const updateData = {};

      for (const key of allowedUpdates) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date();

        const { ObjectId } = require('mongodb');
        const objectId = new ObjectId(id);

        const result = await this.internshipModel.collection.updateOne(
          { _id: objectId },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          throw new Error('Internship not found');
        }

        return await this.internshipModel.findById(id);
      }

      return internship;

    } catch (error) {
      console.error('Error updating internship:', error);
      throw error;
    }
  }

  async remove(id, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      const internship = await this.internshipModel.findById(id);
      if (!internship) {
        const error = new Error('Internship not found');
        error.code = 404;
        throw error;
      }

      // Only admins or company admins can delete internships
      if (userRole !== 'admin' && 
          (userRole !== 'company' || internship.companyId.toString() !== userId.toString())) {
        throw new Error('Access denied: Only admins or company administrators can delete internships');
      }

      await this.internshipModel.delete(id);
      return { success: true, message: 'Internship deleted successfully' };

    } catch (error) {
      console.error('Error deleting internship:', error);
      throw error;
    }
  }

  async enrichInternshipWithApplicationData(internship) {
    try {
      if (!internship.applicationId) {
        return internship;
      }

      // Get application data to fetch offer letter URL
      const ApplicationModel = require('../models/application.model');
      const applicationModel = new ApplicationModel(this.db);
      const application = await applicationModel.findById(internship.applicationId);

      if (application && application.offerLetterUrl) {
        // Add offer letter URL to internship data
        internship.letterOfOffer = application.offerLetterUrl;
      }

      return internship;
    } catch (error) {
      console.error('Error enriching internship with application data:', error);
      return internship; // Return original internship if enrichment fails
    }
  }

  async uploadOnboardingMaterials(id, file, companyId) {
    try {
      if (!companyId) {
        throw new Error('Authentication required');
      }

      // Validate file
      const StorageUtils = require('../utils/storage');
      const validation = StorageUtils.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Upload file to GCS
      const uploadResult = await StorageUtils.uploadOnboardingMaterials(
        file.buffer,
        file.originalname,
        id,
        file.mimetype
      );

      if (!uploadResult.success) {
        throw new Error('Failed to upload onboarding materials to storage');
      }

      // Get current internship to preserve existing data
      const currentInternship = await this.internshipModel.findById(id);
      if (!currentInternship) {
        throw new Error('Internship not found');
      }

      // Update internship with onboarding materials URL
      const updateData = {
        ...currentInternship,
        onboardingMaterialUrl: uploadResult.filePath,
        updatedAt: new Date()
      };

      // Use direct MongoDB update since internship model doesn't have updateById
      const { ObjectId } = require('mongodb');
      const objectId = new ObjectId(id);

      await this.internshipModel.collection.updateOne(
        { _id: objectId },
        { $set: { onboardingMaterialUrl: uploadResult.filePath, updatedAt: new Date() } }
      );

      return {
        success: true,
        message: 'Onboarding materials uploaded successfully',
        data: {
          fileName: uploadResult.fileName,
          filePath: uploadResult.filePath,
          uploadedAt: uploadResult.uploadedAt
        }
      };

    } catch (error) {
      console.error('Error uploading onboarding materials:', error);
      throw error;
    }
  }

  async downloadOnboardingMaterials(params) {
    try {
      const internshipId = params.internshipId;
      const userId = params.userId;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      if (!internshipId) {
        throw new Error('Internship ID is required');
      }

      // Get internship to check if it has onboarding materials
      const internship = await this.internshipModel.findById(internshipId);
      if (!internship) {
        throw new Error('Internship not found');
      }

      // Check access permissions
      if (userRole === 'student' && internship.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only download materials for your own internships');
      } else if (userRole === 'company' && internship.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only download materials for your company\'s internships');
      }

      if (!internship.onboardingMaterialUrl) {
        throw new Error('No onboarding materials found for this internship');
      }

      // Download file from Google Cloud Storage
      const StorageUtils = require('../utils/storage');
      const result = await StorageUtils.downloadFile(internship.onboardingMaterialUrl);

      console.log(`Onboarding materials downloaded for internship: ${internshipId}`);

      return {
        success: true,
        fileBuffer: result.fileBuffer,
        fileName: result.fileName,
        mimeType: result.mimeType
      };
    } catch (error) {
      console.error('Onboarding materials download failed:', error);
      throw error;
    }
  }
}

module.exports = InternshipsService;
