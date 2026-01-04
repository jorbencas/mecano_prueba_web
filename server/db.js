const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// Test connection
async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected:', result[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

// Initialize database schema
async function initializeSchema() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP,
        role VARCHAR(20) DEFAULT 'student',
        language VARCHAR(10) DEFAULT 'es'
      )
    `;

    // Add role column if it doesn't exist (migration)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student'`;
    } catch (error) {
      console.log('Role column might already exist or error adding it:', error.message);
    }

    // Add language column if it doesn't exist (migration)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'es'`;
    } catch (error) {
      console.log('Language column might already exist or error adding it:', error.message);
    }

    // Create indexes for users
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`;

    // Create user_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes for sessions
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)`;

    // Create activity_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        component VARCHAR(100) NOT NULL,
        duration INTEGER NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes for activity_logs
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_logs(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at)`;

    // Create practice_stats table
    await sql`
      CREATE TABLE IF NOT EXISTS practice_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        mode VARCHAR(50) NOT NULL,
        level_number INTEGER,
        wpm INTEGER NOT NULL,
        accuracy DECIMAL(5,2) NOT NULL,
        errors INTEGER DEFAULT 0,
        duration INTEGER NOT NULL,
        completed BOOLEAN DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes for practice_stats
    await sql`CREATE INDEX IF NOT EXISTS idx_practice_stats_user_id ON practice_stats(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_practice_stats_mode ON practice_stats(mode)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_practice_stats_created_at ON practice_stats(created_at)`;

    // Create level_progress table
    await sql`
      CREATE TABLE IF NOT EXISTS level_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        mode VARCHAR(50) NOT NULL,
        level_number INTEGER NOT NULL,
        completed BOOLEAN DEFAULT false,
        stars INTEGER DEFAULT 0,
        best_wpm INTEGER DEFAULT 0,
        best_accuracy DECIMAL(5,2) DEFAULT 0,
        unlocked_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        UNIQUE(user_id, mode, level_number)
      )
    `;

    // Create indexes for level_progress
    await sql`CREATE INDEX IF NOT EXISTS idx_level_progress_user_id ON level_progress(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_level_progress_mode ON level_progress(mode)`;

    // Create user_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        preferences JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create multiplayer_rooms table
    await sql`
      CREATE TABLE IF NOT EXISTS multiplayer_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        mode VARCHAR(50) NOT NULL,
        max_players INTEGER DEFAULT 4,
        is_private BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create friendships table
    await sql`
      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        accepted_at TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `;

    // Create match_history table
    await sql`
      CREATE TABLE IF NOT EXISTS match_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        room_id UUID,
        mode VARCHAR(50) NOT NULL,
        wpm INTEGER NOT NULL,
        accuracy DECIMAL(5,2) NOT NULL,
        placement INTEGER,
        total_players INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create followers table
    await sql`
      CREATE TABLE IF NOT EXISTS followers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      )
    `;

    // Create posts table (for forum)
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create comments table
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create post_likes table
    await sql`
      CREATE TABLE IF NOT EXISTS post_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `;

    // Daily Challenges System
    await sql`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        challenge_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        target_value INTEGER,
        mode VARCHAR(50),
        difficulty VARCHAR(20),
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        progress INTEGER DEFAULT 0,
        theme VARCHAR(50),
        text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migration to add theme and text columns if they don't exist
    try {
      await sql`ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS theme VARCHAR(50)`;
      await sql`ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS text TEXT`;
    } catch (error) {
      console.log('Columns might already exist or error adding them:', error.message);
    }

    await sql`CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_date ON daily_challenges(user_id, date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_challenges_completed ON daily_challenges(user_id, completed)`;

    await sql`
      CREATE TABLE IF NOT EXISTS challenge_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
        points INTEGER DEFAULT 0,
        badge_earned VARCHAR(100),
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Audit Logs for User Management
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        target_user_id UUID,
        target_user_email VARCHAR(255),
        changes JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)`;

    // Tutoring System Tables
    
    // Classes
    await sql`
      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        invite_code VARCHAR(20) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_classes_invite_code ON classes(invite_code)`;

    // Class Members (Students)
    await sql`
      CREATE TABLE IF NOT EXISTS class_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(class_id, student_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_class_members_student ON class_members(student_id)`;

    // Assignments
    await sql`
      CREATE TABLE IF NOT EXISTS assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL, -- 'level', 'practice', 'speed', etc.
        config JSONB, -- { levelNumber: 1, timeLimit: 60, etc. }
        requirements JSONB, -- { minWpm: 40, minAccuracy: 90 }
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id)`;

    // Assignment Results
    await sql`
      CREATE TABLE IF NOT EXISTS assignment_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        wpm INTEGER,
        accuracy DECIMAL(5,2),
        score INTEGER,
        passed BOOLEAN DEFAULT FALSE,
        attempts INTEGER DEFAULT 1,
        UNIQUE(assignment_id, student_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_assignment_results_student ON assignment_results(student_id)`;
    
    // Global Settings Table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Initialize default settings if they don't exist
    const sessionDuration = await sql`SELECT key FROM settings WHERE key = 'session_duration'`;
    if (sessionDuration.length === 0) {
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('session_duration', '{"days": 7}')
      `;
    }

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Schema initialization error:', error);
    throw error;
  }
}

module.exports = {
  sql,
  testConnection,
  initializeSchema,
};
