const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const UserModel = require('../models/user.model');
const JobModel = require('../models/job.model');
const logger = require('../logger');

class CompaniesService {
  constructor(app) {
    this.app = app;
    this.userModel = new UserModel(getDB());
    this.jobModel = new JobModel(getDB());
  }

  async find(params = {}) {
    try {
      const userRole = params.user?.role;

      // Only students and admins can browse companies (unauthenticated users can also browse)
      if (userRole && userRole !== 'student' && userRole !== 'admin') {
        throw new Error('Access denied: Only students can browse companies');
      }

      const {
        $limit = 50,
        $skip = 0,
        $sort = { 'company.name': 1 },
        search,
        industry,
        size,
        location,
        salaryMin,
        salaryMax
      } = params.query || {};

      let query = {
        role: 'company'
      };

      // Add search filter
      if (search) {
        query.$or = [
          { 'company.name': { $regex: search, $options: 'i' } },
          { 'company.industry': { $regex: search, $options: 'i' } },
          { 'company.description': { $regex: search, $options: 'i' } },
          { 'firstName': { $regex: search, $options: 'i' } },
          { 'lastName': { $regex: search, $options: 'i' } },
          { 'email': { $regex: search, $options: 'i' } }
        ];
      }

      // Add industry filter
      if (industry && industry !== 'all') {
        query['company.industry'] = industry;
      }

      // Add size filter
      if (size && size !== 'all') {
        query['company.size'] = size;
      }

      // Add location filter
      if (location && location !== 'all') {
        query.$or = query.$or || [];
        query.$or.push(
          { 'company.headquarters': { $regex: location, $options: 'i' } },
          { 'profile.location': { $regex: location, $options: 'i' } }
        );
      }

      // Add salary range filter (this would typically be applied to jobs, but we can filter companies that have jobs in this range)
      if (salaryMin || salaryMax) {
        // Note: This is a simplified implementation. In a real scenario, you'd join with jobs collection
        // For now, we'll just log this and implement basic filtering
        logger.info('Salary filtering requested', { salaryMin, salaryMax });
      }

      const options = {
        limit: parseInt($limit),
        skip: parseInt($skip),
        sort: $sort,
        projection: {
          password: 0, // Exclude password
          resetPasswordToken: 0,
          resetPasswordExpires: 0
        }
      };

      const companies = await this.userModel.find(query, options);
      const total = await this.userModel.count(query);

      // Get active job counts for each company
      const companiesWithJobCounts = await Promise.all(
        companies.map(async (company) => {
          try {
            const companyObjectId = typeof company._id === 'string' ? new ObjectId(company._id) : company._id;
            const activeJobsCount = await this.jobModel.count({
              companyId: companyObjectId,
              status: 'Active',
              isActive: true
            });
            return {
              ...company,
              activeJobsCount
            };
          } catch (error) {
            logger.warn('Failed to get job count for company', { 
              companyId: company._id, 
              error: error.message 
            });
            return {
              ...company,
              activeJobsCount: 0
            };
          }
        })
      );

      // Mix with dummy companies for demo purposes
      const dummyCompanies = this.getDummyCompanies();
      const allCompanies = [...companiesWithJobCounts, ...dummyCompanies];

      // Apply pagination to the combined results
      const paginatedCompanies = allCompanies.slice(parseInt($skip), parseInt($skip) + parseInt($limit));

      return {
        total: allCompanies.length,
        limit: parseInt($limit),
        skip: parseInt($skip),
        data: paginatedCompanies,
      };
    } catch (error) {
      logger.error('Companies find failed', { 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  async get(id, params) {
    try {
      const userRole = params.user?.role;

      // Only students and admins can view company details (unauthenticated users can also view)
      if (userRole && userRole !== 'student' && userRole !== 'admin' && params.user?._id !== id) {
        throw new Error('Access denied');
      }

      // Handle dummy companies
      if (id.startsWith('dummy')) {
        const dummyCompany = this.getDummyCompany(id);
        if (!dummyCompany) {
          const error = new Error('Company not found');
          error.code = 404;
          throw error;
        }

        const dummyJobs = this.getDummyJobsForCompany(id, dummyCompany);
        return {
          ...dummyCompany,
          activeJobs: dummyJobs,
          activeJobsCount: dummyJobs.length
        };
      }

      // Handle real companies from database
      const company = await this.userModel.findById(id, {
        projection: {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0
        }
      });

      if (!company) {
        const error = new Error('Company not found');
        error.code = 404;
        throw error;
      }

      if (company.role !== 'company') {
        const error = new Error('User is not a company');
        error.code = 404;
        throw error;
      }

      // Get jobs for this company
      const companyObjectId = typeof company._id === 'string' ? new ObjectId(company._id) : company._id;

      const activeJobs = await this.jobModel.find({
        companyId: companyObjectId,
        status: { $in: ['Draft', 'Pending', 'Active', 'Closed'] },
        isActive: true
      }, {
        limit: 10,
        sort: { createdAt: -1 }
      });

      return {
        ...company,
        activeJobs,
        activeJobsCount: activeJobs.length
      };
    } catch (error) {
      logger.error('Company get failed', { 
        id, 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  getDummyCompanies() {
    return [
      {
        _id: 'dummy1',
        firstName: 'Tech',
        lastName: 'Solutions',
        email: 'contact@techsolutions.my',
        role: 'company',
        company: {
          name: 'Tech Solutions Malaysia Sdn Bhd',
          description: 'Leading technology company specializing in software development, mobile applications, and digital transformation solutions.',
          industry: 'Information Technology',
          size: '100-500',
          founded: '2015',
          headquarters: 'Kuala Lumpur, Malaysia',
          website: 'https://techsolutions.my',
          logo: '',
          phone: '+60 3-2161 1234'
        },
        activeJobsCount: 3
      },
      {
        _id: 'dummy2',
        firstName: 'Green',
        lastName: 'Energy',
        email: 'careers@greenenergy.my',
        role: 'company',
        company: {
          name: 'Green Energy Inc',
          description: 'Renewable energy company focused on sustainable solutions and environmental innovation.',
          industry: 'Energy',
          size: '50-100',
          founded: '2018',
          headquarters: 'Penang, Malaysia',
          website: 'https://greenenergy.my',
          logo: '',
          phone: '+60 4-2261 5678'
        },
        activeJobsCount: 2
      }
    ];
  }

  getDummyCompany(id) {
    const dummyCompanies = this.getDummyCompanies();
    return dummyCompanies.find(company => company._id === id) || null;
  }

  getDummyJobsForCompany(companyId, company) {
    // Return some dummy jobs for the company
    return [
      {
        _id: `${companyId}-job1`,
        title: 'Software Development Intern',
        description: 'Join our development team to work on exciting projects.',
        status: 'Active',
        createdAt: new Date(),
        companyName: company.company.name
      }
    ];
  }
}

module.exports = CompaniesService;
