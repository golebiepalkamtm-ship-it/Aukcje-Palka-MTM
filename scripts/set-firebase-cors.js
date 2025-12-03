#!/usr/bin/env node
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'm-t-m-62972.firebasestorage.app'
});

const bucket = admin.storage().bucket();

// CORS configuration
const corsConfig = [
  {
    origin: ['*'],
    method: ['GET'],
    maxAgeSeconds: 3600
  }
];

async function setCors() {
  try {
    console.log('Setting CORS configuration for Firebase Storage...');
    await bucket.setCorsConfiguration(corsConfig);
    console.log('✅ CORS configuration set successfully!');
    console.log('Images should now load in Chrome.');
  } catch (error) {
    console.error('❌ Error setting CORS:', error.message);
  }
}

setCors();