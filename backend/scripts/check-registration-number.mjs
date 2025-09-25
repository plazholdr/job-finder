#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkRegistrationNumber() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    
    // Get all companies and their registration numbers
    console.log('\n=== All Companies and Registration Numbers ===');
    const companies = await db.collection('companies').find().toArray();
    
    console.log(`Total companies: ${companies.length}\n`);
    
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   Registration Number: "${company.registrationNumber || 'NULL'}"`);
      console.log(`   Owner ID: ${company.ownerUserId}`);
      console.log(`   Verified Status: ${company.verifiedStatus}`);
      console.log('');
    });

    // Check for specific registration numbers that might be causing issues
    const testNumbers = [
      'asdasasdasdasd', // From your screenshot
      'asdaasdasdasd',
      'asdasdasdasd',
      '', // Empty string
      null, // Null value
      undefined // Undefined
    ];

    console.log('\n=== Testing Specific Registration Numbers ===');
    for (const testNumber of testNumbers) {
      const query = testNumber === null ? { registrationNumber: null } : 
                   testNumber === undefined ? { registrationNumber: { $exists: false } } :
                   { registrationNumber: testNumber };
      
      const matches = await db.collection('companies').find(query).toArray();
      console.log(`"${testNumber}": ${matches.length} matches`);
      if (matches.length > 0) {
        matches.forEach(match => {
          console.log(`  - ${match.name} (ID: ${match._id})`);
        });
      }
    }

    // Check for any companies with empty or null registration numbers
    console.log('\n=== Companies with Empty/Null Registration Numbers ===');
    const emptyRegNumbers = await db.collection('companies').find({
      $or: [
        { registrationNumber: null },
        { registrationNumber: '' },
        { registrationNumber: { $exists: false } }
      ]
    }).toArray();

    console.log(`Found ${emptyRegNumbers.length} companies with empty/null registration numbers:`);
    emptyRegNumbers.forEach(company => {
      console.log(`  - ${company.name} (reg: "${company.registrationNumber}")`);
    });

    // Test the exact query that the frontend uses
    console.log('\n=== Testing Frontend Query ===');
    const testRegNumber = 'asdasasdasdasd'; // From your screenshot
    const frontendQuery = { registrationNumber: testRegNumber };
    const frontendResult = await db.collection('companies').find(frontendQuery).limit(1).toArray();
    
    console.log(`Frontend query for "${testRegNumber}": ${frontendResult.length} results`);
    if (frontendResult.length > 0) {
      console.log('Found match:', JSON.stringify(frontendResult[0], null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkRegistrationNumber();
