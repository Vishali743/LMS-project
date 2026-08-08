const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { initDB } = require('./config/db');
const { initFirebase } = require('./config/firebase');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const quizRoutes = require('./routes/quizRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for simplicity in local development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Trigger nodemon restart 3
// Basic Health Check Route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    message: 'LMS Backend Server is running smoothly.' 
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// File Upload Endpoint
const upload = require('./middleware/uploadMiddleware');
const { authMiddleware } = require('./middleware/authMiddleware');

app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please provide a file to upload' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return res.json({ 
    message: 'File uploaded successfully',
    fileUrl 
  });
});

// Serve static files from the React frontend build directory
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Wildcard route to handle SPA routing by redirecting requests to React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

// Bootstrap server
async function bootstrap() {
  try {
    // 1. Initialize Database pool & create schema if not initialized
    try {
      await initDB();
    } catch (dbError) {
      console.warn('MySQL initialization failed, continuing in offline mock mode:', dbError.message);
    }
    
    // 2. Initialize Firebase SDK
    try {
      initFirebase();
      const firebase = require('./config/firebase');
      if (firebase.isInitialized()) {
        const { seedFirestoreDatabase } = require('./config/seed');
        await seedFirestoreDatabase(firebase.getFirestoreDb());
      }
    } catch (fbError) {
      console.warn('Firebase SDK initialization failed, continuing in offline mock mode:', fbError.message);
    }
    
    // 3. Connect to MongoDB if MONGODB_URI is provided
    if (process.env.MONGODB_URI) {
      try {
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB successfully connected via mongoose.');
      } catch (mongoError) {
        console.warn('MongoDB connection failed:', mongoError.message);
      }
    }

    // 4. Start Express server
    app.listen(PORT, () => {
      console.log(`LMS Server successfully booted and listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup crash: Failed to bootstrap backend services:', error.message);
    process.exit(1);
  }
}

bootstrap();
