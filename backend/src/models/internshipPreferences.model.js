const { ObjectId } = require('mongodb');

class InternshipPreferencesModel {
  constructor(db) {
    this.collection = db.collection('internshipPreferences');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create index on userId for faster queries
      await this.collection.createIndex({ userId: 1 }, { unique: true });
      // Create index on createdAt for sorting
      await this.collection.createIndex({ createdAt: -1 });
      // Create index on industries for filtering
      await this.collection.createIndex({ 'preferences.industries': 1 });
      // Create index on locations for filtering
      await this.collection.createIndex({ 'preferences.locations': 1 });
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  async create(preferencesData) {
    const { userId, preferences } = preferencesData;

    // Validate required fields
    if (!userId) {
      throw new Error('Missing required field: userId');
    }

    if (!preferences) {
      throw new Error('Missing required field: preferences');
    }

    // Validate userId format
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

    // Check if preferences already exist for this user
    const existingPreferences = await this.collection.findOne({ userId: userObjectId });
    if (existingPreferences) {
      throw new Error('Internship preferences already exist for this user. Use update instead.');
    }

    // Create preferences document
    const preferencesDoc = {
      userId: userObjectId,
      preferences: {
        // Industry & Role preferences
        industries: preferences.industries || [],
        roles: preferences.roles || [],
        
        // Location & Duration preferences
        locations: preferences.locations || [],
        remoteWork: preferences.remoteWork || false,
        duration: {
          minimum: preferences.duration?.minimum || null,
          maximum: preferences.duration?.maximum || null,
          preferred: preferences.duration?.preferred || null,
          flexible: preferences.duration?.flexible || false
        },
        
        // Salary & Availability preferences
        salary: {
          minimum: preferences.salary?.minimum || null,
          maximum: preferences.salary?.maximum || null,
          currency: preferences.salary?.currency || 'USD',
          negotiable: preferences.salary?.negotiable || true
        },
        availability: {
          startDate: preferences.availability?.startDate || null,
          endDate: preferences.availability?.endDate || null,
          immediateStart: preferences.availability?.immediateStart || false,
          partTime: preferences.availability?.partTime || false,
          fullTime: preferences.availability?.fullTime || true
        },
        
        // Skills preferences
        skills: {
          technical: preferences.skills?.technical || [],
          soft: preferences.skills?.soft || [],
          languages: preferences.skills?.languages || [],
          certifications: preferences.skills?.certifications || []
        },
        
        // Additional preferences
        companySize: preferences.companySize || [],
        workEnvironment: preferences.workEnvironment || [],
        benefits: preferences.benefits || [],
        notes: preferences.notes || ''
      },
      status: 'active',
      completionPercentage: this.calculateCompletionPercentage(preferences),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(preferencesDoc);
    return { ...preferencesDoc, _id: result.insertedId };
  }

  async findByUserId(userId) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return await this.collection.findOne({ userId: userObjectId });
  }

  async updateByUserId(userId, updateData) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    // Prepare update data
    const { preferences, ...otherData } = updateData;
    const updateDoc = { ...otherData };
    
    if (preferences) {
      // Merge with existing preferences
      const existingPreferences = await this.findByUserId(userId);
      if (!existingPreferences) {
        throw new Error('Internship preferences not found for this user');
      }
      
      updateDoc.preferences = {
        ...existingPreferences.preferences,
        ...preferences
      };
      
      updateDoc.completionPercentage = this.calculateCompletionPercentage(updateDoc.preferences);
    }
    
    updateDoc.updatedAt = new Date();

    const result = await this.collection.updateOne(
      { userId: userObjectId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      throw new Error('Internship preferences not found for this user');
    }

    return await this.findByUserId(userId);
  }

  async deleteByUserId(userId) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await this.collection.deleteOne({ userId: userObjectId });
    return result.deletedCount > 0;
  }

  async find(query = {}, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    const preferences = await this.collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return preferences;
  }

  async count(query = {}) {
    return await this.collection.countDocuments(query);
  }

  // Helper method to calculate completion percentage
  calculateCompletionPercentage(preferences) {
    const fields = [
      preferences.industries?.length > 0,
      preferences.roles?.length > 0,
      preferences.locations?.length > 0,
      preferences.duration?.preferred !== null,
      preferences.salary?.minimum !== null,
      preferences.availability?.startDate !== null,
      preferences.skills?.technical?.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }
}

module.exports = InternshipPreferencesModel;
