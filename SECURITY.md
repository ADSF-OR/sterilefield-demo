# Security Policy

## Current Security Configuration (MVP)

### Row Level Security (RLS)

**Status:** ✅ Enabled on all tables

The application currently uses **public access policies** for the MVP deployment. This means:

- ✅ RLS is **enabled** on all tables (hospitals, surgeons, cases)
- ⚠️ All operations (SELECT, INSERT, UPDATE, DELETE) are allowed for **anonymous users**
- 🔓 No authentication is required to access or modify data

### Why Public Access is Acceptable for MVP

This configuration is **intentionally permissive** for the following reasons:

1. **No PHI/PII**: The application does not store Protected Health Information or Personally Identifiable Information
   - Surgeon names are professional identities (public information)
   - Hospital names are public institutions
   - Case data contains procedure names and scheduling info only

2. **Private Deployment**: The application is deployed as a private internal tool
   - Not publicly accessible
   - Used within a controlled environment
   - Access controlled at the network/deployment level

3. **MVP Simplicity**: Authentication was removed to accelerate MVP delivery
   - Faster development and testing
   - Focus on core functionality
   - Reduced complexity

### Database Schema Security Features

While access is public, the schema includes security best practices:

- ✅ Foreign key constraints with `ON DELETE RESTRICT` prevent orphaned data
- ✅ Check constraints enforce valid status values
- ✅ Unique indexes prevent duplicate entries
- ✅ UUID primary keys prevent enumeration attacks
- ✅ Timestamps track when records were created

### Production Security Recommendations

**Before moving to production with sensitive data, implement these security measures:**

#### 1. Enable Authentication

Replace public policies with authenticated user policies:

```sql
-- Example: Restrict to authenticated users only
DROP POLICY IF EXISTS "Allow public read access to cases" ON cases;
CREATE POLICY "Authenticated users can read cases"
    ON cases FOR SELECT
    USING (auth.uid() IS NOT NULL);
```

#### 2. Implement Role-Based Access Control (RBAC)

Create user roles with different permission levels:

```sql
-- Example: Only schedulers can create/edit cases
CREATE POLICY "Schedulers can insert cases"
    ON cases FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'scheduler'
    );
```

#### 3. Add Audit Logging

Track who made changes and when:

```sql
-- Add audit fields to tables
ALTER TABLE cases ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE cases ADD COLUMN updated_by UUID REFERENCES auth.users(id);
ALTER TABLE cases ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

#### 4. Enable Supabase Realtime Authentication

If using Realtime features, configure channel-level security:

```javascript
const channel = supabase.channel('cases', {
  config: {
    broadcast: { self: true },
    presence: { key: 'user-id' },
  }
}).subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    // Only authenticated users can subscribe
  }
})
```

#### 5. Implement Rate Limiting

Protect against abuse at the API level:

- Use Supabase Edge Functions with rate limiting
- Configure rate limits in Supabase project settings
- Implement client-side request throttling

#### 6. Data Validation

Add server-side validation triggers:

```sql
-- Example: Validate procedure name format
CREATE OR REPLACE FUNCTION validate_case()
RETURNS TRIGGER AS $$
BEGIN
    IF LENGTH(NEW.procedure) < 3 THEN
        RAISE EXCEPTION 'Procedure name must be at least 3 characters';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_case_before_insert
    BEFORE INSERT OR UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION validate_case();
```

## Network Security

### Current Configuration

- Application hosted on Vercel
- Database hosted on Supabase
- HTTPS enforced for all connections
- Supabase URL and anon key in environment variables

### Best Practices

- ✅ Never commit `.env.local` to version control
- ✅ Rotate Supabase anon key if exposed
- ✅ Use Vercel environment variables for secrets
- ✅ Enable CORS restrictions in Supabase dashboard
- ✅ Regularly review Supabase audit logs

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

## Security Checklist for Production

- [ ] Enable Supabase authentication
- [ ] Implement role-based access control
- [ ] Add audit logging (created_by, updated_by fields)
- [ ] Configure rate limiting
- [ ] Add server-side data validation
- [ ] Review and restrict RLS policies
- [ ] Enable Supabase email confirmations
- [ ] Configure password requirements
- [ ] Set up monitoring and alerts
- [ ] Perform security audit/penetration testing
- [ ] Document incident response procedures
- [ ] Enable two-factor authentication for admin accounts

---

**Last Updated:** 2026-01-21
**MVP Version:** 1.0
**Security Level:** Public Access (Development/MVP Only)
