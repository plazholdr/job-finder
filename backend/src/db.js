const { MongoClient } = require('mongodb');
const logger = require('./logger');

let client;
let db;

async function connectToMongoDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-finder';
    client = new MongoClient(uri);
    
    await client.connect();
    db = client.db();
    
    logger.info('Connected to MongoDB');
    return db;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    throw error;
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongoDB first.');
  }
  return db;
}

async function closeConnection() {
  if (client) {
    await client.close();
    logger.info('MongoDB connection closed');
  }
}

module.exports = {
  connectToMongoDB,
  getDB,
  closeConnection
};
