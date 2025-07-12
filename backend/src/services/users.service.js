const { getDB } = require('../db');
const UserModel = require('../models/user.model');
const EmailService = require('./email.service');
const logger = require('../logger');

class UsersService {
  constructor(app) {
    this.app = app;
    this.config = app.get('config');
    this.userModel = new UserModel(getDB());
    this.emailService = new EmailService(this.config);
  }

  async create(data) {
    try {
      const user = await this.userModel.create(data);

      // Send email verification
      try {
        const verificationToken = await this.userModel.createEmailVerificationToken(user._id);
        await this.emailService.sendEmailVerification(user, verificationToken);
        logger.info(`Email verification sent to: ${user.email}`);
      } catch (emailError) {
        logger.error('Failed to send verification email', {
          userId: user._id,
          email: user.email,
          error: emailError.message
        });
        // Don't fail user creation if email fails
      }

      logger.info(`New user created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('User creation failed', { error: error.message, data: { ...data, password: '[REDACTED]' } });
      throw error;
    }
  }

  async find(params = {}) {
    try {
      const { query = {}, $limit = 50, $skip = 0, $sort = { createdAt: -1 } } = params;

      // Remove sensitive query parameters
      const { password, ...safeQuery } = query;

      const options = {
        limit: parseInt($limit),
        skip: parseInt($skip),
        sort: $sort,
      };

      const users = await this.userModel.find(safeQuery, options);
      const total = await this.userModel.count(safeQuery);

      return {
        total,
        limit: options.limit,
        skip: options.skip,
        data: users,
      };
    } catch (error) {
      logger.error('Users find failed', { error: error.message });
      throw error;
    }
  }

  async get(id) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('User get failed', { id, error: error.message });
      throw error;
    }
  }

  async patch(id, data) {
    try {
      const user = await this.userModel.updateById(id, data);
      logger.info(`User updated: ${id}`);
      return user;
    } catch (error) {
      logger.error('User update failed', { id, error: error.message });
      throw error;
    }
  }

  async remove(id) {
    try {
      const success = await this.userModel.deleteById(id);
      if (!success) {
        throw new Error('User not found');
      }
      logger.info(`User deleted: ${id}`);
      return { id, deleted: true };
    } catch (error) {
      logger.error('User deletion failed', { id, error: error.message });
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser(userId) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Get current user failed', { userId, error: error.message });
      throw error;
    }
  }

  // Update current user profile
  async updateCurrentUser(userId, data) {
    try {
      // Prevent updating sensitive fields
      const { role, isActive, emailVerified, ...safeData } = data;

      const user = await this.userModel.updateById(userId, safeData);
      logger.info(`Current user updated: ${userId}`);
      return user;
    } catch (error) {
      logger.error('Current user update failed', { userId, error: error.message });
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user with password
      const user = await this.userModel.findByEmail((await this.userModel.findById(userId)).email);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await this.userModel.validatePassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await this.userModel.updatePassword(userId, newPassword);
      logger.info(`Password changed for user: ${userId}`);

      return { message: 'Password updated successfully' };
    } catch (error) {
      logger.error('Password change failed', { userId, error: error.message });
      throw error;
    }
  }

  // Email verification
  async verifyEmail(token) {
    try {
      const user = await this.userModel.findByEmailVerificationToken(token);
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      await this.userModel.updateEmailVerification(user._id, true);

      // Clear verification token
      await this.userModel.collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            emailVerificationToken: 1,
            emailVerificationExpires: 1
          },
          $set: { updatedAt: new Date() }
        }
      );

      logger.info(`Email verified for user: ${user.email}`);
      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification failed', { token, error: error.message });
      throw error;
    }
  }

  // Resend email verification
  async resendEmailVerification(email) {
    try {
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }

      const verificationToken = await this.userModel.createEmailVerificationToken(user._id);
      await this.emailService.sendEmailVerification(user, verificationToken);

      logger.info(`Email verification resent to: ${user.email}`);
      return { message: 'Verification email sent successfully' };
    } catch (error) {
      logger.error('Resend email verification failed', { email, error: error.message });
      throw error;
    }
  }

  // Password reset request
  async requestPasswordReset(email) {
    try {
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
      }

      const resetToken = await this.userModel.createPasswordResetToken(user._id);
      await this.emailService.sendPasswordReset(user, resetToken);

      logger.info(`Password reset requested for: ${user.email}`);
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    } catch (error) {
      logger.error('Password reset request failed', { email, error: error.message });
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const user = await this.userModel.findByPasswordResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      await this.userModel.updatePassword(user._id, newPassword);

      logger.info(`Password reset completed for user: ${user.email}`);
      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Password reset failed', { token, error: error.message });
      throw error;
    }
  }

  // Search users
  async searchUsers(query, filters = {}, currentUserId = null) {
    try {
      const searchCriteria = {
        isActive: true,
        emailVerified: true,
      };

      // Exclude current user from results
      if (currentUserId) {
        searchCriteria._id = { $ne: new ObjectId(currentUserId) };
      }

      // Apply role filter
      if (filters.role && filters.role !== 'all') {
        searchCriteria.role = filters.role;
      }

      // Apply location filter
      if (filters.location) {
        searchCriteria['profile.location'] = {
          $regex: filters.location,
          $options: 'i'
        };
      }

      // Apply skills filter for students
      if (filters.skills && filters.skills.length > 0) {
        searchCriteria['student.skills'] = {
          $in: filters.skills.map(skill => new RegExp(skill, 'i'))
        };
      }

      // Apply industry filter for companies
      if (filters.industry) {
        searchCriteria['company.industry'] = {
          $regex: filters.industry,
          $options: 'i'
        };
      }

      // Text search across multiple fields
      if (query && query.trim()) {
        const searchRegex = { $regex: query.trim(), $options: 'i' };
        searchCriteria.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { 'profile.bio': searchRegex },
          { 'student.skills': searchRegex },
          { 'company.name': searchRegex },
          { 'company.description': searchRegex },
        ];
      }

      const users = await this.userModel.collection
        .find(searchCriteria)
        .project({
          password: 0,
          emailVerificationToken: 0,
          emailVerificationExpires: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
        })
        .limit(50)
        .sort({ updatedAt: -1 })
        .toArray();

      // Apply privacy filters
      const filteredUsers = users.map(user => this.applyPrivacyFilter(user, currentUserId));

      logger.info(`User search performed`, {
        query,
        filters,
        resultCount: filteredUsers.length
      });

      return filteredUsers;
    } catch (error) {
      logger.error('User search failed', { query, filters, error: error.message });
      throw error;
    }
  }

  // Get user suggestions based on profile similarity
  async getUserSuggestions(userId, limit = 10) {
    try {
      const currentUser = await this.userModel.findById(userId);
      if (!currentUser) {
        throw new Error('User not found');
      }

      const suggestions = [];

      if (currentUser.role === 'student') {
        // Find users with similar skills or interests
        const criteria = {
          _id: { $ne: new ObjectId(userId) },
          isActive: true,
          emailVerified: true,
          $or: []
        };

        // Similar skills
        if (currentUser.student?.skills?.length > 0) {
          criteria.$or.push({
            'student.skills': {
              $in: currentUser.student.skills.map(skill => new RegExp(skill, 'i'))
            }
          });
        }

        // Similar location
        if (currentUser.profile?.location) {
          criteria.$or.push({
            'profile.location': {
              $regex: currentUser.profile.location,
              $options: 'i'
            }
          });
        }

        // Similar internship interests
        if (currentUser.internship?.details?.preferredIndustry?.length > 0) {
          criteria.$or.push({
            'internship.details.preferredIndustry': {
              $in: currentUser.internship.details.preferredIndustry
            }
          });
        }

        if (criteria.$or.length > 0) {
          const users = await this.userModel.collection
            .find(criteria)
            .project({
              password: 0,
              emailVerificationToken: 0,
              emailVerificationExpires: 0,
              passwordResetToken: 0,
              passwordResetExpires: 0,
            })
            .limit(limit)
            .toArray();

          suggestions.push(...users.map(user => this.applyPrivacyFilter(user, userId)));
        }
      }

      logger.info(`User suggestions generated`, {
        userId,
        suggestionCount: suggestions.length
      });

      return suggestions;
    } catch (error) {
      logger.error('User suggestions failed', { userId, error: error.message });
      throw error;
    }
  }

  // Apply privacy filters to user data
  applyPrivacyFilter(user, viewerId = null) {
    const isOwnProfile = viewerId && viewerId.toString() === user._id.toString();
    const privacy = user.privacy || {};

    // If it's the user's own profile, return everything
    if (isOwnProfile) {
      return user;
    }

    // Apply privacy settings
    if (privacy.profileVisibility === 'private') {
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profile: {
          avatar: user.profile?.avatar
        },
        privacy: { profileVisibility: 'private' }
      };
    }

    if (privacy.profileVisibility === 'restricted' && !viewerId) {
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profile: {
          avatar: user.profile?.avatar
        },
        privacy: { profileVisibility: 'restricted' }
      };
    }

    // Filter out sensitive information based on privacy settings
    const filteredUser = { ...user };

    if (!privacy.showEmail) {
      delete filteredUser.email;
    }

    if (!privacy.showPhone && filteredUser.profile) {
      delete filteredUser.profile.phone;
    }

    if (!privacy.showLocation && filteredUser.profile) {
      delete filteredUser.profile.location;
    }

    return filteredUser;
  }
}

module.exports = UsersService;
