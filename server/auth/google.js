const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { sql } = require('../db');

const JWT_EXPIRATION = '24h';

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const displayName = profile.displayName;
        const photoURL = profile.photos[0]?.value;

        // Check if user exists
        console.log('🔍 Google Auth: Checking if user exists...', { googleId, email });
        // Check if user exists
        console.log('🔍 Google Auth: Checking if user exists...', { googleId, email });
        
        const users = await sql`
          SELECT id, email, display_name, photo_url
          FROM users
          WHERE google_id = ${googleId}
        `;
        
        console.log('✅ Google Auth: User query successful', { found: users.length > 0 });

        let user;

        if (users.length === 0) {
          // Check if this is the first user ever
          const userCount = await sql`SELECT count(*) FROM users`;
          const isFirstUser = parseInt(userCount[0].count) === 0;
          const role = isFirstUser ? 'admin' : 'student';

          // Create new user
          const result = await sql`
            INSERT INTO users (email, google_id, display_name, photo_url, last_login, role)
            VALUES (${email}, ${googleId}, ${displayName}, ${photoURL}, NOW(), ${role})
            RETURNING id, email, display_name, photo_url, role
          `;
          user = result[0];
        } else {
          // Update existing user
          user = users[0];
          await sql`
            UPDATE users
            SET last_login = NOW(),
                display_name = ${displayName},
                photo_url = ${photoURL}
            WHERE id = ${user.id}
          `;
        }

        // Generate token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: JWT_EXPIRATION }
        );

        // Save session
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await sql`
          INSERT INTO user_sessions (user_id, token, expires_at)
          VALUES (${user.id}, ${token}, ${expiresAt})
        `;

        done(null, { token, user });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
