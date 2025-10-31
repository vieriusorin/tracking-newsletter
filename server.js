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
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
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

