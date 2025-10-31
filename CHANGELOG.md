# Changelog

All notable changes to the Email Tracking Server project.

## [1.1.0] - 2025-10-31

### ✨ Added
- **Historical Analytics Dashboard** (`/history`)
  - Visual monthly comparison chart
  - Growth indicators (↑/↓ percentages)
  - Peak performance tracking
  - Trend analysis (Growing/Declining/Stable)
  
- **Historical Stats API** (`/stats/history`)
  - Monthly aggregated statistics
  - Unique users per month
  - Newsletters per month
  - Average opens per user per month
  - Overall trend calculation
  
- **Sample Data Generator** (`generate-sample-data.js`)
  - Creates 6 months of realistic test data
  - 10 sample users
  - 4 newsletter types
  - Realistic growth patterns
  
- **Enhanced Test Suite**
  - Tests for historical endpoints
  - History dashboard validation
  - Updated test output with history links

### 🎨 Improved
- Main dashboard now includes "View History" button
- Homepage updated with historical analytics links
- Better navigation between dashboards
- Enhanced documentation with historical features

### 📚 Documentation
- Updated README with historical analytics usage
- Added historical endpoints to QUICK-START guide
- New CHANGELOG for tracking updates
- Sample data generation instructions

---

## [1.0.0] - 2025-10-31

### ✨ Initial Release
- Email tracking pixel endpoint (`/track`)
- Overall statistics API (`/stats`)
- Newsletter-specific stats (`/stats/:newsletter`)
- Visual dashboard (`/dashboard`)
- Reset functionality for development (`/reset`)
- Health check endpoint (`/health`)
- File-based JSON storage
- Example email template
- Test suite
- Comprehensive documentation
- Deployment guides for Render and Fly.io

### 🎯 Features
- 1x1 transparent PNG tracking pixel
- IP address and user agent tracking
- Real-time console logging
- CORS support
- Cache-control headers
- Responsive dashboard design
- No database required

