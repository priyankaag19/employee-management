const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const logger = require('./logger');

// Function to get user from token
const getUser = async (token) => {
  try {
    if (!token) return null;
    
    // Remove Bearer prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Verify JWT token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Get user from database
    const [rows] = await db.execute(
      'SELECT id, email, role, created_at FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );
    
    if (rows.length === 0) {
      logger.auth('User not found or inactive', { userId: decoded.id });
      return null;
    }
    
    const user = rows[0];
    logger.auth('User authenticated successfully', { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    return user;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.auth('Token expired', { error: error.message });
    } else if (error.name === 'JsonWebTokenError') {
      logger.auth('Invalid token', { error: error.message });
    } else {
      logger.error('Authentication error:', error);
    }
    return null;
  }
};

// Create GraphQL context
const createContext = async ({ req, res }) => {
  try {
    // Get token from authorization header
    const token = req.headers.authorization;
    
    // Get user from token
    const user = await getUser(token);
    
    // Create context object
    const context = {
      user,
      db,
      logger,
      req,
      res,
      // Helper functions
      isAuthenticated: () => !!user,
      isAdmin: () => user && user.role === 'ADMIN',
      isEmployee: () => user && user.role === 'EMPLOYEE',
      requireAuth: () => {
        if (!user) {
          throw new Error('Authentication required');
        }
        return user;
      },
      requireAdmin: () => {
        if (!user) {
          throw new Error('Authentication required');
        }
        if (user.role !== 'ADMIN') {
          throw new Error('Admin access required');
        }
        return user;
      },
      getCurrentUserId: () => {
        if (!user) {
          throw new Error('Authentication required');
        }
        return user.id;
      },
      // Performance tracking
      startTime: Date.now(),
      trackOperation: (operationName) => {
        const duration = Date.now() - context.startTime;
        logger.performance(`GraphQL operation completed`, {
          operation: operationName,
          duration: `${duration}ms`,
          userId: user?.id,
          userRole: user?.role
        });
      }
    };
    
    return context;
  } catch (error) {
    logger.error('Context creation error:', error);
    
    // Return basic context even if authentication fails
    return {
      user: null,
      db,
      logger,
      req,
      res,
      isAuthenticated: () => false,
      isAdmin: () => false,
      isEmployee: () => false,
      requireAuth: () => {
        throw new Error('Authentication required');
      },
      requireAdmin: () => {
        throw new Error('Admin access required');
      },
      getCurrentUserId: () => {
        throw new Error('Authentication required');
      },
      startTime: Date.now(),
      trackOperation: (operationName) => {
        const duration = Date.now() - Date.now();
        logger.performance(`GraphQL operation completed`, {
          operation: operationName,
          duration: `${duration}ms`,
          authenticated: false
        });
      }
    };
  }
};

module.exports = {
  createContext,
  getUser
};