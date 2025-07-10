const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const database = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
};

const getUser = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);
    const users = await database.query(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      throw new AuthenticationError('User not found');
    }

    return users[0];
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
};

const requireAuth = (user) => {
  if (!user) {
    throw new AuthenticationError('You must be logged in to perform this action');
  }
};

const requireRole = (user, allowedRoles) => {
  requireAuth(user);
  
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError('You do not have permission to perform this action');
  }
};

const isAdmin = (user) => {
  return user && user.role === 'ADMIN';
};

const isEmployee = (user) => {
  return user && user.role === 'EMPLOYEE';
};

module.exports = {
  generateToken,
  verifyToken,
  getUser,
  requireAuth,
  requireRole,
  isAdmin,
  isEmployee
};