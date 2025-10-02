# BrainBattle - Setup Instructions

## Issues Fixed ✅

1. **Database Storage Issue** - Frontend now makes actual API calls instead of mock login
2. **Routing Issue** - Implemented React Router for proper page navigation
3. **API Integration** - Connected frontend to backend APIs
4. **JWT Authentication** - Fully implemented with token storage
5. **Google OAuth** - Working "Continue with Google" button

## Setup Steps

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Edit `backend/.env` and update:
```env
# MongoDB - Use your connection string
MONGODB_URI=mongodb://127.0.0.1:27017/brainbattle

# JWT Secret - Change this in production
JWT_SECRET=brainbattle_super_secret_key_2024_change_this_in_production

# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For Windows (if MongoDB installed as service)
net start MongoDB

# For Mac/Linux
sudo systemctl start mongod
# OR
mongod --dbpath /path/to/data/directory
```

#### Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd brainbattle
npm install
```

#### Configure Environment Variables
Edit `brainbattle/.env` and update:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### Start Frontend
```bash
npm run dev
# App runs on http://localhost:5173
```

### 3. Google OAuth Setup (Optional)

If you want to use "Continue with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: BrainBattle
   - Add authorized domains: localhost
6. Create OAuth Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**
8. Update both `.env` files:
   - `backend/.env` → `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - `brainbattle/.env` → `VITE_GOOGLE_CLIENT_ID`

## Testing the Application

### 1. Test Regular Registration/Login

1. Open http://localhost:5173
2. Click "Login" or "Get Started"
3. Go to "Create an account"
4. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Solve the captcha
5. Click "Sign Up"
6. You should be redirected to home page as logged in user
7. Check MongoDB to verify user was created:
   ```bash
   mongosh
   use brainbattle
   db.users.find()
   ```

### 2. Test Google OAuth (if configured)

1. On Login or Register page, click "Continue with Google"
2. Select your Google account
3. Grant permissions
4. You should be redirected back and logged in
5. Your Google profile picture should appear in navbar

### 3. Test Navigation

- All navigation should now work without page reload
- Browser back/forward buttons should work properly
- URLs should update when navigating
- Clicking navbar links should navigate correctly

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth (token-based)
- `GET /api/auth/google` - Google OAuth (redirect-based)
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user (requires JWT token)

### Users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/stats` - Get user stats

### Quiz
- `POST /api/quiz/submit` - Submit quiz result
- `GET /api/quiz/history` - Get quiz history
- `GET /api/quiz/category/:category` - Get results by category

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/rank` - Get user rank
- `GET /api/leaderboard/category/:category` - Get category leaderboard

### Rooms
- `POST /api/rooms/create` - Create room
- `POST /api/rooms/join/:roomCode` - Join room
- `POST /api/rooms/leave/:roomCode` - Leave room
- `GET /api/rooms/:roomCode` - Get room details
- `PUT /api/rooms/:roomCode/settings` - Update room settings
- `POST /api/rooms/:roomCode/kick/:userId` - Kick player
- `POST /api/rooms/:roomCode/start` - Start game
- `POST /api/rooms/:roomCode/chat` - Add chat message

## Frontend API Usage

The `brainbattle/src/api/api.js` file contains all API functions. Example usage:

```javascript
import { authAPI } from '../api/api';

// Register
const response = await authAPI.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Login
const response = await authAPI.login({
  email: 'john@example.com',
  password: 'password123'
});

// Get current user (automatically includes JWT token)
const response = await authAPI.getMe();
```

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running and the connection string in `.env` is correct.

### Issue: "User not being saved to database"
**Solution:** Fixed! Frontend now makes actual API calls instead of mock login.

### Issue: "Navigation not working / page loads on same page"
**Solution:** Fixed! Now using React Router for proper navigation.

### Issue: "Google sign-in not working"
**Solution:**
1. Make sure you've configured Google OAuth credentials
2. Update both `.env` files with the Client ID
3. Ensure authorized origins and redirect URIs are correct

### Issue: "JWT token invalid"
**Solution:** The token automatically refreshes. If issues persist, clear localStorage and login again.

### Issue: "CORS errors"
**Solution:** Backend is configured to accept requests from http://localhost:5173. If using different port, update `FRONTEND_URL` in backend `.env`.

## Next Steps

1. ✅ User registration and login working with database storage
2. ✅ JWT authentication implemented
3. ✅ Google OAuth working
4. ✅ Proper React Router navigation
5. 🔄 Implement real-time features using Socket.io for multiplayer rooms
6. 🔄 Add quiz questions API integration
7. 🔄 Complete profile page functionality
8. 🔄 Implement leaderboard with real data

## Security Notes

⚠️ **For Production:**
1. Change `JWT_SECRET` to a strong random string
2. Change `SESSION_SECRET` to a strong random string
3. Use environment variables, never commit secrets
4. Enable HTTPS
5. Update CORS settings to allow only your production domain
6. Use MongoDB Atlas or other cloud database
7. Add rate limiting and request validation
8. Enable security headers
