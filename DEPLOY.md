# SterileField Deployment Guide

## 🚨 CRITICAL: Run Database Migration First

Before deploying the app or testing the confirmation workflow, you MUST run the database migration to add the required columns.

### Migration File
`supabase/migrations/20260121000002_add_confirmation_columns_and_fix_status.sql`

This migration:
- ✅ Adds `confirmed_at` (timestamptz) column
- ✅ Adds `confirmed_by` (text) column
- ✅ Fixes status constraint to use UPPERCASE values (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- ✅ Sets default status to 'PENDING'
- ✅ Migrates existing data safely (no data loss)
- ✅ Adds performance indexes

### How to Apply Migration

#### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20260121000002_add_confirmation_columns_and_fix_status.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify success message appears

#### Option 2: Supabase CLI
```bash
# If using Supabase CLI locally
supabase db push

# Or apply specific migration
supabase migration up
```

#### Option 3: Direct psql Connection
```bash
# Get connection string from Supabase dashboard
psql "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/20260121000002_add_confirmation_columns_and_fix_status.sql
```

## Deployment Order

**IMPORTANT:** Follow this exact order:

1. ✅ **Run database migration** (using one of the methods above)
2. ✅ **Verify migration succeeded** (check for success message, no errors)
3. ✅ **Deploy app to Vercel** (or your hosting platform)
4. ✅ **Test the confirmation workflow**:
   - Scheduler creates case → Status should be PENDING
   - Rep clicks Confirm → Should succeed without errors
   - Case should change to CONFIRMED with timestamp

## Testing After Deployment

### Test 1: Create Case (Scheduler)
1. Log in as Scheduler
2. Go to Scheduler Dashboard
3. Click on a surgeon
4. Schedule a new case
5. ✅ Verify case appears with status "Pending"

### Test 2: Confirm Case (Rep)
1. Log in as Rep
2. Go to Schedule tab
3. Find a PENDING case
4. Click "✓ Confirm" button
5. ✅ Verify:
   - No error appears
   - Success toast notification shows
   - Case moves to confirmed status
   - Badge changes from orange to green
   - Timestamp is recorded

### Test 3: Verify Persistence
1. Refresh the page (F5)
2. ✅ Verify:
   - Case still shows as CONFIRMED
   - Timestamp persists
   - confirmed_by shows "Rep"

## Troubleshooting

### Error: "Could not find the 'confirmed_at' column"
**Cause:** Migration hasn't been run yet
**Fix:** Run the migration using Option 1 above

### Error: "violates check constraint 'cases_status_check'"
**Cause:** Status values are lowercase or migration hasn't been run
**Fix:** Run the migration - it will fix all status values to UPPERCASE

### Migration fails with "column already exists"
**Cause:** Migration was partially run before
**Fix:** This is safe - the migration uses `IF NOT EXISTS` and `IF EXISTS` to be idempotent

### Schema cache not updating
**Cause:** Supabase needs time to refresh schema cache
**Fix:**
1. Wait 10-30 seconds after running migration
2. Refresh your browser
3. If still not working, restart your Supabase project (Project Settings → General → Restart)

## Environment Variables

Ensure these are set in Vercel (or your hosting platform):

```
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# OR (for Vercel/Next.js style)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

The app supports both naming conventions.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs (Database → Logs)
3. Verify migration ran successfully (Database → Migrations)
4. Ensure environment variables are set correctly
