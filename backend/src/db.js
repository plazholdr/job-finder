const { MongoClient } = require('mongodb');
const logger = require('./logger');
const config = require('./config');

let client;
let db;

async function connectToMongoDB() {
  try {
    const { uri, options } = config.db.mongodb;
    client = new MongoClient(uri, options);

    await client.connect();
    db = client.db();

    logger.info(`Connected to MongoDB (${config.app.env})`);
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

function getClient() {
  if (!client) {
    throw new Error('Database client not initialized. Call connectToMongoDB first.');
  }
  return client;
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
  getClient,
  closeConnection
};
