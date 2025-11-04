# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your ABCapture application.

## Prerequisites

- A Google account
- Your application running locally or deployed

## Step 1: Run Database Migration

Before using Google OAuth, you need to update your database schema:

```bash
# Connect to your Neon PostgreSQL database and run the migration
psql $DATABASE_URL -f migrations/add_oauth_support.sql
```

Or if you're using Drizzle Kit:

```bash
npm run db:push
```

This will add the following columns to your `users` table:
- `google_id` (VARCHAR, UNIQUE) - Stores the Google OAuth ID
- `provider` (VARCHAR, DEFAULT 'local') - Identifies the auth provider
- `display_name` (VARCHAR) - Stores the full name from Google
- Makes `password` nullable for OAuth-only users

## Step 2: Get Google OAuth Credentials

### 2.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 2.2 Create a New Project (or select existing)

1. Click on the project dropdown at the top of the page
2. Click "New Project"
3. Enter a project name (e.g., "ABCapture")
4. Click "Create"

### 2.3 Enable Google+ API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 2.4 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: ABCapture (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
8. Click "Save and Continue"
9. Add test users if needed (for development)
10. Click "Save and Continue"

### 2.5 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. Select **Web application** as the application type
4. Configure the following:
   - **Name**: ABCapture Web Client (or any name you prefer)
   - **Authorized JavaScript origins**: 
     - For local development: `http://localhost:5050`
     - For production: Your production URL (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - For local development: `http://localhost:5050/auth/google/callback`
     - For production: `https://yourdomain.com/auth/google/callback`
5. Click "Create"
6. **IMPORTANT**: Copy your **Client ID** and **Client Secret** - you'll need these next!

## Step 3: Update Your .env File

Add the following to your `.env` file (not `.env.example`):

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5050/auth/google/callback
```

Replace:
- `your_actual_client_id_here` with the Client ID from Step 2.5
- `your_actual_client_secret_here` with the Client Secret from Step 2.5

**Note**: For production, update `GOOGLE_CALLBACK_URL` to your production domain.

## Step 4: Restart Your Server

```bash
npm run dev
```

## Step 5: Test Google OAuth

1. Navigate to `http://localhost:5050/login`
2. Click the "Continue with Google" button
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Grant permissions to your app
6. You'll be redirected back to your app and logged in!

## How It Works

### Authentication Flow

1. **User clicks "Continue with Google"** → Redirects to `/auth/google`
2. **Passport initiates OAuth flow** → Redirects to Google's login page
3. **User authenticates with Google** → Google redirects to `/auth/google/callback`
4. **Passport processes the callback**:
   - Checks if user exists with Google ID
   - If yes, logs them in
   - If no, checks if email exists (for account linking)
   - If email exists, links Google account to existing account
   - If neither exists, creates a new user
5. **Session is created** → User is redirected to home page

### Account Linking

The system automatically links Google accounts to existing email accounts:
- If you sign up with `user@example.com` using email/password
- Then later login with Google using the same `user@example.com`
- The system will link your Google account to your existing account
- You can then use either method to login

### OAuth-Only Users

Users who sign up only with Google:
- Will have `provider: 'google'` in the database
- Will have `password: null` (no password set)
- Cannot login with email/password (only Google)
- Can still be linked to a password later if needed

## Security Notes

1. **Never commit your `.env` file** - It contains sensitive credentials
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Keep your Client Secret safe** - Treat it like a password
4. **Regularly rotate secrets** - Update credentials periodically
5. **Use environment-specific credentials** - Different credentials for dev/staging/prod

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Console exactly matches `GOOGLE_CALLBACK_URL` in your `.env`
- Check for trailing slashes and http vs https

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user during development

### "User not found" after successful Google login
- Check database migration ran successfully
- Verify `google_id`, `provider`, and `display_name` columns exist

### Session not persisting
- Verify `SESSION_SECRET` is set in `.env`
- Check that PostgreSQL session store is working
- Look for session save errors in server logs

## Production Deployment

When deploying to production:

1. Update Google Cloud Console:
   - Add production domain to Authorized JavaScript origins
   - Add production callback URL to Authorized redirect URIs

2. Update `.env` for production:
   ```bash
   GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
   ```

3. Ensure HTTPS is enabled (required for OAuth in production)

4. Consider publishing your OAuth consent screen (move from Testing to Production)

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google Cloud Console](https://console.cloud.google.com/)
