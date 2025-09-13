const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

class UserModel {
  constructor(db) {
    this.collection = db.collection('users');
    this.createIndexes();
  }

  toObjectId(id) {
    return typeof id === 'string' ? new ObjectId(id) : id;
  }

  async createIndexes() {
    try {
      // Create unique index on email
      await this.collection.createIndex({ email: 1 }, { unique: true });
  // Create unique sparse index on username (allow documents without username)
  await this.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
      // Create index on role for faster queries
      await this.collection.createIndex({ role: 1 });
      // Create index on createdAt for sorting
      await this.collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  async create(userData) {
    const {
  email,
  username,
  password,
  firstName,
  lastName,
  role = 'student',
      // Extended profile data from multi-step registration
      icPassport,
      phone,
      photo,
      education,
      certifications,
      interests,
      workExperience,
      eventExperience,
      requireEmailVerification
    } = userData;

    // Common validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate role
    const validRoles = ['student', 'company', 'admin'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be student, company, or admin');
    }

    // Derive and validate email/username per role rules
    let normalizedEmail = email ? email.trim().toLowerCase() : null;
    const providedUsername = username ? username.trim() : null;
    const usernameLooksLikeEmail = providedUsername ? emailRegex.test(providedUsername) : false;

    if (role === 'company') {
      // Companies shouldn't submit first/last name
      if (firstName || lastName) {
        throw new Error('Company users must not include firstName or lastName');
      }

      if (usernameLooksLikeEmail && !normalizedEmail) {
        // If username is an email and email not provided, use it for both
        normalizedEmail = providedUsername.toLowerCase();
      }

      if (!normalizedEmail) {
        throw new Error('Email is required for company accounts');
      }

      if (!emailRegex.test(normalizedEmail)) {
        throw new Error('Invalid email format');
      }
    } else {
      // Non-company users must provide normal fields
      if (!normalizedEmail || !password || !firstName || !lastName) {
        throw new Error('Missing required fields: email, password, firstName, lastName');
      }

      if (!emailRegex.test(normalizedEmail)) {
        throw new Error('Invalid email format');
      }
    }

    // If no username provided, default to email (for all roles)
    const normalizedUsername = (providedUsername || normalizedEmail || '').toLowerCase();

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user document
    const user = {
      email: normalizedEmail,
      username: normalizedUsername || null,
      password: hashedPassword,
      // Only store first/last for non-company roles
      ...(role !== 'company' ? { firstName, lastName } : {}),
      role,
      isActive: true,
      emailVerified: false,
      profile: {
        avatar: photo || null,
        bio: null,
        phone: phone || null,
        location: null,
        website: null,
        linkedin: null,
        github: null,
      },
      preferences: {
        emailNotifications: true,
        jobAlerts: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Enforce uniqueness (email and username)
    const existingByEmail = await this.collection.findOne({ email: user.email });
    if (existingByEmail) {
      throw new Error('User with this email already exists');
    }
    if (user.username) {
      const existingByUsername = await this.collection.findOne({ username: user.username });
      if (existingByUsername) {
        throw new Error('Username is already taken');
      }
    }

    // Add role-specific fields
    if (role === 'company') {
      user.company = {
        name: null, // will be set during company setup flow
        description: null,
        industry: null,
        size: null,
        founded: null,
        headquarters: null,
        website: null,
        logo: null,
  inputEssentials: false,
        verificationStatus: 'pending', // pending, verified, rejected (legacy string)
        verificationStatusCode: 0, // 0=pending,1=verified,2=rejected
        verificationDocuments: [],
        verificationNotes: null,
        verifiedAt: null,
        verifiedBy: null,
        businessRegistration: null,
        taxId: null,
        contactPerson: {
          name: null,
          title: null,
          email: null,
          phone: null
        },
        // Malaysian company registration specific
        registrationNumber: null,
        contactNumber: null,
        superform: null,
        setupComplete: false,
        approvalStatus: 'pending', // pending, approved, rejected (legacy string)
        approvalStatusCode: 0 // 0=pending,1=approved,2=rejected
      };

      // For companies requiring email verification, don't activate immediately
      if (requireEmailVerification) {
        user.isActive = false;
        user.emailVerified = false;
      }
    } else if (role === 'admin') {
      user.admin = {
        permissions: ['read', 'write'], // read, write, delete, super_admin
        department: null,
        lastLoginAt: null,
        actionsLog: []
      };
    } else if (role === 'student') {
      user.student = {
        education: [],
        experience: [],
        skills: [],
        resume: null,
        portfolio: null,
        expectedSalary: null,
        jobPreferences: {
          jobTypes: [],
          locations: [],
          remote: false,
        },
      };

      // Add intern data structure for internship management
      user.internship = {
        profile: {
          profileInformation: {
            firstName: firstName,
            lastName: lastName,
            email: normalizedEmail,
            phone: phone || null,
            icPassport: icPassport || null,
            location: null,
            bio: null,
            linkedin: null,
            github: null,
            portfolio: null,
            photo: photo || null
          },
          educationBackground: education || [],
          certifications: certifications || [],
          interests: interests || [],
          workExperience: workExperience || [],
          eventExperience: eventExperience || []
        },
        details: {
          duration: {
            startDate: null,
            endDate: null,
            isFlexible: true,
            minimumWeeks: null,
            maximumWeeks: null
          },
          preferredIndustry: [],
          preferredLocations: [],
          salaryRange: {
            min: 0,
            max: 0,
            currency: 'MYR',
            period: 'month',
            isNegotiable: true
          },
          skills: [],
          languages: [],
          availability: {
            hoursPerWeek: 40,
            flexibleSchedule: true,
            preferredStartTime: null,
            preferredEndTime: null,
            availableDays: []
          },
          workPreferences: {
            remote: false,
            hybrid: false,
            onSite: true,
            travelWillingness: 'Local'
          },
          courses: [],
          assignments: []
        },
        applications: [],
        isSetupComplete: false
      };
    }

    const result = await this.collection.insertOne(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, _id: result.insertedId };
  }

  async findByEmail(email) {
    return await this.collection.findOne({ email: email.toLowerCase() });
  }

  async findById(id) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const user = await this.collection.findOne({ _id: objectId });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateEmailVerification(userId, verified = true) {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await this.collection.updateOne(
      { _id: objectId },
      {
        $set: {
          emailVerified: verified,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }

    return await this.findById(userId);
  }

  async createEmailVerificationToken(userId) {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    await this.collection.updateOne(
      { _id: objectId },
      {
        $set: {
          emailVerificationToken: token,
          emailVerificationExpires: expiresAt,
          updatedAt: new Date()
        }
      }
    );

    return token;
  }

  async findByEmailVerificationToken(token) {
    return await this.collection.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
  }

  async createPasswordResetToken(userId) {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    await this.collection.updateOne(
      { _id: objectId },
      {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: expiresAt,
          updatedAt: new Date()
        }
      }
    );

    return token;
  }

  async findByPasswordResetToken(token) {
    return await this.collection.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
  }

  async updatePassword(userId, newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await this.collection.updateOne(
      { _id: objectId },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        },
        // Always clear reset token fields if present to prevent reuse
        $unset: {
          passwordResetToken: 1,
          passwordResetExpires: 1
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }

    return await this.findById(userId);
  }

  async updateById(id, updateData) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;

    // Remove sensitive fields that shouldn't be updated directly
    const { password, email, _id, createdAt, ...safeUpdateData } = updateData;

    safeUpdateData.updatedAt = new Date();

    const result = await this.collection.updateOne(
      { _id: objectId },
      { $set: safeUpdateData }
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }

    return await this.findById(id);
  }

  // Removed duplicate updatePassword method

  async deleteById(id) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  async find(query = {}, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    const users = await this.collection
      .find(query, { projection: { password: 0 } })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return users;
  }

  async count(query = {}) {
    return await this.collection.countDocuments(query);
  }
}

module.exports = UserModel;
