const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TRACKING_FILE = path.join(__dirname, 'email-opens.json');

// Initialize tracking file if it doesn't exist
const initializeTrackingFile = () => {
  if (!fs.existsSync(TRACKING_FILE)) {
    console.log('📁 Creating email-opens.json file...');
    fs.writeFileSync(TRACKING_FILE, JSON.stringify([], null, 2));
    console.log('✅ Tracking file created successfully');
  }
};

// Read tracking data from file
const readTrackingData = () => {
  try {
    const data = fs.readFileSync(TRACKING_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading tracking file:', error.message);
    return [];
  }
};

// Write tracking data to file
const writeTrackingData = (data) => {
  try {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing to tracking file:', error.message);
    return false;
  }
};

// Generate 1x1 transparent PNG pixel (base64 encoded)
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

// Middleware to parse JSON
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Email Tracking Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          h1 { color: #2c3e50; }
          .endpoint {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #3498db;
          }
          code {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          .link {
            display: inline-block;
            margin: 5px 0;
            color: #3498db;
            text-decoration: none;
          }
          .link:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>📧 Email Tracking Server</h1>
        <p>Internal company newsletter tracking system is running successfully!</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
          <strong>🎯 Tracking Pixel:</strong><br>
          <code>GET /track?email=user@company.com&user=John&newsletter=oct-2025</code><br>
          <small>Returns a 1x1 transparent PNG pixel and logs the open event</small>
        </div>
        
        <div class="endpoint">
          <strong>📊 Overall Statistics:</strong><br>
          <a href="/stats" class="link">GET /stats</a><br>
          <small>Returns total opens, unique users, and all tracking data</small>
        </div>
        
        <div class="endpoint">
          <strong>📈 Newsletter Statistics:</strong><br>
          <code>GET /stats/:newsletter</code><br>
          <small>Example: <a href="/stats/oct-2025" class="link">/stats/oct-2025</a></small>
        </div>
        
        <div class="endpoint">
          <strong>📋 Dashboard:</strong><br>
          <a href="/dashboard" class="link">GET /dashboard</a><br>
          <small>Visual dashboard with tracking data and statistics</small>
        </div>
        
        <div class="endpoint">
          <strong>📊 Historical Analytics:</strong><br>
          <a href="/history" class="link">GET /history</a> | <a href="/stats/history" class="link">GET /stats/history</a><br>
          <small>Monthly trends and comparison data</small>
        </div>
        
        <div class="endpoint">
          <strong>🗑️ Reset Data (Development):</strong><br>
          <a href="/reset" class="link">GET /reset</a><br>
          <small>Clear all tracking data - useful for development/testing</small>
        </div>
        
        <h2>Example HTML Tracking Pixel:</h2>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;"><code>&lt;img src="${req.protocol}://${req.get('host')}/track?email=user@company.com&user=John&newsletter=oct-2025" width="1" height="1" style="display:none;" alt="" /&gt;</code></pre>
      </body>
    </html>
  `);
});

// 1. TRACKING ENDPOINT - Returns 1x1 transparent PNG pixel
app.get('/track', (req, res) => {
  const { email, user, newsletter } = req.query;
  
  // Get client information
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const timestamp = new Date().toISOString();
  
  // Log the tracking event
  console.log('📧 Email opened:', {
    email,
    user,
    newsletter,
    timestamp,
    ip: ip.split(',')[0].trim() // Get first IP if multiple
  });
  
  // Create tracking record
  const trackingRecord = {
    email: email || 'unknown',
    user: user || 'unknown',
    newsletter: newsletter || 'unknown',
    timestamp,
    ip: ip.split(',')[0].trim(),
    userAgent
  };
  
  // Save to file
  const trackingData = readTrackingData();
  trackingData.push(trackingRecord);
  writeTrackingData(trackingData);
  
  // Set headers to prevent caching
  res.set({
    'Content-Type': 'image/png',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  // Send transparent pixel
  res.send(TRANSPARENT_PIXEL);
});

// 2. STATS ENDPOINT - Return overall statistics
app.get('/stats', (req, res) => {
  const trackingData = readTrackingData();
  
  // Calculate unique users
  const uniqueEmails = new Set(trackingData.map(record => record.email));
  
  const stats = {
    totalOpens: trackingData.length,
    uniqueUsers: uniqueEmails.size,
    opens: trackingData
  };
  
  console.log('📊 Stats requested - Total Opens:', stats.totalOpens, 'Unique Users:', stats.uniqueUsers);
  
  res.json(stats);
});

// 3. NEWSLETTER STATS ENDPOINT - Filter by newsletter
app.get('/stats/:newsletter', (req, res) => {
  const { newsletter } = req.params;
  const trackingData = readTrackingData();
  
  // Filter by newsletter
  const newsletterData = trackingData.filter(record => record.newsletter === newsletter);
  
  if (newsletterData.length === 0) {
    console.log('⚠️  No data found for newsletter:', newsletter);
    return res.json({
      newsletter,
      totalOpens: 0,
      uniqueUsers: 0,
      opensByUser: {}
    });
  }
  
  // Calculate statistics by user
  const opensByUser = {};
  
  newsletterData.forEach(record => {
    const email = record.email;
    
    if (!opensByUser[email]) {
      opensByUser[email] = {
        count: 0,
        firstOpen: record.timestamp,
        lastOpen: record.timestamp,
        user: record.user
      };
    }
    
    opensByUser[email].count++;
    
    // Update first and last open times
    if (new Date(record.timestamp) < new Date(opensByUser[email].firstOpen)) {
      opensByUser[email].firstOpen = record.timestamp;
    }
    
    if (new Date(record.timestamp) > new Date(opensByUser[email].lastOpen)) {
      opensByUser[email].lastOpen = record.timestamp;
    }
  });
  
  // Calculate unique users
  const uniqueUsers = Object.keys(opensByUser).length;
  
  const stats = {
    newsletter,
    totalOpens: newsletterData.length,
    uniqueUsers,
    opensByUser
  };
  
  console.log('📈 Newsletter stats requested:', newsletter, '- Opens:', stats.totalOpens, 'Unique:', stats.uniqueUsers);
  
  res.json(stats);
});

// HISTORY STATS ENDPOINT - Monthly aggregated statistics
app.get('/stats/history', (req, res) => {
  const trackingData = readTrackingData();
  
  if (trackingData.length === 0) {
    return res.json({
      totalMonths: 0,
      monthlyStats: [],
      overallTrend: 'No data available'
    });
  }
  
  // Group data by year-month
  const monthlyData = {};
  
  trackingData.forEach(record => {
    const date = new Date(record.timestamp);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    
    if (!monthlyData[yearMonth]) {
      monthlyData[yearMonth] = {
        month: monthName,
        yearMonth: yearMonth,
        opens: [],
        emails: new Set(),
        newsletters: new Set()
      };
    }
    
    monthlyData[yearMonth].opens.push(record);
    monthlyData[yearMonth].emails.add(record.email);
    monthlyData[yearMonth].newsletters.add(record.newsletter);
  });
  
  // Convert to array and calculate stats
  const monthlyStats = Object.keys(monthlyData)
    .sort()
    .map(yearMonth => {
      const data = monthlyData[yearMonth];
      return {
        month: data.month,
        yearMonth: yearMonth,
        totalOpens: data.opens.length,
        uniqueUsers: data.emails.size,
        uniqueNewsletters: data.newsletters.size,
        avgOpensPerUser: (data.opens.length / data.emails.size).toFixed(2),
        newsletters: Array.from(data.newsletters)
      };
    });
  
  // Calculate trend
  let trend = 'Stable';
  if (monthlyStats.length >= 2) {
    const lastMonth = monthlyStats[monthlyStats.length - 1].totalOpens;
    const prevMonth = monthlyStats[monthlyStats.length - 2].totalOpens;
    if (lastMonth > prevMonth) trend = 'Growing';
    else if (lastMonth < prevMonth) trend = 'Declining';
  }
  
  console.log('📊 Historical stats requested - Months:', monthlyStats.length, 'Trend:', trend);
  
  res.json({
    totalMonths: monthlyStats.length,
    monthlyStats: monthlyStats,
    overallTrend: trend,
    firstRecord: trackingData[0].timestamp,
    lastRecord: trackingData[trackingData.length - 1].timestamp
  });
});

// HISTORY DASHBOARD - Visual monthly comparison
app.get('/history', (req, res) => {
  const trackingData = readTrackingData();
  
  if (trackingData.length === 0) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Historical Analytics</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 { color: #2c3e50; }
          p { color: #666; margin: 20px 0; }
          a {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
          }
          a:hover { background: #5568d3; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 No Historical Data</h1>
          <p>Start tracking emails to see monthly trends and comparisons!</p>
          <a href="/dashboard">Go to Dashboard</a>
        </div>
      </body>
      </html>
    `);
  }
  
  // Group data by month
  const monthlyData = {};
  
  trackingData.forEach(record => {
    const date = new Date(record.timestamp);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    
    if (!monthlyData[yearMonth]) {
      monthlyData[yearMonth] = {
        month: monthName,
        yearMonth: yearMonth,
        opens: [],
        emails: new Set(),
        newsletters: new Set(),
        dailyOpens: {}
      };
    }
    
    monthlyData[yearMonth].opens.push(record);
    monthlyData[yearMonth].emails.add(record.email);
    monthlyData[yearMonth].newsletters.add(record.newsletter);
    
    // Track daily opens
    const day = date.getDate();
    monthlyData[yearMonth].dailyOpens[day] = (monthlyData[yearMonth].dailyOpens[day] || 0) + 1;
  });
  
  // Convert to sorted array
  const monthlyStats = Object.keys(monthlyData)
    .sort()
    .map(yearMonth => {
      const data = monthlyData[yearMonth];
      return {
        month: data.month,
        yearMonth: yearMonth,
        totalOpens: data.opens.length,
        uniqueUsers: data.emails.size,
        uniqueNewsletters: data.newsletters.size,
        avgOpensPerUser: (data.opens.length / data.emails.size).toFixed(2),
        newsletters: Array.from(data.newsletters),
        peakDay: Object.keys(data.dailyOpens).reduce((a, b) => 
          data.dailyOpens[a] > data.dailyOpens[b] ? a : b, 1
        )
      };
    });
  
  // Generate chart data for visualization
  const chartLabels = monthlyStats.map(s => s.month).join('","');
  const chartOpens = monthlyStats.map(s => s.totalOpens).join(',');
  const chartUsers = monthlyStats.map(s => s.uniqueUsers).join(',');
  
  // Generate table rows
  const tableRows = monthlyStats.reverse().map((stat, index) => {
    // Calculate growth indicator
    let growthIndicator = '━';
    let growthClass = 'neutral';
    if (index < monthlyStats.length - 1) {
      const current = stat.totalOpens;
      const previous = monthlyStats[index + 1].totalOpens;
      if (current > previous) {
        growthIndicator = `↑ ${((current - previous) / previous * 100).toFixed(1)}%`;
        growthClass = 'positive';
      } else if (current < previous) {
        growthIndicator = `↓ ${((previous - current) / previous * 100).toFixed(1)}%`;
        growthClass = 'negative';
      }
    }
    
    return `
      <tr>
        <td><strong>${stat.month}</strong></td>
        <td>${stat.totalOpens}</td>
        <td>${stat.uniqueUsers}</td>
        <td>${stat.uniqueNewsletters}</td>
        <td>${stat.avgOpensPerUser}</td>
        <td><span class="growth ${growthClass}">${growthIndicator}</span></td>
      </tr>
    `;
  }).join('');
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Historical Analytics - Email Tracking</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          color: #333;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          color: white;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .header p {
          font-size: 1.1em;
          opacity: 0.95;
        }
        
        .nav-links {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .nav-links a {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          color: white;
          padding: 10px 20px;
          margin: 5px;
          border-radius: 5px;
          text-decoration: none;
          transition: background 0.3s;
        }
        
        .nav-links a:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .summary-card .value {
          font-size: 2.5em;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 5px;
        }
        
        .summary-card .label {
          color: #666;
          font-size: 0.9em;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .chart-container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .chart-container h2 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        
        .simple-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 250px;
          border-left: 2px solid #ddd;
          border-bottom: 2px solid #ddd;
          padding: 20px;
          gap: 10px;
        }
        
        .bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .bar {
          width: 100%;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 5px 5px 0 0;
          position: relative;
          transition: transform 0.3s;
          min-height: 20px;
        }
        
        .bar:hover {
          transform: translateY(-5px);
        }
        
        .bar-label {
          font-size: 0.8em;
          color: #666;
          text-align: center;
          writing-mode: horizontal-tb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .bar-value {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-weight: bold;
          color: #2c3e50;
          font-size: 0.9em;
        }
        
        .table-container {
          background: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow-x: auto;
        }
        
        .table-container h2 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        thead {
          background: #f8f9fa;
        }
        
        th {
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #2c3e50;
          border-bottom: 2px solid #dee2e6;
        }
        
        td {
          padding: 12px 15px;
          border-bottom: 1px solid #e9ecef;
        }
        
        tbody tr:hover {
          background: #f8f9fa;
        }
        
        .growth {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.9em;
        }
        
        .growth.positive {
          background: #d4edda;
          color: #155724;
        }
        
        .growth.negative {
          background: #f8d7da;
          color: #721c24;
        }
        
        .growth.neutral {
          background: #e9ecef;
          color: #666;
        }
        
        .footer {
          text-align: center;
          color: white;
          margin-top: 30px;
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.8em;
          }
          
          .summary-card .value {
            font-size: 2em;
          }
          
          .bar-label {
            font-size: 0.7em;
          }
          
          table {
            font-size: 0.9em;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Historical Analytics</h1>
          <p>Monthly email open trends and comparisons</p>
        </div>
        
        <div class="nav-links">
          <a href="/">Home</a>
          <a href="/dashboard">Current Dashboard</a>
          <a href="/stats">API Stats</a>
          <a href="/stats/history">History JSON</a>
        </div>
        
        <div class="summary-cards">
          <div class="summary-card">
            <div class="value">${monthlyStats.length}</div>
            <div class="label">Months Tracked</div>
          </div>
          
          <div class="summary-card">
            <div class="value">${trackingData.length}</div>
            <div class="label">Total Opens</div>
          </div>
          
          <div class="summary-card">
            <div class="value">${Math.max(...monthlyStats.map(s => s.totalOpens))}</div>
            <div class="label">Peak Month Opens</div>
          </div>
          
          <div class="summary-card">
            <div class="value">${(trackingData.length / monthlyStats.length).toFixed(0)}</div>
            <div class="label">Avg Opens/Month</div>
          </div>
        </div>
        
        <div class="chart-container">
          <h2>📈 Monthly Opens Trend</h2>
          <div class="simple-chart">
            ${monthlyStats.slice().reverse().map(stat => {
              const maxOpens = Math.max(...monthlyStats.map(s => s.totalOpens));
              const height = (stat.totalOpens / maxOpens) * 100;
              const shortMonth = stat.month.split(' ')[0].substring(0, 3);
              return `
                <div class="bar-group">
                  <div class="bar" style="height: ${height}%">
                    <div class="bar-value">${stat.totalOpens}</div>
                  </div>
                  <div class="bar-label">${shortMonth}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="table-container">
          <h2>Monthly Comparison Table</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Opens</th>
                <th>Unique Users</th>
                <th>Newsletters</th>
                <th>Avg Opens/User</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Data range: ${new Date(trackingData[0].timestamp).toLocaleDateString()} - ${new Date(trackingData[trackingData.length - 1].timestamp).toLocaleDateString()}</p>
          <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  console.log('📊 Historical dashboard accessed');
  res.send(html);
});

// RESET ENDPOINT - Clear all tracking data (development only)
app.post('/reset', (req, res) => {
  console.log('🗑️  Resetting all tracking data...');
  
  const success = writeTrackingData([]);
  
  if (success) {
    console.log('✅ All tracking data cleared successfully');
    res.json({ 
      success: true, 
      message: 'All tracking data has been reset',
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('❌ Failed to reset tracking data');
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset tracking data' 
    });
  }
});

// GET version of reset for easy browser access
app.get('/reset', (req, res) => {
  console.log('🗑️  Resetting all tracking data...');
  
  const success = writeTrackingData([]);
  
  if (success) {
    console.log('✅ All tracking data cleared successfully');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reset Complete</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #2c3e50; margin-bottom: 20px; }
            p { color: #666; margin-bottom: 30px; }
            a {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 24px;
              border-radius: 5px;
              text-decoration: none;
              margin: 5px;
            }
            a:hover { background: #5568d3; }
            .success { color: #27ae60; font-size: 3em; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅</div>
            <h1>Tracking Data Reset</h1>
            <p>All tracking data has been cleared successfully!</p>
            <p><small>Timestamp: ${new Date().toISOString()}</small></p>
            <div>
              <a href="/dashboard">View Dashboard</a>
              <a href="/stats">View Stats</a>
              <a href="/">Home</a>
            </div>
          </div>
        </body>
      </html>
    `);
  } else {
    res.status(500).send('Failed to reset tracking data');
  }
});

// 4. DASHBOARD ENDPOINT - HTML page with styling
app.get('/dashboard', (req, res) => {
  const trackingData = readTrackingData();
  const uniqueEmails = new Set(trackingData.map(record => record.email));
  
  // Get last 50 opens in reverse chronological order
  const recentOpens = trackingData.slice(-50).reverse();
  
  // Generate table rows
  const tableRows = recentOpens.map(record => {
    const date = new Date(record.timestamp);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    return `
      <tr>
        <td>${record.email}</td>
        <td>${record.user}</td>
        <td><span class="newsletter-badge">${record.newsletter}</span></td>
        <td>${formattedDate}</td>
        <td>${record.ip}</td>
      </tr>
    `;
  }).join('');
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Tracking Dashboard</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          color: #333;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          color: white;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .header p {
          font-size: 1.1em;
          opacity: 0.95;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        
        .stat-value {
          font-size: 3em;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 10px;
        }
        
        .stat-label {
          font-size: 1.1em;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .table-container {
          background: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow-x: auto;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .table-header h2 {
          color: #2c3e50;
          font-size: 1.5em;
        }
        
        .refresh-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1em;
          transition: background 0.3s;
        }
        
        .refresh-btn:hover {
          background: #5568d3;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        thead {
          background: #f8f9fa;
        }
        
        th {
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #2c3e50;
          border-bottom: 2px solid #dee2e6;
        }
        
        td {
          padding: 12px 15px;
          border-bottom: 1px solid #e9ecef;
        }
        
        tbody tr:hover {
          background: #f8f9fa;
        }
        
        .newsletter-badge {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.9em;
          font-weight: 500;
        }
        
        .no-data {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 1.1em;
        }
        
        .footer {
          text-align: center;
          color: white;
          margin-top: 30px;
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.8em;
          }
          
          .stat-value {
            font-size: 2em;
          }
          
          table {
            font-size: 0.9em;
          }
          
          th, td {
            padding: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Email Tracking Dashboard</h1>
          <p>Real-time analytics for internal company newsletters</p>
        </div>
        
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-value">${trackingData.length}</div>
            <div class="stat-label">Total Opens</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">${uniqueEmails.size}</div>
            <div class="stat-label">Unique Users</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">${trackingData.length > 0 ? (trackingData.length / uniqueEmails.size).toFixed(1) : '0'}</div>
            <div class="stat-label">Avg Opens/User</div>
          </div>
        </div>
        
        <div class="table-container">
          <div class="table-header">
            <h2>Recent Email Opens (Last 50)</h2>
            <div>
              <button class="refresh-btn" onclick="location.href='/history'" style="margin-right: 10px;">📊 View History</button>
              <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
            </div>
          </div>
          
          ${recentOpens.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>User</th>
                  <th>Newsletter</th>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          ` : `
            <div class="no-data">
              📭 No tracking data yet. Start tracking by embedding the tracking pixel in your emails!
            </div>
          `}
        </div>
        
        <div class="footer">
          <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  console.log('📋 Dashboard accessed');
  res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize and start server
initializeTrackingFile();

app.listen(PORT, () => {
  console.log('🚀 Email Tracking Server Started');
  console.log('================================');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📈 Stats: http://localhost:${PORT}/stats`);
  console.log('================================');
  console.log('✅ Ready to track email opens!');
});

