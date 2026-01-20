# SterileField - Deployment Guide

**Version:** 2.0.0 (Production Ready)
**Last Updated:** January 2026

This guide will walk you through deploying SterileField with Supabase (backend) and Vercel (hosting).

---

## 📋 Prerequisites

Before you begin, ensure you have:

- A [Supabase](https://supabase.com) account (free tier available)
- A [Vercel](https://vercel.com) account (free tier available)
- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) 18+ installed
- Basic knowledge of command line

---

## 🗄️ Part 1: Supabase Setup (Database & Backend)

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name:** sterilefield-demo
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"** and wait for setup (~2 minutes)

### Step 2: Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor and click **"Run"**
5. Repeat for `supabase/migrations/002_seed_data.sql`

You should see success messages confirming tables were created.

### Step 3: Get Your API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
3. Keep these handy - you'll need them for Vercel

### Step 4: Create Demo Users (Optional)

For testing, you can create users via Supabase Authentication:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **"Add user"** → **"Create new user"**
3. Create test accounts:
   - **Rep:** `rep@sterilefield.com` / password of your choice
   - **Scheduler:** `scheduler@sterilefield.com` / password of your choice

4. After creating users, add their profiles to the `users` table:

```sql
-- Run this in SQL Editor, replacing the UUIDs with actual user IDs from Authentication
INSERT INTO public.users (id, email, full_name, role, territory) VALUES
('user-uuid-from-auth', 'rep@sterilefield.com', 'Demo Rep', 'rep', 'South Jersey'),
('user-uuid-from-auth', 'scheduler@sterilefield.com', 'Demo Scheduler', 'scheduler', 'South Jersey');
```

### Step 5: Add Sample Data (Optional)

To populate with the demo data from the MVP, you'll need to update the commented-out INSERT statements in `002_seed_data.sql` with actual user UUIDs, then run them.

Alternatively, you can add data through the application UI after deployment.

---

## 🚀 Part 2: Vercel Deployment (Frontend Hosting)

### Step 1: Install Dependencies

```bash
# Navigate to your project directory
cd sterilefield-demo

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables Locally

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...your-key...
```

### Step 3: Test Locally

```bash
# Run local preview
npm run preview

# Or use Vercel dev server
npm run dev
```

Visit `http://localhost:8000` (or the port Vercel provides) to test your app.

### Step 4: Deploy to Vercel

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect the project settings
5. Add environment variables:
   - Click **"Environment Variables"**
   - Add `VITE_SUPABASE_URL` with your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` with your anon key
6. Click **"Deploy"**

### Step 5: Configure Production Domain (Optional)

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs in **Authentication** → **URL Configuration**

---

## 🔧 Configuration

### Vercel Environment Variables

In your Vercel project settings, ensure these are set:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | ✅ Yes |

### Supabase Settings

#### Authentication Configuration

1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel deployment URL to **Site URL**
3. Add `https://your-app.vercel.app/**` to **Redirect URLs**

#### Row Level Security (RLS)

All tables have RLS enabled by default. Policies are defined in the migration files:

- **Reps** can view/update their assigned cases
- **Schedulers** can manage all cases and surgeons
- **All users** can view hospitals and active surgeons

---

## 📱 Post-Deployment Testing

### Test Checklist

1. ✅ **Welcome Modal** - Does it appear on first load?
2. ✅ **Rep View** - Can you see surgeons and cases?
3. ✅ **Scheduler View** - Can you create/edit cases?
4. ✅ **Case Confirmation** - Can reps confirm cases?
5. ✅ **Time Tracking** - Can you enter time in/out?
6. ✅ **Preferences** - Can you update surgeon preferences?
7. ✅ **Filters** - Do Today/All/Mine/Unconfirmed filters work?
8. ✅ **Real-time** - Do changes appear without refresh?

### Common Issues

**Issue:** "Missing Supabase configuration" error

**Solution:** Verify environment variables are set in Vercel dashboard

---

**Issue:** "Permission denied" errors

**Solution:** Check RLS policies in Supabase → check user roles in `users` table

---

**Issue:** No data showing up

**Solution:** Ensure you ran both migration files and created test data

---

**Issue:** Authentication not working

**Solution:** Check Supabase authentication is enabled and redirect URLs are configured

---

## 🔄 Updating Your Deployment

### Push Updates

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push

# Vercel will auto-deploy on push to main branch
```

### Run New Migrations

1. Create new migration file in `supabase/migrations/`
2. Go to Supabase SQL Editor
3. Run the new migration SQL
4. Deploy updated frontend if needed

---

## 🛠️ Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Start dev server
npm run dev
```

### Project Structure

```
sterilefield-demo/
├── public/
│   ├── index.html          # Main HTML file
│   └── styles.css          # All CSS styles
├── src/
│   ├── js/
│   │   ├── config.js       # Configuration & constants
│   │   ├── database.js     # Supabase database operations
│   │   ├── auth.js         # Authentication logic
│   │   └── app.js          # Main application logic
│   └── utils/
│       └── helpers.js      # Helper functions
├── supabase/
│   └── migrations/         # Database migration files
├── .env.local.example      # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── DEPLOYMENT.md         # This file
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** to Git (already in `.gitignore`)
2. **Never share your service role key** publicly
3. **Always use RLS policies** for data access control
4. **Rotate API keys** if compromised
5. **Use strong passwords** for database and user accounts
6. **Enable MFA** on Supabase and Vercel accounts

---

## 📊 Monitoring & Analytics

### Supabase Dashboard

Monitor your backend:
- **Database** → View tables and data
- **Authentication** → See active users
- **Logs** → Debug issues
- **API** → Monitor usage

### Vercel Analytics

Track frontend performance:
- **Analytics** → Page views and performance
- **Logs** → Function execution logs
- **Deployments** → Deployment history

---

## 💰 Cost Estimate

### Free Tier Limits

**Supabase (Free tier):**
- 500 MB database storage
- 2 GB file storage
- 50,000 monthly active users
- Unlimited API requests

**Vercel (Hobby tier):**
- Unlimited personal projects
- 100 GB bandwidth
- Automatic HTTPS
- Custom domains

Both platforms have generous free tiers suitable for demos and small production apps.

---

## 🆘 Support & Troubleshooting

### Documentation

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)

### Community

- **Supabase Discord:** [discord.supabase.com](https://discord.supabase.com)
- **Vercel Discussions:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## 🎉 You're Live!

Congratulations! Your SterileField application is now deployed and accessible to users worldwide.

**Next Steps:**
1. Share your deployment URL with stakeholders
2. Gather feedback from real users
3. Monitor usage and performance
4. Plan Phase 2 features

---

**Deployment URL:** `https://your-app.vercel.app`
**Admin Panel:** `https://supabase.com/dashboard`

Made with ❤️ for better surgical coordination
