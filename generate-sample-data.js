/**
 * Generate sample email tracking data for testing historical analytics
 * This creates data spanning multiple months to test the history feature
 * 
 * Run with: node generate-sample-data.js
 */

const fs = require('fs');
const path = require('path');

const TRACKING_FILE = path.join(__dirname, 'email-opens.json');

// Sample data configuration
const MONTHS_TO_GENERATE = 6; // Generate 6 months of data
const USERS = [
  { email: 'john.doe@company.com', name: 'John Doe' },
  { email: 'jane.smith@company.com', name: 'Jane Smith' },
  { email: 'bob.johnson@company.com', name: 'Bob Johnson' },
  { email: 'alice.williams@company.com', name: 'Alice Williams' },
  { email: 'charlie.brown@company.com', name: 'Charlie Brown' },
  { email: 'diana.davis@company.com', name: 'Diana Davis' },
  { email: 'evan.miller@company.com', name: 'Evan Miller' },
  { email: 'fiona.wilson@company.com', name: 'Fiona Wilson' },
  { email: 'george.moore@company.com', name: 'George Moore' },
  { email: 'helen.taylor@company.com', name: 'Helen Taylor' }
];

const NEWSLETTERS = [
  'monthly-update',
  'weekly-digest',
  'special-announcement',
  'product-news'
];

const IP_ADDRESSES = [
  '192.168.1.1',
  '192.168.1.2',
  '10.0.0.1',
  '10.0.0.2',
  '172.16.0.1'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36'
];

// Generate random tracking records
function generateTrackingData() {
  const records = [];
  const today = new Date();
  
  // Generate data for each month
  for (let monthOffset = MONTHS_TO_GENERATE - 1; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const monthStr = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toLowerCase().replace(' ', '-');
    
    // Base number of opens per month (with growth trend)
    const baseOpens = 30 + (MONTHS_TO_GENERATE - monthOffset) * 10;
    const variation = Math.floor(Math.random() * 20) - 10; // +/- 10
    const monthlyOpens = baseOpens + variation;
    
    console.log(`📅 Generating ${monthlyOpens} opens for ${monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}...`);
    
    // Generate opens for this month
    for (let i = 0; i < monthlyOpens; i++) {
      // Random user
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      
      // Random newsletter
      const newsletter = NEWSLETTERS[Math.floor(Math.random() * NEWSLETTERS.length)];
      
      // Random day in the month
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      
      // Random time
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      
      const timestamp = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        day,
        hour,
        minute,
        second
      ).toISOString();
      
      // Random IP and user agent
      const ip = IP_ADDRESSES[Math.floor(Math.random() * IP_ADDRESSES.length)];
      const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      
      records.push({
        email: user.email,
        user: user.name,
        newsletter: `${newsletter}-${monthStr}`,
        timestamp: timestamp,
        ip: ip,
        userAgent: userAgent
      });
    }
  }
  
  // Sort by timestamp
  records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return records;
}

// Main execution
console.log('🚀 Generating Sample Email Tracking Data');
console.log('========================================');
console.log(`📊 Configuration:`);
console.log(`   - Months: ${MONTHS_TO_GENERATE}`);
console.log(`   - Users: ${USERS.length}`);
console.log(`   - Newsletters: ${NEWSLETTERS.length}`);
console.log('');

// Check if file already exists
if (fs.existsSync(TRACKING_FILE)) {
  console.log('⚠️  Warning: email-opens.json already exists!');
  console.log('   Existing data will be REPLACED with sample data.');
  console.log('');
}

// Generate data
const sampleData = generateTrackingData();

// Write to file
try {
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(sampleData, null, 2));
  console.log('');
  console.log('========================================');
  console.log('✅ Sample data generated successfully!');
  console.log('');
  console.log(`📈 Statistics:`);
  console.log(`   - Total Records: ${sampleData.length}`);
  console.log(`   - Date Range: ${new Date(sampleData[0].timestamp).toLocaleDateString()} - ${new Date(sampleData[sampleData.length - 1].timestamp).toLocaleDateString()}`);
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('   1. Start the server: npm start');
  console.log('   2. View dashboard: http://localhost:3000/dashboard');
  console.log('   3. View history: http://localhost:3000/history');
  console.log('   4. View stats: http://localhost:3000/stats');
  console.log('');
  console.log('💡 Tip: To reset, visit http://localhost:3000/reset');
} catch (error) {
  console.error('');
  console.error('❌ Error writing sample data:', error.message);
  process.exit(1);
}

