const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');

const SALT_ROUNDS = 10;

/**
 * Get session duration from settings
 */
async function getSessionDuration() {
  try {
    const result = await sql`SELECT value FROM settings WHERE key = 'session_duration'`;
    if (result.length > 0 && result[0].value && result[0].value.days) {
      return result[0].value.days;
    }
    return 7; // Default 7 days
  } catch (error) {
    console.error('Error fetching session duration:', error);
    return 7;
  }
}

/**
 * Register a new user with email and password
 */
async function register(email, password, displayName, role = 'student') {
  try {
    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      throw new Error('User already exists');
    }

    // Check if this is the first user (make them admin)
    const userCount = await sql`
      SELECT COUNT(*) as count FROM users
    `;
    
    const isFirstUser = parseInt(userCount[0].count) === 0;
    const finalRole = isFirstUser ? 'admin' : 'student'; // First user is admin, others are students

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, display_name, role)
      VALUES (${email}, ${passwordHash}, ${displayName}, ${finalRole})
      RETURNING id, email, display_name, photo_url, role, created_at
    `;

    const user = result[0];

    // Generate token
    const days = await getSessionDuration();
    const expiresIn = `${days}d`;
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Save session
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
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
        role: user.role,
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
      SELECT id, email, display_name, password_hash, photo_url, role
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
    const days = await getSessionDuration();
    const expiresIn = `${days}d`;

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Save session
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
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
        role: user.role,
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
    SELECT id, email, display_name, photo_url, google_id, role
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
    role: user.role,
    language: user.language,
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

/**
 * Update user profile
 */
async function updateProfile(userId, { displayName, photoURL, language }) {
  try {
    const result = await sql`
      UPDATE users
      SET 
        display_name = COALESCE(${displayName}, display_name),
        photo_url = COALESCE(${photoURL}, photo_url),
        language = COALESCE(${language}, language),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, display_name, photo_url, role, language
    `;

    if (result.length === 0) {
      throw new Error('User not found');
    }

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      photoURL: user.photo_url,
      role: user.role,
      provider: 'email', // Default for local auth
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Change user password
 */
async function changePassword(userId, oldPassword, newPassword) {
  try {
    // Get current password hash
    const users = await sql`
      SELECT password_hash FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Verify old password
    if (user.password_hash) {
      const isValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isValid) {
        throw new Error('Invalid old password');
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    return { message: 'Password updated successfully' };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  register,
  login,
  verifyToken,
  getUserById,
  logout,
  updateProfile,
  changePassword,
};
