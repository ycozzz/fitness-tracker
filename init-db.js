const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./fitness.db');

console.log('🏋️ Initializing Fitness Tracker Database\n');

db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- User profiles
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
    height REAL,
    weight REAL,
    target_weight REAL,
    activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal TEXT CHECK(goal IN ('lose', 'maintain', 'gain')),
    daily_calorie_target INTEGER,
    daily_protein_target INTEGER,
    daily_carbs_target INTEGER,
    daily_fat_target INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Meals
  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    meal_date DATE NOT NULL,
    meal_time TIME NOT NULL,
    food_name TEXT NOT NULL,
    calories REAL NOT NULL,
    protein REAL DEFAULT 0,
    carbs REAL DEFAULT 0,
    fat REAL DEFAULT 0,
    fiber REAL DEFAULT 0,
    sugar REAL DEFAULT 0,
    sodium REAL DEFAULT 0,
    serving_size TEXT,
    image_path TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Weight logs
  CREATE TABLE IF NOT EXISTS weight_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight REAL NOT NULL,
    log_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Water intake
  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    log_date DATE NOT NULL,
    log_time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Exercise logs
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    calories_burned REAL,
    log_date DATE NOT NULL,
    log_time TIME NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date);
  CREATE INDEX IF NOT EXISTS idx_weight_user_date ON weight_logs(user_id, log_date);
  CREATE INDEX IF NOT EXISTS idx_water_user_date ON water_logs(user_id, log_date);
  CREATE INDEX IF NOT EXISTS idx_exercises_user_date ON exercises(user_id, log_date);
`);

console.log('✅ Tables created');

// Create demo user
const demoPassword = crypto.createHash('sha256').update('demo123').digest('hex');
try {
  const userResult = db.prepare(`
    INSERT INTO users (username, email, password_hash, display_name)
    VALUES ('demo', 'demo@fitness.com', ?, 'Demo User')
  `).run(demoPassword);
  
  const userId = userResult.lastInsertRowid;
  
  // Create demo profile
  db.prepare(`
    INSERT INTO profiles (user_id, age, gender, height, weight, target_weight, activity_level, goal, daily_calorie_target, daily_protein_target, daily_carbs_target, daily_fat_target)
    VALUES (?, 28, 'male', 175, 75, 70, 'moderate', 'lose', 2000, 150, 200, 65)
  `).run(userId);
  
  console.log('✅ Demo user created (username: demo, password: demo123)');
} catch (e) {
  console.log('ℹ️  Demo user already exists');
}

console.log('\n✅ Database initialized!');
db.close();
