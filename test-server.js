/**
 * Simple test script to verify server endpoints
 * Run with: node test-server.js
 * Make sure the server is running on localhost:3000 first
 */

const http = require('http');

const SERVER_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${SERVER_URL}${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing /health endpoint...');
  try {
    const response = await makeRequest('/health');
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`Response: ${response.body}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testTrackingPixel() {
  console.log('\n🔍 Testing /track endpoint...');
  try {
    const response = await makeRequest('/track?email=test@company.com&user=Test%20User&newsletter=test-2025');
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Cache-Control: ${response.headers['cache-control']}`);
    console.log(`Body length: ${response.body.length} bytes`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testStats() {
  console.log('\n🔍 Testing /stats endpoint...');
  try {
    const response = await makeRequest('/stats');
    console.log(`✅ Status: ${response.statusCode}`);
    const data = JSON.parse(response.body);
    console.log(`Total Opens: ${data.totalOpens}`);
    console.log(`Unique Users: ${data.uniqueUsers}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testNewsletterStats() {
  console.log('\n🔍 Testing /stats/test-2025 endpoint...');
  try {
    const response = await makeRequest('/stats/test-2025');
    console.log(`✅ Status: ${response.statusCode}`);
    const data = JSON.parse(response.body);
    console.log(`Newsletter: ${data.newsletter}`);
    console.log(`Total Opens: ${data.totalOpens}`);
    console.log(`Unique Users: ${data.uniqueUsers}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function test404() {
  console.log('\n🔍 Testing 404 handler...');
  try {
    const response = await makeRequest('/nonexistent');
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`Response: ${response.body}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Email Tracking Server Tests');
  console.log('========================================');
  console.log(`Server URL: ${SERVER_URL}`);
  console.log('Make sure the server is running first!');
  
  await testHealthCheck();
  await testTrackingPixel();
  await testStats();
  await testNewsletterStats();
  await test404();
  
  console.log('\n========================================');
  console.log('✅ All tests completed!');
  console.log('\nNext steps:');
  console.log('1. Check the dashboard: http://localhost:3000/dashboard');
  console.log('2. View tracking data in email-opens.json');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  console.log('\nMake sure the server is running with: npm start');
  process.exit(1);
});

