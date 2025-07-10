const { UserInputError } = require('apollo-server-express');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats)
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

// Employee ID validation regex
const employeeIdRegex = /^[A-Z0-9]{3,10}$/;

// Validation helper functions
const validateEmail = (email) => {
  if (!email) {
    throw new UserInputError('Email is required');
  }
  if (!emailRegex.test(email)) {
    throw new UserInputError('Please provide a valid email address');
  }
  return true;
};

const validatePassword = (password) => {
  if (!password) {
    throw new UserInputError('Password is required');
  }
  if (password.length < 8) {
    throw new UserInputError('Password must be at least 8 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    throw new UserInputError('Password must contain at least one lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    throw new UserInputError('Password must contain at least one uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    throw new UserInputError('Password must contain at least one number');
  }
  return true;
};

const validatePhone = (phone) => {
  if (phone && !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    throw new UserInputError('Please provide a valid phone number');
  }
  return true;
};

const validateEmployeeId = (employeeId) => {
  if (!employeeId) {
    throw new UserInputError('Employee ID is required');
  }
  if (!employeeIdRegex.test(employeeId)) {
    throw new UserInputError('Employee ID must be 3-10 characters long and contain only letters and numbers');
  }
  return true;
};

const validateName = (name, fieldName) => {
  if (!name) {
    throw new UserInputError(`${fieldName} is required`);
  }
  if (name.length < 2) {
    throw new UserInputError(`${fieldName} must be at least 2 characters long`);
  }
  if (name.length > 50) {
    throw new UserInputError(`${fieldName} must be less than 50 characters long`);
  }
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    throw new UserInputError(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }
  return true;
};

const validateDate = (date, fieldName) => {
  if (!date) {
    throw new UserInputError(`${fieldName} is required`);
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new UserInputError(`${fieldName} must be a valid date`);
  }
  return true;
};

const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return true; // Optional field
  }
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  
  if (isNaN(dob.getTime())) {
    throw new UserInputError('Date of birth must be a valid date');
  }
  
  if (dob > today) {
    throw new UserInputError('Date of birth cannot be in the future');
  }
  
  if (age < 16) {
    throw new UserInputError('Employee must be at least 16 years old');
  }
  
  if (age > 100) {
    throw new UserInputError('Please provide a valid date of birth');
  }
  
  return true;
};

const validateSalary = (salary) => {
  if (salary !== undefined && salary !== null) {
    if (typeof salary !== 'number' || salary < 0) {
      throw new UserInputError('Salary must be a positive number');
    }
    if (salary > 10000000) {
      throw new UserInputError('Salary cannot exceed $10,000,000');
    }
  }
  return true;
};

const validatePerformanceRating = (rating) => {
  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      throw new UserInputError('Performance rating must be between 0 and 5');
    }
  }
  return true;
};

const validateExperience = (experience) => {
  if (experience !== undefined && experience !== null) {
    if (typeof experience !== 'number' || experience < 0) {
      throw new UserInputError('Experience must be a positive number');
    }
    if (experience > 50) {
      throw new UserInputError('Experience cannot exceed 50 years');
    }
  }
  return true;
};

const validateSkills = (skills) => {
  if (skills && Array.isArray(skills)) {
    if (skills.length > 20) {
      throw new UserInputError('Maximum 20 skills allowed');
    }
    skills.forEach(skill => {
      if (typeof skill !== 'string' || skill.trim().length === 0) {
        throw new UserInputError('Each skill must be a non-empty string');
      }
      if (skill.length > 100) {
        throw new UserInputError('Each skill must be less than 100 characters');
      }
    });
  }
  return true;
};

const validateCertifications = (certifications) => {
  if (certifications && Array.isArray(certifications)) {
    if (certifications.length > 10) {
      throw new UserInputError('Maximum 10 certifications allowed');
    }
    certifications.forEach(cert => {
      if (typeof cert !== 'string' || cert.trim().length === 0) {
        throw new UserInputError('Each certification must be a non-empty string');
      }
      if (cert.length > 200) {
        throw new UserInputError('Each certification must be less than 200 characters');
      }
    });
  }
  return true;
};

const validatePagination = (page, limit) => {
  if (page !== undefined && page !== null) {
    if (typeof page !== 'number' || page < 1) {
      throw new UserInputError('Page must be a positive number');
    }
  }
  
  if (limit !== undefined && limit !== null) {
    if (typeof limit !== 'number' || limit < 1) {
      throw new UserInputError('Limit must be a positive number');
    }
    if (limit > 100) {
      throw new UserInputError('Limit cannot exceed 100');
    }
  }
  
  return true;
};

