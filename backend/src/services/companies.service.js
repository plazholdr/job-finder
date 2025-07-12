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

      // Only students and admins can browse companies
      if (userRole !== 'student' && userRole !== 'admin') {
        throw new Error('Access denied: Only students can browse companies');
      }

      const { $limit = 50, $skip = 0, $sort = { 'company.name': 1 }, search, industry, size } = params.query || {};
      
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
              status: { $in: ['Draft', 'Pending', 'Active', 'Closed'] },
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

      // Add dummy companies for demo purposes
      const dummyCompanies = this.getAllDummyCompanies();
      const allCompanies = [...companiesWithJobCounts, ...dummyCompanies];

      // Apply search and filters to dummy companies as well
      const filteredDummyCompanies = dummyCompanies.filter(company => {
        const matchesSearch = !search ||
          company.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
          company.company?.industry?.toLowerCase().includes(search.toLowerCase()) ||
          company.company?.description?.toLowerCase().includes(search.toLowerCase());

        const matchesIndustry = !industry || industry === 'all' ||
          company.company?.industry === industry;

        const matchesSize = !size || size === 'all' ||
          company.company?.size === size;

        return matchesSearch && matchesIndustry && matchesSize;
      });

      const finalCompanies = [...companiesWithJobCounts, ...filteredDummyCompanies];

      return {
        total: total + dummyCompanies.length,
        limit: options.limit,
        skip: options.skip,
        data: finalCompanies,
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

      // Only students and admins can view company details
      if (userRole !== 'student' && userRole !== 'admin' && params.user?._id !== id) {
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

      // Get jobs for this company (all statuses for demo purposes)
      const companyObjectId = typeof company._id === 'string' ? new ObjectId(company._id) : company._id;

      // Debug logging
      logger.info('Fetching jobs for company', {
        companyId: company._id,
        companyObjectId: companyObjectId.toString(),
        companyEmail: company.email
      });

      const activeJobs = await this.jobModel.find({
        companyId: companyObjectId,
        status: { $in: ['Draft', 'Pending', 'Active', 'Closed'] },
        isActive: true
      }, {
        limit: 10,
        sort: { createdAt: -1 }
      });

      logger.info('Found jobs for company', {
        companyId: company._id,
        jobCount: activeJobs.length,
        jobs: activeJobs.map(j => ({ id: j._id, title: j.title, status: j.status }))
      });

      return {
        ...company,
        activeJobs: activeJobs,
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

  getDummyCompany(id) {
    const dummyCompanies = {
      'dummy1': {
        _id: 'dummy1',
        firstName: 'Tech',
        lastName: 'Solutions',
        email: 'contact@techsolutions.my',
        role: 'company',
        company: {
          name: 'Tech Solutions Malaysia Sdn Bhd',
          description: 'Leading technology company specializing in software development, mobile applications, and digital transformation solutions for Malaysian businesses.',
          industry: 'Information Technology',
          size: '100-500',
          founded: '2015',
          headquarters: 'Level 15, Menara TM, Jalan Pantai Baharu, 50672 Kuala Lumpur, Malaysia',
          website: 'https://techsolutions.my',
          logo: '',
          phone: '+60 3-2161 1234',
          registrationNumber: '201501012345 (1234567-A)'
        }
      },
      'dummy2': {
        _id: 'dummy2',
        firstName: 'Digital',
        lastName: 'Innovations',
        email: 'hr@digitalinnovations.my',
        role: 'company',
        company: {
          name: 'Digital Innovations Sdn Bhd',
          description: 'Innovative fintech company revolutionizing digital payments, e-wallet solutions, and banking technology for Southeast Asian markets.',
          industry: 'Financial Technology',
          size: '50-100',
          founded: '2018',
          headquarters: 'Unit 3A-01, Level 3A, Tower 1, Cyberjaya City Centre, 63000 Cyberjaya, Selangor, Malaysia',
          website: 'https://digitalinnovations.my',
          logo: '',
          phone: '+60 3-8313 5678',
          registrationNumber: '201801023456 (2345678-B)'
        }
      },
      'dummy3': {
        _id: 'dummy3',
        firstName: 'Green',
        lastName: 'Energy',
        email: 'careers@greenenergy.my',
        role: 'company',
        company: {
          name: 'Green Energy Solutions Sdn Bhd',
          description: 'Sustainable energy company focused on solar power installations, renewable energy projects, and environmental consulting services across Malaysia.',
          industry: 'Renewable Energy',
          size: '200-500',
          founded: '2012',
          headquarters: 'No. 88, Jalan Tun Dr Awang, 11900 Bayan Lepas, Penang, Malaysia',
          website: 'https://greenenergy.my',
          logo: '',
          phone: '+60 4-644 9012',
          registrationNumber: '201201034567 (3456789-C)'
        }
      },
      'dummy4': {
        _id: 'dummy4',
        firstName: 'Smart',
        lastName: 'Manufacturing',
        email: 'jobs@smartmfg.my',
        role: 'company',
        company: {
          name: 'Smart Manufacturing Solutions Sdn Bhd',
          description: 'Advanced manufacturing company specializing in Industry 4.0 solutions, automation systems, and smart factory implementations.',
          industry: 'Manufacturing & Engineering',
          size: '300-1000',
          founded: '2010',
          headquarters: 'Lot 123, Jalan Perindustrian 15, Kawasan Perindustrian Senai, 81400 Senai, Johor, Malaysia',
          website: 'https://smartmfg.my',
          logo: '',
          phone: '+60 7-599 3456',
          registrationNumber: '201001045678 (4567890-D)'
        }
      },
      'dummy5': {
        _id: 'dummy5',
        firstName: 'Healthcare',
        lastName: 'Innovations',
        email: 'internships@healthtech.my',
        role: 'company',
        company: {
          name: 'Healthcare Innovations Malaysia Sdn Bhd',
          description: 'Healthcare technology company developing telemedicine platforms, health monitoring systems, and digital health solutions for Malaysian healthcare providers.',
          industry: 'Healthcare Technology',
          size: '25-50',
          founded: '2020',
          headquarters: 'Suite 12-01, Level 12, Wisma UOA II, 21 Jalan Pinang, 50450 Kuala Lumpur, Malaysia',
          website: 'https://healthtech.my',
          logo: '',
          phone: '+60 3-2166 7890',
          registrationNumber: '202001056789 (5678901-E)'
        }
      }
    };

    return dummyCompanies[id] || null;
  }

  getAllDummyCompanies() {
    const dummyCompanies = ['dummy1', 'dummy2', 'dummy3', 'dummy4', 'dummy5'];
    return dummyCompanies.map(id => {
      const company = this.getDummyCompany(id);
      const jobCount = this.getDummyJobsForCompany(id, company).length;
      return {
        ...company,
        activeJobsCount: jobCount
      };
    });
  }

  getDummyJobsForCompany(companyId, company) {
    const dummyJobsMap = {
      'dummy1': [
        {
          _id: 'dummyjob1',
          title: 'Software Development Intern',
          description: 'Join our development team to work on cutting-edge web applications using React, Node.js, and MongoDB.',
          location: 'Kuala Lumpur, Malaysia',
          remoteWork: true,
          salaryMin: 1500,
          salaryMax: 2500,
          currency: 'MYR',
          employmentType: 'Internship',
          status: 'Active',
          skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Git'],
          duration: '3-6 months',
          createdAt: new Date('2024-06-15').toISOString()
        },
        {
          _id: 'dummyjob2',
          title: 'Mobile App Development Intern',
          description: 'Develop mobile applications for iOS and Android platforms using React Native and Flutter.',
          location: 'Kuala Lumpur, Malaysia',
          remoteWork: false,
          salaryMin: 1800,
          salaryMax: 2800,
          currency: 'MYR',
          employmentType: 'Internship',
          status: 'Active',
          skills: ['React Native', 'Flutter', 'Dart', 'iOS', 'Android'],
          duration: '4-6 months',
          createdAt: new Date('2024-06-20').toISOString()
        }
      ],
      'dummy2': [
        {
          _id: 'dummyjob3',
          title: 'Fintech Data Analyst Intern',
          description: 'Analyze financial data and create insights for digital payment platforms and e-wallet solutions.',
          location: 'Cyberjaya, Malaysia',
          remoteWork: true,
          salaryMin: 2000,
          salaryMax: 3000,
          currency: 'MYR',
          employmentType: 'Internship',
          status: 'Active',
          skills: ['Python', 'SQL', 'Data Analysis', 'Tableau', 'Excel'],
          duration: '3-4 months',
          createdAt: new Date('2024-06-25').toISOString()
        }
      ],
      'dummy3': [
        {
          _id: 'dummyjob4',
          title: 'Renewable Energy Engineering Intern',
          description: 'Support solar panel installation projects and renewable energy system design.',
          location: 'Penang, Malaysia',
          remoteWork: false,
          salaryMin: 1600,
          salaryMax: 2400,
          currency: 'MYR',
          employmentType: 'Internship',
          status: 'Active',
          skills: ['AutoCAD', 'Solar Energy', 'Project Management', 'Engineering'],
          duration: '6 months',
          createdAt: new Date('2024-06-18').toISOString()
        }
      ],
      'dummy4': [
        {
          _id: 'dummyjob5',
          title: 'Industrial Automation Intern',
          description: 'Work on Industry 4.0 automation systems and smart manufacturing solutions.',
          location: 'Johor, Malaysia',
          remoteWork: false,
          salaryMin: 1700,
          salaryMax: 2600,
          currency: 'MYR',
          employmentType: 'Internship',
          status: 'Active',
          skills: ['PLC Programming', 'SCADA', 'Industrial IoT', 'Automation'],
          duration: '4-6 months',
          createdAt: new Date('2024-06-22').toISOString()
        }
      ],
      'dummy5': [
        {
          _id: 'dummyjob6',
          title: 'Healthcare Technology Intern',
          description: 'Develop telemedicine platforms and health monitoring applications.',
          location: 'Kuala Lumpur, Malaysia',
          remoteWork: true,
          salaryMin: 1800,
          salaryMax: 2700,
          currency: 'MYR',
          employmentType: 'Internship',
          status: 'Active',
          skills: ['React', 'Healthcare IT', 'API Development', 'Database Design'],
          duration: '3-5 months',
          createdAt: new Date('2024-06-28').toISOString()
        }
      ]
    };

    return dummyJobsMap[companyId] || [];
  }
}

module.exports = CompaniesService;
