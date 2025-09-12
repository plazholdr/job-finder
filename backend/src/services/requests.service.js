const { getDB } = require('../db');
const RequestModel = require('../models/request.model');
const NotificationModel = require('../models/notification.model');
const InternshipModel = require('../models/internship.model');
const UserModel = require('../models/user.model');

class RequestsService {
  constructor(app) {
    this.app = app;
    this.requestModel = new RequestModel(getDB());
    this.notificationModel = new NotificationModel(getDB());
    this.internshipModel = new InternshipModel(getDB());
    this.userModel = new UserModel(getDB());
  }

  async create(data, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      console.log('🔍 Request creation started');
      console.log('📋 User ID:', userId);
      console.log('👤 User role:', userRole);
      console.log('📝 Request data:', data);

      if (!userId) {
        throw new Error('Authentication required');
      }

      if (userRole !== 'student') {
        throw new Error('Only students can create requests');
      }

      console.log('Creating request with data:', data);

      const {
        internshipId,
        completionRemark,
        type
      } = data;

      // Validate required fields
      if (!internshipId || !type) {
        throw new Error('Internship ID and type are required');
      }

      if (!['complete_in_advance', 'terminate'].includes(type)) {
        throw new Error('Type must be either "complete_in_advance" or "terminate"');
      }

      // Get internship details to get company ID
      console.log('🔍 Looking up internship with ID:', internshipId);
      const internship = await this.internshipModel.findById(internshipId);
      console.log('📋 Found internship:', internship ? 'Yes' : 'No');
      if (!internship) {
        throw new Error('Internship not found');
      }
      console.log('✅ Internship found, company ID:', internship.companyId);

      // Verify the internship belongs to the requesting user
      if (internship.userId.toString() !== userId.toString()) {
        throw new Error('You can only create requests for your own internships');
      }

      // Check if there's already a pending request for this internship
      const existingRequests = await this.requestModel.findByInternshipId(internshipId);
      const pendingRequest = existingRequests.find(req => req.status === 'pending');
      
      if (pendingRequest) {
        throw new Error('There is already a pending request for this internship');
      }

      // Create the request
      const requestData = {
        userId: userId,
        companyId: internship.companyId.toString(),
        internshipId: internshipId,
        completionRemark: completionRemark || '',
        type: type,
        status: 'pending'
      };

      const newRequest = await this.requestModel.create(requestData);

      // Get user details for notification
      const user = await this.userModel.findById(userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : 'Student';

      // Create notification for the company
      const notificationRemark = type === 'complete_in_advance' 
        ? `${userName} requests to complete internship in advance`
        : `${userName} requests to terminate internship`;

      const notificationData = {
        companyId: internship.companyId.toString(),
        userId: userId,
        itemId: newRequest._id.toString(),
        remark: notificationRemark,
        status: 'unread'
      };

      await this.notificationModel.create(notificationData);

      console.log('✅ Request created successfully with ID:', newRequest._id);
      console.log('✅ Notification sent to company');

      return {
        success: true,
        data: newRequest,
        message: 'Request submitted successfully'
      };

    } catch (error) {
      console.error('Error creating request:', error);
      throw new Error(error.message || 'Failed to create request');
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

      console.log('Finding requests for user:', userId, 'role:', userRole);

      // Build filter based on user role and permissions
      const filter = {};

      if (userRole === 'student') {
        // Students can only see their own requests
        filter.userId = userId;
      } else if (userRole === 'company') {
        // Companies can only see requests for their internships
        filter.companyId = userId;
      } else if (userRole === 'admin') {
        // Admins can see all requests
        // No additional filter needed
      } else {
        throw new Error('Access denied');
      }

      // Add additional filters from query
      if (query.status) {
        filter.status = query.status;
      }

      if (query.type) {
        filter.type = query.type;
      }

      if (query.internshipId) {
        filter.internshipId = query.internshipId;
      }

      const requests = await this.requestModel.find({
        ...filter,
        limit: parseInt(query.limit) || 50,
        skip: parseInt(query.skip) || 0,
        sortBy: query.sortBy || 'dateCreated',
        sortOrder: parseInt(query.sortOrder) || -1
      });

      console.log(`Found ${requests.length} requests`);

      // Populate student and internship information for each request
      const populatedRequests = await Promise.all(requests.map(async (request) => {
        try {
          // Get student information
          const student = await this.userModel.findById(request.userId);
          const studentInfo = student ? {
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email
          } : null;

          // Get internship information
          const internship = await this.internshipModel.findById(request.internshipId);
          const internshipInfo = internship ? {
            position: internship.position,
            department: internship.department,
            location: internship.location,
            startDate: internship.startDate,
            endDate: internship.endDate,
            workType: internship.workType
          } : null;

          return {
            ...request,
            studentInfo,
            internshipInfo
          };
        } catch (error) {
          console.error('Error populating request data:', error);
          return request; // Return original request if population fails
        }
      }));

      return {
        success: true,
        data: populatedRequests,
        total: populatedRequests.length
      };

    } catch (error) {
      console.error('Error finding requests:', error);
      throw new Error(error.message || 'Failed to fetch requests');
    }
  }

