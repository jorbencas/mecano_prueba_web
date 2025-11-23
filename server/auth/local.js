const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');

const SALT_ROUNDS = 10;
const JWT_EXPIRATION = '24h';

/**
 * Register a new user with email and password
 */
async function register(email, password, displayName) {
  try {
    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (${email}, ${passwordHash}, ${displayName})
      RETURNING id, email, display_name, photo_url, created_at
    `;

    const user = result[0];

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Save session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await sql`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt})
    `;

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        provider: 'email',
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Login with email and password
 */
async function login(email, password) {
  try {
    // Find user
    const users = await sql`
      SELECT id, email, display_name, password_hash, photo_url
      FROM users
      WHERE email = ${email} AND password_hash IS NOT NULL
    `;

    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await sql`
      UPDATE users
      SET last_login = NOW()
      WHERE id = ${user.id}
    `;

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

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        provider: 'email',
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  const users = await sql`
    SELECT id, email, display_name, photo_url, google_id
    FROM users
    WHERE id = ${userId}
  `;

  if (users.length === 0) {
    return null;
  }

  const user = users[0];
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    photoURL: user.photo_url,
    provider: user.google_id ? 'google' : 'email',
  };
}

/**
 * Logout (invalidate session)
 */
async function logout(token) {
  await sql`
    DELETE FROM user_sessions
    WHERE token = ${token}
  `;
}

module.exports = {
  register,
  login,
  verifyToken,
  getUserById,
  logout,
};
