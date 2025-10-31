# 📧 Email Tracking Server

An email open tracking system for internal company newsletters. Track when emails are opened using tracking pixels and get detailed analytics.

## 🚀 Features

- **Tracking Pixel**: 1x1 transparent PNG pixel to track email opens
- **Real-time Analytics**: Track email opens, unique users, and more
- **Newsletter-specific Stats**: Get detailed stats for individual newsletters
- **Visual Dashboard**: Beautiful HTML dashboard with real-time data
- **File-based Storage**: No database required, uses JSON file storage
- **Free Hosting Ready**: Works on Render.com, Fly.io, and other free platforms

## 📋 Requirements

- Node.js >= 18.0.0
- npm or yarn

## 🛠️ Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on port 3000 by default (or use `PORT` environment variable).

## 🔧 Development Mode

For development with auto-reload:
```bash
npm run dev
```

## 📚 API Endpoints

### 1. Root Endpoint
```
GET /
```
Displays API documentation and available endpoints.

### 2. Tracking Endpoint
```
GET /track?email={email}&user={name}&newsletter={newsletter_id}
```

**Parameters:**
- `email` - User's email address
- `user` - User's name
- `newsletter` - Newsletter identifier

**Returns:** 1x1 transparent PNG pixel

**Example:**
```html
<img src="http://yourserver.com:3000/track?email=user@company.com&user=John&newsletter=oct-2025" width="1" height="1" style="display:none;" alt="" />
```

### 3. Overall Statistics
```
GET /stats
```

**Returns:**
```json
{
  "totalOpens": 150,
  "uniqueUsers": 45,
  "opens": [...]
}
```

### 4. Newsletter Statistics
```
GET /stats/:newsletter
```

**Example:** `GET /stats/oct-2025`

**Returns:**
```json
{
  "newsletter": "oct-2025",
  "totalOpens": 50,
  "uniqueUsers": 25,
  "opensByUser": {
    "user@company.com": {
      "count": 3,
      "firstOpen": "2025-10-01T10:00:00.000Z",
      "lastOpen": "2025-10-05T15:30:00.000Z",
      "user": "John Doe"
    }
  }
}
```

### 5. Dashboard
```
GET /dashboard
```

Visual dashboard showing:
- Total opens and unique users
- Average opens per user
- Last 50 email opens in a table
- Real-time statistics

### 6. Health Check
```
GET /health
```

Returns server health status.

### 7. Reset Data (Development Only)
```
GET /reset
POST /reset
```

Clears all tracking data from the system. Useful during development/testing.

**Example:**
```bash
# Using browser
http://localhost:3000/reset

# Using curl
curl -X POST http://localhost:3000/reset
```

⚠️ **Warning:** This will permanently delete all tracking data. Use with caution!

## 🌐 Deploying to Render.com

1. Create a new Web Service on [Render.com](https://render.com)

2. Connect your GitHub repository

3. Configure the service:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add environment variables (optional):
   - `PORT` - Render automatically sets this

5. Deploy!

Your tracking server will be available at: `https://your-app.onrender.com`

## 🌐 Deploying to Fly.io

1. Install the Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login to Fly:
```bash
fly auth login
```

3. Launch your app:
```bash
fly launch
```

4. Deploy:
```bash
fly deploy
```

## 📧 Using the Tracking Pixel

### In HTML Emails:
```html
<img src="https://your-server.com/track?email=user@company.com&user=John%20Doe&newsletter=oct-2025" 
     width="1" 
     height="1" 
     style="display:none;" 
     alt="" />
```

### Best Practices:
1. Place the pixel at the end of your email HTML
2. Use URL encoding for special characters in parameters
3. Make sure your email client allows images
4. Test with a sample email first

## 📊 Data Storage

All tracking data is stored in `email-opens.json` in the following format:

```json
[
  {
    "email": "user@company.com",
    "user": "John Doe",
    "newsletter": "oct-2025",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
]
```

The file is created automatically on first run if it doesn't exist.

## 🔍 Console Logs

The server logs the following events:
- Server startup information
- Each email open event with details
- Statistics requests
- File operations
- Errors and warnings

## 🛡️ Security Considerations

This is designed for **internal use** only. For production:

1. Add authentication to dashboard and stats endpoints
2. Implement rate limiting
3. Validate and sanitize input parameters
4. Set up proper CORS policies
5. Use HTTPS in production
6. Consider data retention policies

## 🧹 Resetting Tracking Data (Development)

During development, you may want to clear all tracking data. Here are three easy ways:

### Method 1: Using the Reset Endpoint (Easiest)
Simply visit: `http://localhost:3000/reset` in your browser

Or use curl:
```bash
curl -X POST http://localhost:3000/reset
```

### Method 2: Delete the Tracking File
```bash
# Windows PowerShell
Remove-Item email-opens.json

# Linux/Mac
rm email-opens.json
```
The file will be automatically recreated on next server start.

### Method 3: Manual Edit
Open `email-opens.json` and replace contents with:
```json
[]
```

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify Node.js version (>= 18.0.0)
- Check file permissions for creating `email-opens.json`

### Tracking pixel not working
- Verify the URL is correct
- Check email client allows images
- Look at server console logs for errors
- Test with a direct browser visit

### Data not saving
- Check write permissions in the directory
- Verify `email-opens.json` exists and is valid JSON
- Check server console for error messages

## 📝 Example Usage

1. Start the server:
```bash
npm start
```

2. Create an HTML email with the tracking pixel:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Company Newsletter</title>
</head>
<body>
  <h1>October 2025 Newsletter</h1>
  <p>Your newsletter content here...</p>
  
  <!-- Tracking Pixel -->
  <img src="http://localhost:3000/track?email=john@company.com&user=John&newsletter=oct-2025" 
       width="1" height="1" style="display:none;" alt="" />
</body>
</html>
```

3. View the dashboard: http://localhost:3000/dashboard

4. Check statistics: http://localhost:3000/stats/oct-2025

## 📄 License

ISC

## 🤝 Support

For issues or questions, please check the console logs first for debugging information.

---

Built with ❤️ for internal company newsletter tracking

