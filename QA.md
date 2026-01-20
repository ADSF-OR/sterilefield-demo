# SterileField MVP - QA Checklist

## Local Development Testing

### Setup
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env.local` with Supabase credentials:
  ```
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```
- [ ] Run `npm run dev`
- [ ] App loads without console errors

### Database Setup (One-Time)
- [ ] Run migration SQL in Supabase SQL Editor (`supabase/migrations/20240101000000_create_mvp_schema.sql`)
- [ ] Verify tables created: `hospitals`, `surgeons`, `cases`
- [ ] Verify seed data appears (3 hospitals, 3 surgeons)

### Feature Testing - Hospitals Management (`/hospitals`)
- [ ] Page loads and displays list of hospitals
- [ ] Click "+ Add Hospital" button
- [ ] Enter hospital name, verify it appears in list
- [ ] Click "Edit" on a hospital
- [ ] Change name, verify update
- [ ] Try to add duplicate hospital name (should fail gracefully)
- [ ] Click "Delete" on a hospital with no cases
- [ ] Verify hospital is removed
- [ ] Create a case using a hospital, then try to delete that hospital (should fail with friendly message)

### Feature Testing - Surgeons Management (`/surgeons`)
- [ ] Page loads and displays list of surgeons
- [ ] Click "+ Add Surgeon" button
- [ ] Enter surgeon name (e.g., "Dr. Jane Doe"), verify it appears in list
- [ ] Click "Edit" on a surgeon
- [ ] Change name, verify update
- [ ] Try to add duplicate surgeon name (should fail gracefully)
- [ ] Click "Delete" on a surgeon with no cases
- [ ] Verify surgeon is removed
- [ ] Create a case using a surgeon, then try to delete that surgeon (should fail with friendly message)

### Feature Testing - New Case Form (`/cases/new`)
- [ ] Page loads with empty form
- [ ] All dropdowns populated (surgeons, hospitals)
- [ ] Click "+ Add New" button for Surgeon
- [ ] Add a new surgeon inline, verify it appears in dropdown and is auto-selected
- [ ] Click "+ Add New" button for Hospital
- [ ] Add a new hospital inline, verify it appears in dropdown and is auto-selected
- [ ] Fill all required fields (surgeon, hospital, procedure, date, time)
- [ ] Submit form
- [ ] Verify redirects to case detail page
- [ ] Verify case appears in schedule

### Feature Testing - Schedule View (`/schedule`)
- [ ] Page loads and displays upcoming cases
- [ ] Cases are grouped by date
- [ ] Try "Next 7 Days" filter
- [ ] Try "Next 30 Days" filter
- [ ] Try "All Upcoming" filter
- [ ] Filter by specific surgeon
- [ ] Filter by specific hospital
- [ ] Combine filters (surgeon + hospital + date range)
- [ ] Verify correct cases appear for each filter
- [ ] Click on a case card
- [ ] Verify redirects to case detail page

### Feature Testing - Case Detail (`/cases/:id`)
- [ ] Page loads showing case information
- [ ] All details displayed correctly (surgeon, hospital, date/time, procedure, notes)
- [ ] Status badge shows correct status
- [ ] Click "Edit" button
- [ ] Verify redirects to form (currently has minor bug, but can manually navigate to `/cases/new`)
- [ ] Update procedure name
- [ ] Change date/time
- [ ] Change status to "completed"
- [ ] Save changes
- [ ] Verify updates appear on detail page
- [ ] Click "Delete" button
- [ ] Confirm deletion
- [ ] Verify redirects to schedule
- [ ] Verify case no longer appears in schedule

### Feature Testing - Home Dashboard (`/`)
- [ ] Page loads with stats cards
- [ ] "Cases Today" shows correct count
- [ ] "Next 7 Days" shows correct count
- [ ] "Total Scheduled" shows correct count
- [ ] Quick action buttons work:
  - [ ] "Schedule New Case" → `/cases/new`
  - [ ] "View Schedule" → `/schedule`
  - [ ] "Manage Hospitals" → `/hospitals`
  - [ ] "Manage Surgeons" → `/surgeons`
- [ ] Upcoming cases list shows next 5 cases
- [ ] "View All" button works
- [ ] Click on a case card, verify navigation works

### Navigation Testing
- [ ] Click each nav button and verify page loads:
  - [ ] 🏠 Home
  - [ ] ➕ New Case
  - [ ] 📋 Schedule
  - [ ] 🏥 Hospitals
  - [ ] 👨‍⚕️ Surgeons
- [ ] Use browser back button, verify it works
- [ ] Use browser forward button, verify it works
- [ ] Refresh page on each route, verify page loads correctly

### Error Handling
- [ ] Try to submit case form with missing required fields (should show validation)
- [ ] Try to add hospital with empty name (should fail)
- [ ] Try to add surgeon with empty name (should fail)
- [ ] Disconnect internet, try to load data (should show error state)
- [ ] Navigate to invalid route like `/nonexistent` (should redirect to home)

### UI States
- [ ] Loading states appear when fetching data
- [ ] Empty states appear when no data exists
- [ ] Error states appear when operations fail
- [ ] Success notifications appear after create/update/delete

---

## Production Testing (Vercel)

### Environment Setup
- [ ] Vercel project created and linked to repository
- [ ] Environment variables set in Vercel dashboard:
  ```
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```
- [ ] Project deployed successfully

### Critical Production Checks
- [ ] Visit production URL, app loads
- [ ] No console errors in browser console
- [ ] Supabase connection works (data loads from database)
- [ ] All routes work when accessed directly (refresh on `/schedule`, `/hospitals`, etc.)
- [ ] Navigation between pages works
- [ ] Browser back/forward buttons work
- [ ] Create a test case
- [ ] Edit the test case
- [ ] Delete the test case
- [ ] Verify all CRUD operations work in production

### iPad/Mobile Testing
- [ ] Open app on iPad Safari
- [ ] Navigation buttons are tappable
- [ ] Forms are usable (date picker, time picker work)
- [ ] Pages are readable (text not too small)
- [ ] No horizontal scrolling issues
- [ ] Dropdowns work correctly
- [ ] Create and edit a case on mobile

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test in Firefox
- [ ] Test in Edge

---

## Known Issues / Future Improvements

### Known Issues (Non-Blocking)
1. Edit button in case detail uses dynamic import - works but shows console warning
2. No auto-refresh after adding surgeon/hospital inline (page needs manual reload)

### Future Enhancements (Not in MVP)
- User authentication (removed for MVP simplicity)
- Email notifications
- Real-time updates via Supabase Realtime
- Advanced filtering (date range picker instead of presets)
- Case attachments/files
- Print/export functionality
- Audit trail
- Role-based permissions

---

## Acceptance Criteria

✅ **PASS** if:
- All local development tests pass
- All production tests pass
- Can create, view, edit, and delete cases
- Can manage hospitals and surgeons
- Schedule view shows correct cases with filters working
- Navigation works correctly (including browser back/forward)
- No console errors on any page
- iPad Safari works correctly

❌ **FAIL** if:
- Cannot connect to Supabase
- Any CRUD operation fails
- Navigation is broken
- Routes don't work when refreshed
- Critical console errors appear
- Forms cannot be submitted