  async get(id, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      const request = await this.requestModel.findById(id);
      if (!request) {
        const error = new Error('Request not found');
        error.code = 404;
        throw error;
      }

      // Check access permissions
      if (userRole === 'student' && request.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only view your own requests');
      } else if (userRole === 'company' && request.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only view requests for your company');
      }

      // Populate student and internship information
      try {
        const student = await this.userModel.findById(request.userId);
        const studentInfo = student ? {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email
        } : null;

        const internship = await this.internshipModel.findById(request.internshipId);
        const internshipInfo = internship ? {
          position: internship.position,
          department: internship.department,
          location: internship.location,
          startDate: internship.startDate,
          endDate: internship.endDate,
          workType: internship.workType
        } : null;

        const populatedRequest = {
          ...request,
          studentInfo,
          internshipInfo
        };

        return {
          success: true,
          data: populatedRequest
        };
      } catch (error) {
        console.error('Error populating single request data:', error);
        return {
          success: true,
          data: request
        };
      }

    } catch (error) {
      console.error('Error getting request:', error);
      if (error.code === 404) {
        const notFoundError = new Error('Request not found');
        notFoundError.code = 404;
        throw notFoundError;
      }
      throw new Error(error.message || 'Failed to get request');
    }
  }

  async patch(id, data, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      // Only companies and admins can update request status
      if (userRole !== 'company' && userRole !== 'admin') {
        throw new Error('Access denied: Only companies can process requests');
      }

      const request = await this.requestModel.findById(id);
      if (!request) {
        const error = new Error('Request not found');
        error.code = 404;
        throw error;
      }

      // Check if company owns this request
      if (userRole === 'company' && request.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only process requests for your company');
      }

      const { status, response } = data;

      if (!status) {
        throw new Error('Status is required');
      }

      if (!['approved', 'rejected'].includes(status)) {
        throw new Error('Status must be either "approved" or "rejected"');
      }

      // Update the request
      await this.requestModel.updateStatus(id, status, userId, response);

      // If approved, also update the internship
      if (status === 'approved') {
        const request = await this.requestModel.findById(id);
        if (request && request.internshipId) {
          try {
            console.log('🔄 Updating internship for approved request...');

            const updateData = {};

            // Update remarks with admin notes
            if (response) {
              updateData.remarks = response;
            }

            // Update end date if effective date is provided
            if (data.effectiveDate) {
              updateData.endDate = new Date(data.effectiveDate);
              console.log('📅 Setting new end date:', updateData.endDate);
            }

            // Set internship status to completed
            updateData.internshipStatus = 'completed';
            updateData.completionStatus = 'early_completion';
            updateData.actualEndDate = data.effectiveDate ? new Date(data.effectiveDate) : new Date();

            console.log('🏁 Setting internship status to completed');

            if (Object.keys(updateData).length > 0) {
              await this.internshipModel.updateById(request.internshipId, updateData);
              console.log('✅ Internship updated successfully');
            }
          } catch (error) {
            console.error('❌ Error updating internship:', error);
            // Don't fail the request update if internship update fails
          }
        }
      }

      // Get updated request
      const updatedRequest = await this.requestModel.findById(id);

      console.log('✅ Request updated successfully');

      return {
        success: true,
        data: updatedRequest,
        message: `Request ${status} successfully`
      };

    } catch (error) {
      console.error('Error updating request:', error);
      if (error.code === 404) {
        const notFoundError = new Error('Request not found');
        notFoundError.code = 404;
        throw notFoundError;
      }
      throw new Error(error.message || 'Failed to update request');
    }
  }

  async remove(id, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      const request = await this.requestModel.findById(id);
      if (!request) {
        const error = new Error('Request not found');
        error.code = 404;
        throw error;
      }

      // Students can only delete their own pending requests
      // Companies and admins can delete any request
      if (userRole === 'student') {
        if (request.userId.toString() !== userId.toString()) {
          throw new Error('Access denied: You can only delete your own requests');
        }
        if (request.status !== 'pending') {
          throw new Error('You can only delete pending requests');
        }
      } else if (userRole === 'company') {
        if (request.companyId.toString() !== userId.toString()) {
          throw new Error('Access denied: You can only delete requests for your company');
        }
      }

      await this.requestModel.delete(id);

      console.log('✅ Request deleted successfully');

      return {
        success: true,
        message: 'Request deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting request:', error);
      if (error.code === 404) {
        const notFoundError = new Error('Request not found');
        notFoundError.code = 404;
        throw notFoundError;
      }
      throw new Error(error.message || 'Failed to delete request');
    }
  }
}

module.exports = RequestsService;
