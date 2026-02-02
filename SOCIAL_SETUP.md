# CoffeeConnect Social Features - Setup Guide

This guide will help you set up the social features for CoffeeConnect including Supabase database and Cloudinary image storage.

## Prerequisites

- Node.js installed (v18+)
- A Supabase account (free tier works)
- A Cloudinary account (free tier works)

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/sign in
4. Click "New Project"
5. Fill in project details:
   - Name: `coffee-connect` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
6. Wait for project to be provisioned (~2 minutes)

### 1.2 Get Your Supabase Credentials

1. In your Supabase project, go to **Settings → API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 1.3 Run Database Migration

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" or press `Cmd+Enter`
6. Verify you see "Success. No rows returned"

### 1.4 Configure Auth

1. Go to **Authentication → URL Configuration**
2. Add your site URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Step 2: Set Up Cloudinary

### 2.1 Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for free (no credit card required)
3. Verify your email

### 2.2 Get Your Cloudinary Credentials

1. Go to the **Dashboard**
2. Copy these values:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET` (keep this secret!)

### 2.3 Create Upload Preset (Optional)

1. Go to **Settings → Upload**
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Configure:
   - Name: `coffee-connect-drinks`
   - Signing mode: "Unsigned" (or "Signed" for more security)
   - Folder: `coffee-connect/drinks`
5. Save the preset name if using unsigned uploads

## Step 3: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your credentials:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Save the file

## Step 4: Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install --cache /tmp/npm-cache
```

## Step 5: Run the Application

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Test the Setup

1. **Sign Up**: Click "Sign In" → "Create account"
2. **Complete Onboarding**: Follow the 5-step onboarding flow
3. **Create a Post**: Go to "Find Shops", select a shop, click "Log Drink"
4. **Upload Photo**: Add a photo, drink name, rating, and notes
5. **Check Feed**: Go to "Feed" tab to see your post

## Troubleshooting

### Supabase Connection Issues

**Error**: "Invalid API Key"
- Check that you copied the correct keys from Supabase Settings → API
- Ensure you're using the `anon public` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Error**: "Database relation not found"
- Run the migration SQL in Supabase SQL Editor
- Check for any error messages in the SQL output

### Cloudinary Upload Issues

**Error**: "Cloud name required"
- Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set correctly
- Restart dev server after changing env variables

**Error**: "Upload failed"
- Check API key and secret are correct
- Verify your Cloudinary account is active

### Auth Issues

**Error**: "Auth provider not configured"
- Make sure Supabase Auth is enabled in your project
- Check that email/password auth is enabled

### Build Errors

**Error**: "Module not found"
- Run `npm install --cache /tmp/npm-cache`
- Delete `node_modules` and `.next` folders, then reinstall

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Update environment variables in your hosting platform
2. Update `NEXT_PUBLIC_APP_URL` to your production URL
3. Add your production domain to Supabase Auth → URL Configuration
4. Update redirect URLs in Cloudinary if needed

## Database Schema Reference

See `supabase/migrations/001_initial_schema.sql` for complete schema documentation.

Key tables:
- `profiles` - User profiles
- `drink_preferences` - User coffee preferences
- `posts` - Drink logs
- `visits` - Shop visits
- `favorites` - Favorited shops
- `friendships` - Friend connections
- `likes` - Post likes

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase docs: https://supabase.com/docs
3. Review Cloudinary docs: https://cloudinary.com/documentation

## Security Notes

- **Never commit** `.env.local` to version control
- **Never expose** `SUPABASE_SERVICE_ROLE_KEY` or `CLOUDINARY_API_SECRET` to client-side code
- Use **Row Level Security (RLS)** policies for all database access
- The migration includes RLS policies - review them in Supabase Table Editor
