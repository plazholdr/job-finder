const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['intern', 'company', 'admin'],
    required: true,
    default: 'intern'
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String,
    bio: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },
  // For interns
  internProfile: {
    university: String,
    major: String,
    graduationYear: Number,
    gpa: Number,
    skills: [String],
    resume: String,
    portfolio: String,
    linkedIn: String,
    github: String,
    preferences: {
      jobTypes: [String],
      locations: [String],
      industries: [String],
      salaryRange: {
        min: Number,
        max: Number
      }
    }
  },
  // For companies
  companyProfile: {
    companyName: String,
    industry: String,
    companySize: String,
    website: String,
    description: String,
    logo: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