const validateEmployeeInput = (input) => {
  const {
    employeeId,
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    department,
    position,
    salary,
    hireDate,
    skills,
    certifications,
    experience,
    performanceRating
  } = input;

  // Required fields
  validateEmployeeId(employeeId);
  validateName(firstName, 'First name');
  validateName(lastName, 'Last name');
  validateEmail(email);
  validateDate(hireDate, 'Hire date');

  if (!department || department.trim().length === 0) {
    throw new UserInputError('Department is required');
  }
  if (!position || position.trim().length === 0) {
    throw new UserInputError('Position is required');
  }

  // Optional fields
  validatePhone(phone);
  validateDateOfBirth(dateOfBirth);
  validateSalary(salary);
  validateSkills(skills);
  validateCertifications(certifications);
  validateExperience(experience);
  validatePerformanceRating(performanceRating);

  return true;
};

const validateEmployeeUpdateInput = (input) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    salary,
    skills,
    certifications,
    experience,
    performanceRating
  } = input;

  // Validate only provided fields
  if (firstName !== undefined) validateName(firstName, 'First name');
  if (lastName !== undefined) validateName(lastName, 'Last name');
  if (email !== undefined) validateEmail(email);
  if (phone !== undefined) validatePhone(phone);
  if (dateOfBirth !== undefined) validateDateOfBirth(dateOfBirth);
  if (salary !== undefined) validateSalary(salary);
  if (skills !== undefined) validateSkills(skills);
  if (certifications !== undefined) validateCertifications(certifications);
  if (experience !== undefined) validateExperience(experience);
  if (performanceRating !== undefined) validatePerformanceRating(performanceRating);

  return true;
};

const validateUserInput = (input) => {
  const { email, password, profile } = input;

  validateEmail(email);
  validatePassword(password);

  if (profile) {
    validateName(profile.firstName, 'First name');
    validateName(profile.lastName, 'Last name');
    validatePhone(profile.phone);
  }

  return true;
};

const validateBulkOperation = (items, maxItems = 50) => {
  if (!Array.isArray(items)) {
    throw new UserInputError('Items must be an array');
  }
  
  if (items.length === 0) {
    throw new UserInputError('At least one item is required');
  }
  
  if (items.length > maxItems) {
    throw new UserInputError(`Maximum ${maxItems} items allowed for bulk operation`);
  }
  
  return true;
};

// Sanitization functions
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/\s+/g, ' ');
};

const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return email.trim().toLowerCase();
};

const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  return phone.replace(/[\s\-\(\)]/g, '');
};

const sanitizeEmployeeInput = (input) => {
  const sanitized = { ...input };
  
  if (sanitized.firstName) sanitized.firstName = sanitizeString(sanitized.firstName);
  if (sanitized.lastName) sanitized.lastName = sanitizeString(sanitized.lastName);
  if (sanitized.email) sanitized.email = sanitizeEmail(sanitized.email);
  if (sanitized.phone) sanitized.phone = sanitizePhone(sanitized.phone);
  if (sanitized.department) sanitized.department = sanitizeString(sanitized.department);
  if (sanitized.position) sanitized.position = sanitizeString(sanitized.position);
  if (sanitized.address) sanitized.address = sanitizeString(sanitized.address);
  if (sanitized.city) sanitized.city = sanitizeString(sanitized.city);
  if (sanitized.state) sanitized.state = sanitizeString(sanitized.state);
  if (sanitized.country) sanitized.country = sanitizeString(sanitized.country);
  if (sanitized.emergencyContact) sanitized.emergencyContact = sanitizeString(sanitized.emergencyContact);
  if (sanitized.emergencyPhone) sanitized.emergencyPhone = sanitizePhone(sanitized.emergencyPhone);
  if (sanitized.education) sanitized.education = sanitizeString(sanitized.education);
  
  // Sanitize arrays
  if (sanitized.skills && Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills.map(skill => sanitizeString(skill)).filter(skill => skill.length > 0);
  }
  
  if (sanitized.certifications && Array.isArray(sanitized.certifications)) {
    sanitized.certifications = sanitized.certifications.map(cert => sanitizeString(cert)).filter(cert => cert.length > 0);
  }
  
  return sanitized;
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateEmployeeId,
  validateName,
  validateDate,
  validateDateOfBirth,
  validateSalary,
  validatePerformanceRating,
  validateExperience,
  validateSkills,
  validateCertifications,
  validatePagination,
  validateEmployeeInput,
  validateEmployeeUpdateInput,
  validateUserInput,
  validateBulkOperation,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeEmployeeInput
};