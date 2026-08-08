const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // Essential for running full schema scripts
};

let pool;

async function initDB() {
  try {
    // Connect without database selected first to create it if it doesn't exist
    const initialConfig = { ...poolConfig };
    delete initialConfig.database;
    
    const connection = await mysql.createConnection(initialConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${poolConfig.database}\`;`);
    await connection.end();

    // Now instantiate the main pool
    pool = mysql.createPool(poolConfig);
    console.log(`Connected to MySQL database: ${poolConfig.database}`);

    // Automatically run schema.sql to initialize tables from root database/ folder
    const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('Database tables verified and initialized successfully.');

      // Run dynamic database alterations for new assignment columns
      try {
        const columnsToAdd = [
          { table: 'assignments', col: 'learning_objectives', def: 'TEXT NULL' },
          { table: 'assignments', col: 'instructions', def: 'TEXT NULL' },
          { table: 'assignments', col: 'assignment_type', def: "VARCHAR(50) DEFAULT 'Coding'" },
          { table: 'assignments', col: 'difficulty_level', def: "VARCHAR(20) DEFAULT 'Medium'" },
          { table: 'assignments', col: 'passing_marks', def: 'INT DEFAULT 50' },
          { table: 'assignments', col: 'est_time', def: 'INT DEFAULT 60' },
          { table: 'assignments', col: 'allowed_file_types', def: "VARCHAR(100) DEFAULT 'pdf,docx,zip'" },
          { table: 'assignments', col: 'max_file_size', def: 'INT DEFAULT 10' },
          { table: 'assignments', col: 'reference_materials', def: 'TEXT NULL' },
          { table: 'assignments', col: 'rubrics', def: 'TEXT NULL' },
          { table: 'assignments', col: 'allow_late_submission', def: 'BOOLEAN DEFAULT TRUE' },
          { table: 'assignments', col: 'allow_resubmission', def: 'BOOLEAN DEFAULT TRUE' },
          { table: 'assignments', col: 'is_published', def: 'BOOLEAN DEFAULT TRUE' },
          
          { table: 'assignment_submissions', col: 'is_draft', def: 'BOOLEAN DEFAULT FALSE' },
          { table: 'assignment_submissions', col: 'returned_for_resubmission', def: 'BOOLEAN DEFAULT FALSE' },

          { table: 'users', col: 'password', def: 'VARCHAR(255) NULL' },
          { table: 'students', col: 'student_code', def: 'VARCHAR(50) NULL UNIQUE' }
        ];

        for (const item of columnsToAdd) {
          try {
            await pool.query(`ALTER TABLE ${item.table} ADD COLUMN ${item.col} ${item.def};`);
          } catch (colErr) {
            // Silence if column already exists
          }
        }

        // Create notifications table if missing
        await pool.query(`
          CREATE TABLE IF NOT EXISTS notifications (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              message TEXT NOT NULL,
              type VARCHAR(50) DEFAULT 'general',
              \`read\` BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        // Create recent_activities table if missing
        await pool.query(`
          CREATE TABLE IF NOT EXISTS recent_activities (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              activity_type VARCHAR(50) NOT NULL,
              description TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        console.log('Assignment Management, Notification, and Activity schema parameters verified.');
      } catch (migErr) {
        console.warn('Migration warning:', migErr.message);
      }

      // Check if courses table is empty, if so, seed!
      const [courses] = await pool.query('SELECT COUNT(*) as count FROM courses');
      if (courses[0].count === 0) {
        console.log('Courses table is empty. Starting database seeding...');
        const { seedDatabase } = require('./seed');
        await seedDatabase(pool);
      }
    } else {
      console.warn('Warning: database/schema.sql file not found. Skipping auto-initialization.');
    }
  } catch (error) {
    console.error('MySQL database connection failed:', error.message);
    throw error;
  }
}

module.exports = {
  initDB,
  // Helper function to query
  query: async (sql, params) => {
    if (!pool) {
      throw new Error('Database pool not initialized. Call initDB first.');
    }
    const [results] = await pool.execute(sql, params);
    return results;
  },
  getPool: () => pool
};
