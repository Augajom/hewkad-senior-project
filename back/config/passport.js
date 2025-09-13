const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile._json.email;
      let user = await User.findByEmail(email);

      if (!user) {
        user = await User.createOAuth(email, profile.displayName);
      }

      return done(null, user); // req.user = user
    } catch (err) {
      return done(err, null);
    }
  }
));
