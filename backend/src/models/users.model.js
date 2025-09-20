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
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'company', 'admin'],
    required: true,
    default: 'student'
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String, // photo
    bio: String,
    icPassportNumber: String, // national ID / IC / passport
    location: {
      city: String,
      state: String,
      country: String
    }
  },
  // For students/interns
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

    // Education background (multiple)
    educations: [
      {
        level: { type: String }, // diploma/degree/etc
        institutionName: { type: String },
        qualification: { type: String }, // programme
        startDate: { type: Date },
        endDate: { type: Date },
        fieldOfStudy: { type: String }
      }
    ],

    // Certifications (multiple)
    certifications: [
      {
        title: { type: String },
        issuer: { type: String },
        acquiredDate: { type: Date },
        description: { type: String }
      }
    ],

    // Interests (multiple)
    interests: [
      {
        title: { type: String },
        description: { type: String },
        socialLinks: [{ type: String }],
        thumbnailUrl: { type: String }
      }
    ],

    // Previous work experience (multiple)
    workExperiences: [
      {
        companyName: { type: String },
        industry: { type: String },
        jobTitle: { type: String },
        employmentType: { type: String }, // part-time/full-time
        startDate: { type: Date },
        endDate: { type: Date },
        jobDescription: { type: String }
      }
    ],

    // Previous event experience (multiple)
    eventExperiences: [
      {
        eventName: { type: String },
        description: { type: String },
        position: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        location: { type: String },
        socialLinks: [{ type: String }]
      }
    ],

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
  emailVerificationExpires: Date,
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
