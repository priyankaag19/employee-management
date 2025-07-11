const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/connection');
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
  Query: {
    employees: async (_, { page = 1, limit = 10, sortBy = "first_name", sortOrder = "ASC", filters = {} }) => {
      try {
        const offset = (page - 1) * limit;
        let whereClause = "WHERE 1=1";
        const params = [];
        let paramIndex = 1;

        // Apply filters
        if (filters.search) {
          whereClause += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
          params.push(`%${filters.search}%`);
          paramIndex++;
        }

        if (filters.department) {
          whereClause += ` AND department = $${paramIndex}`;
          params.push(filters.department);
          paramIndex++;
        }

        if (filters.status) {
          whereClause += ` AND status = $${paramIndex}`;
          params.push(filters.status);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM employees ${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        // Get employees
        const query = `
          SELECT e.*, 
                 m.first_name as manager_first_name, 
                 m.last_name as manager_last_name,
                 m.email as manager_email
          FROM employees e
          LEFT JOIN employees m ON e.manager_id = m.id
          ${whereClause}
          ORDER BY ${sortBy} ${sortOrder}
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        params.push(limit, offset);
        const result = await db.query(query, params);

        const employees = result.rows.map(emp => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phoneNumber: emp.phone_number,
          department: emp.department,
          position: emp.position,
          hireDate: emp.hire_date,
          salary: emp.salary,
          status: emp.status,
          avatarUrl: emp.avatar_url,
          managerId: emp.manager_id,
          createdAt: emp.created_at,
          updatedAt: emp.updated_at
        }));

        return {
          employees,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPreviousPage: page > 1
          }
        };
      } catch (error) {
        throw new Error(`Failed to fetch employees: ${error.message}`);
      }
    },

    employee: async (_, { id }) => {
      try {
        const query = `
          SELECT e.*, 
                 m.first_name as manager_first_name, 
                 m.last_name as manager_last_name,
                 m.email as manager_email
          FROM employees e
          LEFT JOIN employees m ON e.manager_id = m.id
          WHERE e.id = $1
        `;
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
          throw new Error('Employee not found');
        }

        const emp = result.rows[0];
        return {
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phoneNumber: emp.phone_number,
          department: emp.department,
          position: emp.position,
          hireDate: emp.hire_date,
          salary: emp.salary,
          status: emp.status,
          avatarUrl: emp.avatar_url,
          managerId: emp.manager_id,
          createdAt: emp.created_at,
          updatedAt: emp.updated_at
        };
      } catch (error) {
        throw new Error(`Failed to fetch employee: ${error.message}`);
      }
    }
  },

  Mutation: {
    createEmployee: async (_, { input }) => {
      try {
        const query = `
          INSERT INTO employees (
            first_name, last_name, email, phone_number, department, 
            position, hire_date, salary, status, avatar_url, manager_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;
        
        const values = [
          input.firstName,
          input.lastName,
          input.email,
          input.phoneNumber,
          input.department,
          input.position,
          input.hireDate,
          input.salary,
          input.status,
          input.avatarUrl,
          input.managerId
        ];

        const result = await db.query(query, values);
        const emp = result.rows[0];

        return {
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phoneNumber: emp.phone_number,
          department: emp.department,
          position: emp.position,
          hireDate: emp.hire_date,
          salary: emp.salary,
          status: emp.status,
          avatarUrl: emp.avatar_url, 
          managerId: emp.manager_id,
          createdAt: emp.created_at,
          updatedAt: emp.updated_at
        };
      } catch (error) {
        throw new Error(`Failed to create employee: ${error.message}`);
      }
    },

    updateEmployee: async (_, { id, input }) => {
      try {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Build dynamic update query
        Object.keys(input).forEach(key => {
          if (input[key] !== undefined) {
            const dbField = key === 'firstName' ? 'first_name' :
                           key === 'lastName' ? 'last_name' :
                           key === 'phoneNumber' ? 'phone_number' :
                           key === 'hireDate' ? 'hire_date' :
                           key === 'managerId' ? 'manager_id' :
                           key === 'avatarUrl' ? 'avatar_url' :
                           key;
            
            fields.push(`${dbField} = $${paramIndex}`);
            values.push(input[key]);
            paramIndex++;
          }
        });

        if (fields.length === 0) {
          throw new Error('No fields to update');
        }

        const query = `
          UPDATE employees 
          SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        
        values.push(id);
        const result = await db.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error('Employee not found');
        }

        const emp = result.rows[0];
        return {
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phoneNumber: emp.phone_number,
          department: emp.department,
          position: emp.position,
          hireDate: emp.hire_date,
          salary: emp.salary,
          status: emp.status,
          avatarUrl: emp.avatar_url,
          managerId: emp.manager_id,
          createdAt: emp.created_at,
          updatedAt: emp.updated_at
        };
      } catch (error) {
        throw new Error(`Failed to update employee: ${error.message}`);
      }
    },

    bulkUpdateEmployees: async (_, { ids, input }) => {
      try {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Build dynamic update query
        Object.keys(input).forEach(key => {
          if (input[key] !== undefined) {
            const dbField = key === 'firstName' ? 'first_name' :
                           key === 'lastName' ? 'last_name' :
                           key === 'phoneNumber' ? 'phone_number' :
                           key === 'hireDate' ? 'hire_date' :
                           key === 'managerId' ? 'manager_id' :
                           key === 'avatarUrl' ? 'avatar_url' :
                           key;
            
            fields.push(`${dbField} = $${paramIndex}`);
            values.push(input[key]);
            paramIndex++;
          }
        });

        if (fields.length === 0) {
          throw new Error('No fields to update');
        }

        const query = `
          UPDATE employees 
          SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ANY($${paramIndex})
          RETURNING *
        `;
        
        values.push(ids);
        const result = await db.query(query, values);

        return result.rows.map(emp => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phoneNumber: emp.phone_number,
          department: emp.department,
          position: emp.position,
          hireDate: emp.hire_date,
          salary: emp.salary,
          status: emp.status,
          avatarUrl: emp.avatar_url, 
          managerId: emp.manager_id,
          createdAt: emp.created_at,
          updatedAt: emp.updated_at
        }));
      } catch (error) {
        throw new Error(`Failed to bulk update employees: ${error.message}`);
      }
    }
  },

  Employee: {
    manager: async (parent) => {
      if (!parent.managerId) return null;
      
      try {
        const query = `SELECT * FROM employees WHERE id = $1`;
        const result = await db.query(query, [parent.managerId]);
        
        if (result.rows.length === 0) return null;
        
        const emp = result.rows[0];
        return {
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phoneNumber: emp.phone_number,
          department: emp.department,
          position: emp.position,
          hireDate: emp.hire_date,
          salary: emp.salary,
          status: emp.status,
          avatarUrl: emp.avatar_url,
          managerId: emp.manager_id,
          createdAt: emp.created_at,
          updatedAt: emp.updated_at
        };
      } catch (error) {
        throw new Error(`Failed to fetch manager: ${error.message}`);
      }
    },

    directReports: async (parent) => {
      try {
        const query = `SELECT * FROM employees WHERE manager_id = $1`;
        const result = await db.query(query, [parent.id]);
        
        return result.rows.map(emp => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phoneNumber: emp.phone_number,
          department: emp.department,
          position: emp.position,
          hireDate: emp.hire_date,
          salary: emp.salary,
          status: emp.status,
          avatarUrl: emp.avatar_url,
          managerId: emp.manager_id,
          createdAt: emp.created_at,
          updatedAt: emp.updated_at
        }));
      } catch (error) {
        throw new Error(`Failed to fetch direct reports: ${error.message}`);
      }
    }
  }
};

module.exports = resolvers;