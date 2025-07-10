const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../models');
const { generateToken, requireAuth, requireRole, isAdmin } = require('../middleware/auth');

// Custom DateTime scalar
const DateTime = new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    serialize: (value) => new Date(value).toISOString(),
    parseValue: (value) => new Date(value),
    parseLiteral: (ast) => {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    },
});

const resolvers = {
    DateTime,
    
    Query: {
employees: async (_, { page = 1, limit = 10, sortBy = 'first_name', sortOrder = 'ASC', filters = {} }, context) => {
  requireAuth(context.user);

  const offset = (page - 1) * limit;
  const params = [];
  let whereClause = 'WHERE 1=1';

  const {
    search,
    department,
    position,
    status,
    managerId,
    gender,
    minAge,
    maxAge,
    minSalary,
    maxSalary,
    hiredAfter,
    hiredBefore,
    city,
    state,
    country,
    hasManager,
    skills,
    minExperience,
    maxExperience,
    performanceRating,
  } = filters;

  if (search) {
    whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_id LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  if (department) {
    whereClause += ' AND department = ?';
    params.push(department);
  }

  if (position) {
    whereClause += ' AND position = ?';
    params.push(position);
  }

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  if (managerId) {
    whereClause += ' AND manager_id = ?';
    params.push(managerId);
  }

  if (gender) {
    whereClause += ' AND gender = ?';
    params.push(gender);
  }

  if (minAge) {
    whereClause += ' AND TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= ?';
    params.push(minAge);
  }

  if (maxAge) {
    whereClause += ' AND TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) <= ?';
    params.push(maxAge);
  }

  if (minSalary) {
    whereClause += ' AND salary >= ?';
    params.push(minSalary);
  }

  if (maxSalary) {
    whereClause += ' AND salary <= ?';
    params.push(maxSalary);
  }

  if (hiredAfter) {
    whereClause += ' AND hire_date >= ?';
    params.push(hiredAfter);
  }

  if (hiredBefore) {
    whereClause += ' AND hire_date <= ?';
    params.push(hiredBefore);
  }

  if (city) {
    whereClause += ' AND city = ?';
    params.push(city);
  }

  if (state) {
    whereClause += ' AND state = ?';
    params.push(state);
  }

  if (country) {
    whereClause += ' AND country = ?';
    params.push(country);
  }

  if (hasManager !== undefined) {
    whereClause += hasManager ? ' AND manager_id IS NOT NULL' : ' AND manager_id IS NULL';
  }

  if (performanceRating) {
    whereClause += ' AND performance_rating >= ?';
    params.push(performanceRating);
  }

  // TODO: For skills and experience ranges — if stored in normalized tables (e.g. employee_skills), you'd need a JOIN

  const validSortFields = ['first_name', 'last_name', 'email', 'department', 'position', 'hire_date', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];

  if (!validSortFields.includes(sortBy)) throw new UserInputError('Invalid sort field');
  if (!validSortOrders.includes(sortOrder.toUpperCase())) throw new UserInputError('Invalid sort order');

  const orderClause = `ORDER BY ${sortBy} ${sortOrder}`;

  const countQuery = `SELECT COUNT(*) as total FROM employees ${whereClause}`;
  const countResult = await database.query(countQuery, params);
  const totalCount = countResult[0].total;

  const employeesQuery = `
    SELECT * FROM employees
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?
  `;

  const employees = await database.query(employeesQuery, [...params, limit, offset]);

  return {
    employees: employees.map(emp => ({
      id: emp.id.toString(),
      employeeId: emp.employee_id,
      firstName: emp.first_name,
      lastName: emp.last_name,
      name: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      salary: emp.salary,
      hireDate: emp.hire_date,
      status: emp.status,
      managerId: emp.manager_id?.toString(),
      avatarUrl: emp.avatar_url,
      address: emp.address,
      dateOfBirth: emp.date_of_birth,
      age: emp.date_of_birth
        ? Math.floor(
            (Date.now() - new Date(emp.date_of_birth)) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null,
      createdAt: emp.created_at,
      updatedAt: emp.updated_at
    })),
    pagination: {
      totalItems: totalCount,
      hasNextPage: offset + limit < totalCount,
      hasPreviousPage: page > 1,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
},

        employee: async (parent, { id }, context) => {
            requireAuth(context.user);
            
            const employees = await database.query(
                `SELECT 
                    id, employee_id, first_name, last_name, email, phone, 
                    department, position, salary, hire_date, status, manager_id,
                    avatar_url, address, date_of_birth, created_at, updated_at
                FROM employees 
                WHERE id = ?`,
                [id]
            );
            
            if (employees.length === 0) {
                throw new UserInputError('Employee not found');
            }
            
            const emp = employees[0];
            return {
                id: emp.id.toString(),
                employeeId: emp.employee_id,
                firstName: emp.first_name,
                lastName: emp.last_name,
                name: `${emp.first_name} ${emp.last_name}`,
                email: emp.email,
                phone: emp.phone,
                department: emp.department,
                position: emp.position,
                salary: emp.salary,
                hireDate: emp.hire_date,
                status: emp.status,
                managerId: emp.manager_id?.toString(),
                avatarUrl: emp.avatar_url,
                address: emp.address,
                dateOfBirth: emp.date_of_birth,
                age: emp.date_of_birth ? Math.floor((Date.now() - new Date(emp.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
                createdAt: emp.created_at,
                updatedAt: emp.updated_at
            };
        },
        
        me: async (parent, args, context) => {
            requireAuth(context.user);
            
            const profiles = await database.query(
                `SELECT up.*, u.email, u.role 
                FROM user_profiles up 
                JOIN users u ON up.user_id = u.id 
                WHERE u.id = ?`,
                [context.user.id]
            );
            
            if (profiles.length === 0) {
                return {
                    id: context.user.id.toString(),
                    email: context.user.email,
                    role: context.user.role,
                    profile: null
                };
            }
            
            const profile = profiles[0];
            return {
                id: context.user.id.toString(),
                email: context.user.email,
                role: context.user.role,
                profile: {
                    id: profile.id.toString(),
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    phone: profile.phone,
                    address: profile.address,
                    dateOfBirth: profile.date_of_birth,
                    avatarUrl: profile.avatar_url
                }
            };
        },
        
        employeeStats: async (parent, args, context) => {
            requireAuth(context.user);
            requireRole(context.user, ['ADMIN']);
            
            const totalEmployees = await database.query('SELECT COUNT(*) as count FROM employees');
            const activeEmployees = await database.query("SELECT COUNT(*) as count FROM employees WHERE status = 'ACTIVE'");
            const departmentStats = await database.query(`
                SELECT department, COUNT(*) as count 
                FROM employees 
                GROUP BY department 
                ORDER BY count DESC
            `);
            
            return {
                totalEmployees: totalEmployees[0].count,
                activeEmployees: activeEmployees[0].count,
                departmentStats: departmentStats.map(dept => ({
                    department: dept.department,
                    count: dept.count
                }))
            };
        },
        
        departments: async (parent, args, context) => {
            requireAuth(context.user);
            
            const departments = await database.query(`
                SELECT DISTINCT department 
                FROM employees 
                WHERE department IS NOT NULL AND department != ''
                ORDER BY department
            `);
            
            return departments.map(dept => dept.department);
        }
    },
    
    Mutation: {
        login: async (parent, { input }) => {
            try {
                const { email, password } = input;
                
                // Validate input
                if (!email || !password) {
                    throw new UserInputError('Email and password are required');
                }
                
                // Find user
                const users = await database.query(
                    'SELECT id, email, password, role FROM users WHERE email = ?',
                    [email]
                );
                
                if (users.length === 0) {
                    throw new AuthenticationError('Invalid credentials');
                }
                
                const user = users[0];
                
                // Verify password
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    throw new AuthenticationError('Invalid credentials');
                }
                
                // Generate token
                const token = generateToken(user);
                
                return {
                    token,
                    user: {
                        id: user.id.toString(),
                        email: user.email,
                        role: user.role
                    }
                };
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        
        register: async (parent, { input }, context) => {
            try {
                // Only admin can register new users
                if (context.user) {
                    requireRole(context.user, ['ADMIN']);
                }
                
                const { email, password, firstName, lastName, phone, role = 'EMPLOYEE' } = input;
                
                // Validate input
                if (!email || !password || !firstName || !lastName) {
                    throw new UserInputError('Email, password, firstName, and lastName are required');
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new UserInputError('Invalid email format');
                }
                
                // Validate password strength
                if (password.length < 8) {
                    throw new UserInputError('Password must be at least 8 characters long');
                }
                
                // Check if user already exists
                const existingUsers = await database.query(
                    'SELECT id FROM users WHERE email = ?',
                    [email]
                );
                
                if (existingUsers.length > 0) {
                    throw new UserInputError('User with this email already exists');
                }
                
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Create user
                const userResult = await database.query(
                    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                    [email, hashedPassword, role]
                );
                
                // Create user profile
                await database.query(
                    'INSERT INTO user_profiles (user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?)',
                    [userResult.insertId, firstName, lastName, phone]
                );
                
                const user = {
                    id: userResult.insertId,
                    email,
                    role
                };
                
                // Generate token
                const token = generateToken(user);
                
                return {
                    token,
                    user: {
                        id: user.id.toString(),
                        email: user.email,
                        role: user.role
                    }
                };
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        
        createEmployee: async (parent, { input }, context) => {
            requireAuth(context.user);
            requireRole(context.user, ['ADMIN']);
            
            try {
                const { 
                    employeeId, firstName, lastName, email, phone, 
                    department, position, salary, hireDate, status = 'ACTIVE',
                    managerId, avatarUrl, address, dateOfBirth 
                } = input;
                
                // Validate required fields
                if (!employeeId || !firstName || !lastName || !email || !department || !position) {
                    throw new UserInputError('EmployeeId, firstName, lastName, email, department, and position are required');
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new UserInputError('Invalid email format');
                }
                
                // Check if employee already exists
                const existingEmployees = await database.query(
                    'SELECT id FROM employees WHERE employee_id = ? OR email = ?',
                    [employeeId, email]
                );
                
                if (existingEmployees.length > 0) {
                    throw new UserInputError('Employee with this ID or email already exists');
                }
                
                // Create employee
                const result = await database.query(
                    `INSERT INTO employees 
                    (employee_id, first_name, last_name, email, phone, department, position, salary, hire_date, status, manager_id, avatar_url, address, date_of_birth) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [employeeId, firstName, lastName, email, phone, department, position, salary, hireDate, status, managerId, avatarUrl, address, dateOfBirth]
                );
                
                // Return created employee
                return {
                    id: result.insertId.toString(),
                    employeeId,
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    email,
                    phone,
                    department,
                    position,
                    salary,
                    hireDate,
                    status,
                    managerId,
                    avatarUrl,
                    address,
                    dateOfBirth,
                    age: dateOfBirth ? Math.floor((Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null
                };
            } catch (error) {
                console.error('Create employee error:', error);
                throw error;
            }
        },
        
        updateEmployee: async (parent, { id, input }, context) => {
            requireAuth(context.user);
            
            try {
                // Check if employee exists
                const existingEmployees = await database.query(
                    'SELECT * FROM employees WHERE id = ?',
                    [id]
                );
                
                if (existingEmployees.length === 0) {
                    throw new UserInputError('Employee not found');
                }
                
                const existingEmployee = existingEmployees[0];
                
                // Check permissions
                if (context.user.role === 'EMPLOYEE' && existingEmployee.email !== context.user.email) {
                    throw new ForbiddenError('You can only update your own employee record');
                }
                
                // Validate email format if provided
                if (input.email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.email)) {
                        throw new UserInputError('Invalid email format');
                    }
                    
                    // Check if email is already used by another employee
                    const emailCheck = await database.query(
                        'SELECT id FROM employees WHERE email = ? AND id != ?',
                        [input.email, id]
                    );
                    
                    if (emailCheck.length > 0) {
                        throw new UserInputError('Email is already used by another employee');
                    }
                }
                
                // Build update query
                const updateFields = [];
                const updateValues = [];
                
                const allowedFields = [
                    'employee_id', 'first_name', 'last_name', 'email', 'phone',
                    'department', 'position', 'salary', 'hire_date', 'status',
                    'manager_id', 'avatar_url', 'address', 'date_of_birth'
                ];
                
                const inputMapping = {
                    employeeId: 'employee_id',
                    firstName: 'first_name',
                    lastName: 'last_name',
                    email: 'email',
                    phone: 'phone',
                    department: 'department',
                    position: 'position',
                    salary: 'salary',
                    hireDate: 'hire_date',
                    status: 'status',
                    managerId: 'manager_id',
                    avatarUrl: 'avatar_url',
                    address: 'address',
                    dateOfBirth: 'date_of_birth'
                };
                
                for (const [inputKey, dbField] of Object.entries(inputMapping)) {
                    if (input[inputKey] !== undefined && allowedFields.includes(dbField)) {
                        updateFields.push(`${dbField} = ?`);
                        updateValues.push(input[inputKey]);
                    }
                }
                
                if (updateFields.length === 0) {
                    throw new UserInputError('No valid fields to update');
                }
                
                updateFields.push('updated_at = NOW()');
                updateValues.push(id);
                
                const updateQuery = `
                    UPDATE employees 
                    SET ${updateFields.join(', ')} 
                    WHERE id = ?
                `;
                
                await database.query(updateQuery, updateValues);
                
                // Return updated employee
                const updatedEmployees = await database.query(
                    'SELECT * FROM employees WHERE id = ?',
                    [id]
                );
                
                const emp = updatedEmployees[0];
                return {
                    id: emp.id.toString(),
                    employeeId: emp.employee_id,
                    firstName: emp.first_name,
                    lastName: emp.last_name,
                    name: `${emp.first_name} ${emp.last_name}`,
                    email: emp.email,
                    phone: emp.phone,
                    department: emp.department,
                    position: emp.position,
                    salary: emp.salary,
                    hireDate: emp.hire_date,
                    status: emp.status,
                    managerId: emp.manager_id?.toString(),
                    avatarUrl: emp.avatar_url,
                    address: emp.address,
                    dateOfBirth: emp.date_of_birth,
                    age: emp.date_of_birth ? Math.floor((Date.now() - new Date(emp.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
                    createdAt: emp.created_at,
                    updatedAt: emp.updated_at
                };
            } catch (error) {
                console.error('Update employee error:', error);
                throw error;
            }
        },
        
        deleteEmployee: async (parent, { id }, context) => {
            requireAuth(context.user);
            requireRole(context.user, ['ADMIN']);
            
            try {
                // Check if employee exists
                const existingEmployees = await database.query(
                    'SELECT * FROM employees WHERE id = ?',
                    [id]
                );
                
                if (existingEmployees.length === 0) {
                    throw new UserInputError('Employee not found');
                }
                
                // Delete employee
                await database.query('DELETE FROM employees WHERE id = ?', [id]);
                
                return true;
            } catch (error) {
                console.error('Delete employee error:', error);
                throw error;
            }
        },
        
        bulkUpdateEmployees: async (parent, { ids, input }, context) => {
            requireAuth(context.user);
            requireRole(context.user, ['ADMIN']);
            
            try {
                if (ids.length > 50) {
                    throw new UserInputError('Maximum 50 employees can be updated at once');
                }
                
                if (ids.length === 0) {
                    throw new UserInputError('No employee IDs provided');
                }
                
                // Build update query
                const updateFields = [];
                const updateValues = [];
                
                const inputMapping = {
                    department: 'department',
                    position: 'position',
                    status: 'status',
                    managerId: 'manager_id'
                };
                
                for (const [inputKey, dbField] of Object.entries(inputMapping)) {
                    if (input[inputKey] !== undefined) {
                        updateFields.push(`${dbField} = ?`);
                        updateValues.push(input[inputKey]);
                    }
                }
                
                if (updateFields.length === 0) {
                    throw new UserInputError('No valid fields to update');
                }
                
                updateFields.push('updated_at = NOW()');
                
                const placeholders = ids.map(() => '?').join(',');
                const updateQuery = `
                    UPDATE employees 
                    SET ${updateFields.join(', ')} 
                    WHERE id IN (${placeholders})
                `;
                
                await database.query(updateQuery, [...updateValues, ...ids]);
                
                // Return updated employees
                const updatedEmployees = await database.query(
                    `SELECT * FROM employees WHERE id IN (${placeholders})`,
                    ids
                );
                
                return updatedEmployees.map(emp => ({
                    id: emp.id.toString(),
                    employeeId: emp.employee_id,
                    firstName: emp.first_name,
                    lastName: emp.last_name,
                    name: `${emp.first_name} ${emp.last_name}`,
                    email: emp.email,
                    phone: emp.phone,
                    department: emp.department,
                    position: emp.position,
                    salary: emp.salary,
                    hireDate: emp.hire_date,
                    status: emp.status,
                    managerId: emp.manager_id?.toString(),
                    avatarUrl: emp.avatar_url,
                    address: emp.address,
                    dateOfBirth: emp.date_of_birth,
                    age: emp.date_of_birth ? Math.floor((Date.now() - new Date(emp.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
                    createdAt: emp.created_at,
                    updatedAt: emp.updated_at
                }));
            } catch (error) {
                console.error('Bulk update error:', error);
                throw error;
            }
        },
        
        bulkDeleteEmployees: async (parent, { ids }, context) => {
            requireAuth(context.user);
            requireRole(context.user, ['ADMIN']);
            
            try {
                if (ids.length > 50) {
                    throw new UserInputError('Maximum 50 employees can be deleted at once');
                }
                
                if (ids.length === 0) {
                    throw new UserInputError('No employee IDs provided');
                }
                
                const placeholders = ids.map(() => '?').join(',');
                await database.query(`DELETE FROM employees WHERE id IN (${placeholders})`, ids);
                
                return true;
            } catch (error) {
                console.error('Bulk delete error:', error);
                throw error;
            }
        }
    },
    
    // Type resolvers
    Employee: {
        manager: async (parent) => {
            if (!parent.managerId) return null;
            
            const managers = await database.query(
                'SELECT * FROM employees WHERE id = ?',
                [parent.managerId]
            );
            
            if (managers.length === 0) return null;
            
            const manager = managers[0];
            return {
                id: manager.id.toString(),
                employeeId: manager.employee_id,
                firstName: manager.first_name,
                lastName: manager.last_name,
                name: `${manager.first_name} ${manager.last_name}`,
                email: manager.email,
                phone: manager.phone,
                department: manager.department,
                position: manager.position,
                salary: manager.salary,
                hireDate: manager.hire_date,
                status: manager.status,
                avatarUrl: manager.avatar_url
            };
        },
        
        directReports: async (parent) => {
            const reports = await database.query(
                'SELECT * FROM employees WHERE manager_id = ?',
                [parent.id]
            );
            
            return reports.map(emp => ({
                id: emp.id.toString(),
                employeeId: emp.employee_id,
                firstName: emp.first_name,
                lastName: emp.last_name,
                name: `${emp.first_name} ${emp.last_name}`,
                email: emp.email,
                phone: emp.phone,
                department: emp.department,
                position: emp.position,
                salary: emp.salary,
                hireDate: emp.hire_date,
                status: emp.status,
                avatarUrl: emp.avatar_url
            }));
        }
    }
};

module.exports = resolvers;