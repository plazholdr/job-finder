const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

class UserModel {
  constructor(db) {
    this.collection = db.collection('users');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create unique index on email
      await this.collection.createIndex({ email: 1 }, { unique: true });
      // Create index on role for faster queries
      await this.collection.createIndex({ role: 1 });
      // Create index on createdAt for sorting
      await this.collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  async create(userData) {
    const { email, password, firstName, lastName, role = 'student' } = userData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new Error('Missing required fields: email, password, firstName, lastName');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate role
    const validRoles = ['student', 'company', 'admin'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be student, company, or admin');
    }

    // Check if user already exists
    const existingUser = await this.collection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user document
    const user = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
      emailVerified: false,
      profile: {
        avatar: null,
        bio: null,
        phone: null,
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

    // Add role-specific fields
    if (role === 'company') {
      user.company = {
        name: null,
        description: null,
        industry: null,
        size: null,
        founded: null,
        headquarters: null,
        website: null,
        logo: null,
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

  async updatePassword(id, newPassword) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const result = await this.collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }

    return true;
  }

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
