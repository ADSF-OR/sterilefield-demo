# SterileField

**Version:** 2.0.0 (Production Ready)
**Status:** Deployable with Supabase + Vercel

---

## 🚀 Quick Start

### For Production Deployment (Recommended)

**Full deployment with database and authentication:**

1. **See [DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions
2. Deploy backend to Supabase (database)
3. Deploy frontend to Vercel (hosting)
4. Configure environment variables
5. You're live! 🎉

### For Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run local development server
npm run preview
```

### Legacy Demo (Offline, No Database)

The original single-file demo is preserved as `index.html` in the root directory.
- Double-click to open in browser
- No installation needed
- Data resets on page refresh

---

## 🏗️ Architecture

**Version 2.0** is a complete rewrite with modern architecture:

### Tech Stack

- **Frontend:** Vanilla JavaScript (ES6 Modules), HTML5, CSS3
- **Backend:** Supabase (PostgreSQL database)
- **Authentication:** Supabase Auth
- **Hosting:** Vercel
- **Real-time:** Supabase Realtime subscriptions

### Project Structure

```
sterilefield-demo/
├── public/              # Static assets
│   ├── index.html      # Main HTML (no inline code)
│   └── styles.css      # Extracted CSS
├── src/
│   ├── js/
│   │   ├── config.js       # App configuration
│   │   ├── database.js     # Supabase operations
│   │   ├── auth.js         # Authentication
│   │   └── app.js          # Main app logic
│   └── utils/
│       └── helpers.js      # Helper functions
├── supabase/
│   └── migrations/         # Database schema
├── package.json            # Dependencies
├── vercel.json            # Deployment config
└── DEPLOYMENT.md          # Deployment guide
```

### Key Improvements from v1.0

✅ **Database persistence** - Data saved to Supabase PostgreSQL
✅ **User authentication** - Role-based access control (Rep vs Scheduler)
✅ **Real-time updates** - Live data synchronization
✅ **Modular code** - Separated concerns (HTML/CSS/JS)
✅ **Production-ready** - Proper error handling, security, scalability
✅ **Row-level security** - Database-level access control
✅ **API-driven** - RESTful operations via Supabase

---

## 📋 Features

### Rep View (Blue Mode)
- **Surgeons Tab**: View surgeon preferences and cases (expandable)
- **Cases Tab**: Chronological case list with filters
  - Today's cases
  - All cases
  - My assigned cases
  - Unconfirmed cases
- **Territory Tab**: Hospital directory
- **Case Confirmation**: Confirm scheduled cases
- **Time Tracking**: Record Time In and Time Out
- **Notification Badge**: Shows unconfirmed case count

### Scheduler View (Orange Mode)
- **Surgeon Management**: Schedule and manage cases
- **Case Scheduling**: Create new surgical cases
- **Rep Assignment**: Assign cases to reps
- **Confirmation Tracking**: See which cases have been confirmed by reps
- **Full CRUD**: Create, Read, Update, Delete cases

---

## 🎯 Demo Flow for Presentations

**Suggested 3-Minute Demo Script:**

1. **Start in Scheduler View** (30 sec)
   - Show surgeon list
   - Click a surgeon to see their profile
   - Schedule a new case → "Pending Rep Confirmation" badge appears

2. **Switch to Rep View** (60 sec)
   - Show notification badge on Cases tab
   - Open Cases tab → see "Today" view
   - Click surgeon in Surgeons tab → expand to see preferences
   - Expand cases → show "Awaiting Confirmation" badge
   - Click **"✓ Confirm"** button

3. **Back to Scheduler View** (30 sec)
   - Show "✓ Rep Confirmed" status
   - Point out confirmation timestamp

4. **Back to Rep View - Time Tracking** (60 sec)
   - Click **"⏱️ Times"** button
   - Enter Time In and Time Out
   - Show delay calculation
   - Status changes to "In Progress" → "Completed"

---

## 🎨 Key Visual Elements

- **Forest Green + Gold** color scheme (medical/professional)
- **Role-specific badges**: Blue for Rep, Orange for Scheduler
- **Status indicators**: Gray (Scheduled), Blue (In Progress), Green (Completed)
- **Confirmation badges**: Orange warning → Green confirmed
- **Mobile-responsive** bottom navigation

---

## 📊 Demo Data Included

- **4 Surgeons** (Spine, Neurosurgery, Ortho)
- **4 Sample Cases** (various stages: scheduled, in-progress, completed)
- **3 Reps** (John Smith, Sarah Johnson, Michael Chen)
- **6 Hospitals** (South Jersey territory)

---

## 💾 File Information

- **File Type**: Single HTML file (no dependencies)
- **File Size**: ~98KB
- **Requirements**: Any modern web browser
- **Internet**: NOT required (fully offline capable)
- **Mobile**: Fully responsive design

---

## 🔄 Version History

### v3.0 - January 2026 (Current)
- ✅ Added case confirmation workflow
- ✅ Added notification badge for unconfirmed cases
- ✅ Added "Today" filter in Cases tab
- ✅ Improved visual hierarchy (larger procedure names, prominent times)
- ✅ Enhanced empty states with helpful messages
- ✅ Stronger visual divide between Rep/Scheduler views
- ✅ 4-tab navigation in Rep View

### v2.0 - January 2026
- Simplified navigation (removed layered pages)
- Combined Surgeons + Cases into expandable sections
- Added Territory tab

### v1.0 - January 2026
- Initial MVP release
- Basic Rep and Scheduler views

---

## 🛠️ Technical Details

**Architecture**: Single-page application (SPA)  
**Framework**: Vanilla JavaScript (no dependencies)  
**Data**: In-memory (demo purposes only)  
**Styling**: Embedded CSS with CSS variables  
**State Management**: JavaScript objects  

**No backend required** - this is a frontend-only demo

---

## 📱 Sharing Instructions

### Email Template:
```
Subject: SterileField Demo - Surgical Case Coordination

Hi [Name],

Please find attached the SterileField demo. To view:
1. Download the HTML file
2. Double-click to open in your browser
3. Try both Rep View and Scheduler View

The demo works completely offline - no installation needed!

Key features to explore:
• Case confirmation workflow
• Real-time time tracking
• Surgeon preference management
• Hospital territory view

Let me know your thoughts!
```

### Link Sharing (if hosted):
```
🔗 Live Demo: [your-github-pages-url]

Try both views to see the complete workflow!
```

---

## 🎓 User Guide

### For Reps:
1. Start in **Rep View**
2. Check **Cases tab** for today's schedule
3. View notification badge for unconfirmed cases
4. Click **Surgeons tab** to see preferences
5. **Confirm cases** you've reviewed
6. **Track times** during procedures

### For Schedulers:
1. Start in **Scheduler View**
2. Click a surgeon to manage their cases
3. Click **"Schedule New Case"**
4. Fill in case details and assign a rep
5. View confirmation status for all cases
6. Edit or delete cases as needed

---

## ⚠️ Important Notes

- **Demo Data**: All data resets on page refresh
- **No PHI**: This demo uses case codes only (HIPAA-friendly design)
- **No Authentication**: For demo purposes, no login required
- **Browser Compatibility**: Works on Chrome, Safari, Firefox, Edge (modern versions)

---

## 🆘 Troubleshooting

**Demo won't open?**
- Make sure file extension is `.html`
- Try right-click → "Open with" → Choose your browser
- Check that JavaScript is enabled in browser

**Changes not saving?**
- This is expected - demo resets on refresh
- Production version would have backend database

**Looks broken on mobile?**
- Use portrait orientation for best experience
- Tap on expandable sections to reveal content

---

## 📞 Support

For questions about this demo or the SterileField platform:
- **Demo Version**: Phase 1 MVP
- **Last Updated**: January 20, 2026

---

## 🔐 License & Usage

This is a demonstration/prototype. All rights reserved.

**For demo/presentation purposes only.**

---

Made with ❤️ for better surgical coordination
