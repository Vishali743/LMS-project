const { getAdmin, isInitialized } = require('../config/firebase');
const db = require('../config/db');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const firebaseReady = isInitialized();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (!firebaseReady) {
      const mockUser = await userModel.findByUid('mock-student-uid');
      if (mockUser) {
        req.user = mockUser;
        return next();
      }
    }
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    let decodedToken;
    let isLocalJwt = false;

    // 1. Check if it's a Developer Sandbox bypass token
    if (token.startsWith('mock-')) {
      if (token === 'mock-student') {
        decodedToken = {
          uid: 'mock-student-uid',
          email: 'student@skeinlms.com',
          name: 'Demo Student',
          picture: ''
        };
        if (!req.body.role) req.body.role = 'student';
      } else if (token === 'mock-instructor') {
        decodedToken = {
          uid: 'mock-instructor-uid',
          email: 'instructor@skeinlms.com',
          name: 'Demo Instructor',
          picture: ''
        };
        if (!req.body.role) req.body.role = 'instructor';
      } else if (token === 'mock-admin') {
        decodedToken = {
          uid: 'mock-admin-uid',
          email: 'admin@skeinlms.com',
          name: 'Demo Admin',
          picture: ''
        };
        if (!req.body.role) req.body.role = 'admin';
      } else {
        return res.status(401).json({ 
          error: 'Invalid developer sandbox token.' 
        });
      }
    } else {
      // 2. Attempt to verify as local JWT
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        decodedToken = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          uid: `local-${decoded.id}`, // backward compatible
          isLocalJwt: true
        };
        isLocalJwt = true;
      } catch (jwtErr) {
        // 3. Fallback to Firebase verify if available, or decode token payload
        if (firebaseReady) {
          const firebaseService = require('../services/firebaseService');
          decodedToken = await firebaseService.verifyToken(token);
        } else {
          // Decode standard Firebase JWT payload safely in developer/offline mode
          const decoded = jwt.decode(token);
          if (decoded && (decoded.user_id || decoded.sub || decoded.email)) {
            decodedToken = {
              uid: decoded.user_id || decoded.sub || `fb-${decoded.email}`,
              email: decoded.email,
              name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'User'),
              picture: decoded.picture || ''
            };
          } else {
            return res.status(401).json({ error: 'Unauthorized: Invalid token session' });
          }
        }
      }
    }

    let user;
    if (isLocalJwt) {
      user = await userModel.findById(decodedToken.id);
    } else {
      const { uid, email, name, picture } = decodedToken;
      user = await userModel.findByUid(uid);

      if (!user) {
        // Auto-register user in MySQL database if not found (Firebase sync)
        const role = req.body.role || 'student';
        const displayName = req.body.displayName || name || email.split('@')[0];
        const photoUrl = req.body.photoUrl || picture || '';

        await userModel.create(uid, email, displayName, role, photoUrl);

        // Fetch user again
        user = await userModel.findByUid(uid);
        console.log(`Auto-synchronized user in MySQL (Mock Mode): ${email} (Role: ${role})`);
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    if (error.message.includes('pool') || error.message.includes('connect') || error.message.includes('Access denied')) {
      return res.status(500).json({ 
        error: 'MySQL connection failed. Please ensure MySQL80 service is active and configure DB_PASSWORD inside backend/.env file.' 
      });
    }
    return res.status(403).json({ error: 'Forbidden: Invalid or expired auth token' });
  }
}

function isInstructor(req, res, next) {
  if (req.user && (req.user.role === 'instructor' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Instructor privileges required' });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }
}

module.exports = {
  authMiddleware,
  isInstructor,
  isAdmin
};
