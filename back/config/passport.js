const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json?.email || profile.emails?.[0]?.value || null;
        const displayName = profile.displayName || profile._json?.name || "";
        const picture =
          (Array.isArray(profile.photos) && profile.photos[0]?.value) ||
          profile._json?.picture ||
          null;

        let user = await User.findByEmail(email);
        if (!user) {
          user = await User.createOAuth(email, displayName, picture);
        } else if (User.updateBasicProfile) {
          try {
            await User.updateBasicProfile(user.id, { fullName: displayName, picture });
          } catch {}
        }

        return done(null, {
          id: user.id,
          email,
          fullName: displayName,
          picture
        });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    picture: user.picture
  });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
