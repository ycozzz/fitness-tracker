const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'fitness.db');
const db = new Database(dbPath);

console.log('🔧 Initializing authentication system...');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Users table created');

// Update profiles table with TDEE fields
db.exec(`
  DROP TABLE IF EXISTS profiles;
  
  CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
    age INTEGER NOT NULL,
    height REAL NOT NULL,
    weight REAL NOT NULL,
    activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) NOT NULL,
    goal TEXT CHECK(goal IN ('lose', 'maintain', 'gain')) NOT NULL,
    tdee INTEGER NOT NULL,
    calorie_target INTEGER NOT NULL,
    protein_target INTEGER NOT NULL,
    carbs_target INTEGER NOT NULL,
    fat_target INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log('✅ Profiles table created');

// Create demo user
const demoPassword = crypto.createHash('sha256').update('demo123').digest('hex');

try {
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash)
    VALUES (?, ?, ?)
  `);
  
  const result = insertUser.run('demo', 'demo@fitness.app', demoPassword);
  const userId = result.lastInsertRowid;
  
  console.log(`✅ Demo user created (ID: ${userId})`);
  
  // Create demo profile
  const insertProfile = db.prepare(`
    INSERT INTO profiles (
      user_id, gender, age, height, weight, 
      activity_level, goal, tdee, calorie_target,
      protein_target, carbs_target, fat_target
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertProfile.run(
    userId,
    'male',
    30,
    175,
    75,
    'moderate',
    'lose',
    2400,
    1920,
    168,
    192,
    53
  );
  
  console.log('✅ Demo profile created');
  
} catch (err) {
  if (err.message.includes('UNIQUE constraint failed')) {
    console.log('ℹ️  Demo user already exists');
  } else {
    throw err;
  }
}

db.close();

console.log('');
console.log('🎉 Authentication system initialized!');
console.log('');
console.log('Demo Account:');
console.log('  Username: demo');
console.log('  Password: demo123');
console.log('');
