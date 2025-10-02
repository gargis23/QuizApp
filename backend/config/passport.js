const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy commented out
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if user already exists
//         let user = await User.findOne({ email: profile.emails[0].value });
//
//         if (user) {
//           // User exists
//           if (user.provider === 'local') {
//             return done(null, false, {
//               message: 'An account with this email already exists. Please login with email and password.'
//             });
//           }
//
//           // Update last login for Google users
//           user.lastLogin = Date.now();
//           await user.save();
//           return done(null, user);
//         } else {
//           // Create new user
//           user = await User.create({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             picture: profile.photos[0]?.value,
//             provider: 'google',
//             providerId: profile.id
//           });
//
//           return done(null, user);
//         }
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

module.exports = passport;
