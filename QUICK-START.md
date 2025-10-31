# 📧 Email Tracking Server - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

Server runs at: **http://localhost:3000**

## 🔑 Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API documentation homepage |
| `GET /track?email=x&user=y&newsletter=z` | Tracking pixel (returns 1x1 PNG) |
| `GET /stats` | Overall statistics JSON |
| `GET /stats/:newsletter` | Newsletter-specific stats |
| `GET /dashboard` | Visual analytics dashboard |
| `GET /reset` | **Clear all tracking data** |
| `GET /health` | Server health check |

## 🧹 How to Reset Tracking Data

### Option 1: Browser (Easiest)
Simply visit: **http://localhost:3000/reset**

### Option 2: Command Line
```bash
# Windows PowerShell
Remove-Item email-opens.json

# Linux/Mac  
rm email-opens.json
```

### Option 3: Using curl
```bash
curl -X POST http://localhost:3000/reset
```

### Option 4: Using the test script
```bash
node test-server.js reset
```

## 📧 Embedding Tracking Pixel

Add this to your HTML email (replace with your values):

```html
<img src="http://localhost:3000/track?email=user@company.com&user=John%20Doe&newsletter=oct-2025" 
     width="1" 
     height="1" 
     style="display:none;" 
     alt="" />
```

**Important:** Place it at the end of your email body!

## 🧪 Testing

### Run all tests:
```bash
node test-server.js
```

### Test reset functionality:
```bash
node test-server.js reset
```

### Manual testing:
1. Open `example-email.html` in a browser
2. Check `http://localhost:3000/dashboard`
3. Verify tracking data appears

## 📊 Viewing Data

### Dashboard (Visual)
**http://localhost:3000/dashboard**
- Total opens & unique users
- Last 50 opens in a table
- Real-time stats

### Stats API (JSON)
**http://localhost:3000/stats**
```json
{
  "totalOpens": 150,
  "uniqueUsers": 45,
  "opens": [...]
}
```

### Newsletter Stats (JSON)
**http://localhost:3000/stats/oct-2025**
```json
{
  "newsletter": "oct-2025",
  "totalOpens": 50,
  "uniqueUsers": 25,
  "opensByUser": {...}
}
```

## 🌐 Deployment

### Render.com (Free)
1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy!

### Fly.io (Free)
```bash
fly launch
fly deploy
```

## 💡 Development Tips

1. **Clear test data frequently** using `/reset` endpoint
2. **Check console logs** for real-time tracking events
3. **View `email-opens.json`** to see raw data
4. **Use the dashboard** for quick visualization
5. **Test with `example-email.html`** provided

## 🐛 Common Issues

### Port already in use?
```bash
# Change port in command line
PORT=8080 npm start
```

### Can't see tracking data?
- Make sure images are enabled in your email client
- Check server console for errors
- Verify the tracking URL is correct
- Try opening the tracking URL directly in browser

### Need to reset everything?
Just visit: **http://localhost:3000/reset** ✨

## 📝 File Structure

```
internal-server/
├── server.js              # Main Express app
├── package.json           # Dependencies
├── email-opens.json       # Tracking data (auto-created)
├── example-email.html     # Sample newsletter
├── test-server.js         # Testing utilities
├── README.md              # Full documentation
└── QUICK-START.md         # This file!
```

## 🎯 Quick Commands Cheat Sheet

```bash
# Start server
npm start

# Development mode (auto-reload)
npm run dev

# Run tests
node test-server.js

# Reset tracking data (via test script)
node test-server.js reset

# View dashboard
open http://localhost:3000/dashboard

# Reset data (browser)
open http://localhost:3000/reset
```

---

**Need more details?** Check out the full [README.md](README.md)

**Questions?** Check server console logs first! 🔍

