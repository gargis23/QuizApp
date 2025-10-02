# Google OAuth Setup Guide

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- Click on the project dropdown (top left)
- Click "New Project"
- Name it "BrainBattle" (or any name)
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click on it and click "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Choose "External" user type
- Click "Create"
- Fill in:
  - **App name**: BrainBattle
  - **User support email**: Your email
  - **Developer contact**: Your email
- Click "Save and Continue"
- Scopes: Click "Add or Remove Scopes"
  - Select: `userinfo.email`, `userinfo.profile`
- Click "Save and Continue"
- Test users: Add your email for testing
- Click "Save and Continue"

### 5. Create OAuth 2.0 Client ID
- Go to "APIs & Services" → "Credentials"
- Click "+ Create Credentials" → "OAuth client ID"
- Application type: **Web application**
- Name: BrainBattle Web Client
- Authorized JavaScript origins:
  ```
  http://localhost:5173
  ```
- Authorized redirect URIs:
  ```
  http://localhost:5000/api/auth/google/callback
  ```
- Click "Create"

### 6. Copy Credentials
You'll see a popup with:
- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abcdefghijklmnop`

**Copy both values!**

### 7. Update Backend `.env`
Edit `backend/.env`:
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 8. Update Frontend `.env`
Edit `brainbattle/.env`:
```env
VITE_GOOGLE_CLIENT_ID=paste_your_client_id_here
```

### 9. Restart Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd brainbattle
npm run dev
```

### 10. Test Google OAuth
1. Go to http://localhost:5173/login
2. Click "Continue with Google"
3. Select your Google account
4. Grant permissions
5. You should be redirected back and logged in!

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Console exactly matches:
```
http://localhost:5000/api/auth/google/callback
```
No trailing slash, correct port number.

### Error: "Access blocked: This app's request is invalid"
**Solution:**
1. Check OAuth consent screen is configured
2. Add yourself as a test user
3. Make sure scopes include `userinfo.email` and `userinfo.profile`

### Error: "idpiframe_initialization_failed"
**Solution:**
1. Clear browser cookies for localhost
2. Check that VITE_GOOGLE_CLIENT_ID is set correctly
3. Make sure frontend .env is loaded (restart dev server)

### Google Login Popup Blocked
**Solution:**
1. Allow popups for localhost in browser settings
2. Try different browser
3. Disable popup blockers

### Error: "Google sign-in failed"
**Solution:**
1. Check browser console for detailed error
2. Verify Client ID matches in both .env files
3. Ensure Google+ API is enabled
4. Check that JavaScript origin includes http://localhost:5173

## Production Setup

When deploying to production:

1. **Update Authorized JavaScript origins:**
   ```
   https://yourdomain.com
   ```

2. **Update Authorized redirect URIs:**
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

3. **Update both .env files** with production Client ID and Secret

4. **Publish OAuth Consent Screen** (move from Testing to Production)

5. **Enable HTTPS** - Google OAuth requires HTTPS in production

## Important Notes

⚠️ **Security:**
- Never commit `.env` files to git
- Keep Client Secret private
- Use different credentials for development and production
- Add `.env` to `.gitignore`

✅ **For Development:**
- Use localhost URLs
- Add yourself as test user
- OAuth consent screen can stay in "Testing" mode

✅ **For Production:**
- Use production domain URLs
- Publish OAuth consent screen
- Request verification if needed
- Use environment variables on hosting platform

## Visual Guide

```
Google Cloud Console
    ↓
Create Project
    ↓
Enable Google+ API
    ↓
OAuth Consent Screen
    ↓
Create OAuth Client ID
    ↓
Copy Client ID & Secret
    ↓
Paste in .env files
    ↓
Restart servers
    ↓
Test login!
```

## Quick Test

After setup, test with this checklist:

- [ ] Click "Continue with Google" button
- [ ] Google popup opens
- [ ] Select account and grant permissions
- [ ] Redirected back to app
- [ ] Logged in successfully
- [ ] Profile picture shows in navbar
- [ ] Check MongoDB: User saved with `provider: 'google'`
- [ ] Logout and login again with Google

## Support

If you encounter issues:

1. Check [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
2. Verify all URLs match exactly (http vs https, trailing slashes)
3. Check browser console for error messages
4. Ensure MongoDB is running and accessible
5. Verify backend server is running on port 5000
6. Verify frontend server is running on port 5173

## Alternative: Using Environment-Specific Credentials

For teams or multiple developers:

**Development (.env.development):**
```env
GOOGLE_CLIENT_ID=dev_client_id
GOOGLE_CLIENT_SECRET=dev_client_secret
```

**Production (.env.production):**
```env
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
```

This allows different OAuth credentials per environment.
