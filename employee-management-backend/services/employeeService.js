const { db } = require('../models');

class EmployeeService {
  // Get all employees with pagination, filtering, and sorting
  async getEmployees(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      status = '',
      sortBy = 'first_name',
      sortOrder = 'ASC'
    } = filters;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (up.first_name LIKE ? OR up.last_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      whereClause += ' AND up.department = ?';
      params.push(department);
    }

    if (status) {
      whereClause += ' AND up.status = ?';
      params.push(status);
    }

    // Validate sort column
    const validSortColumns = ['first_name', 'last_name', 'email', 'department', 'position', 'hire_date', 'salary'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'first_name';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Build final query
    const query = `
      SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at,
        u.updated_at,
        up.first_name,
        up.last_name,
        up.department,
        up.position,
        up.phone,
        up.address,
        up.date_of_birth,
        up.hire_date,
        up.salary,
        up.status,
        up.manager_id,
        up.avatar_url,
        CONCAT(manager_profile.first_name, ' ', manager_profile.last_name) as manager_name
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_profiles manager_profile ON up.manager_id = manager_profile.user_id
      ${whereClause}
      ORDER BY ${sortColumn === 'first_name' || sortColumn === 'last_name' ? `up.${sortColumn}` : sortColumn === 'email' ? 'u.email' : `up.${sortColumn}`} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    // Get count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ${whereClause}
    `;

    try {
      // Execute queries
      const [employees] = await db.execute(query, [...params, limit, offset]);
      const [countResult] = await db.execute(countQuery, params);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        employees: employees.map(this.formatEmployee),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new Error('Failed to fetch employees');
    }
  }

  // Get single employee by ID
  async getEmployeeById(id) {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at,
        u.updated_at,
        up.first_name,
        up.last_name,
        up.department,
        up.position,
        up.phone,
        up.address,
        up.date_of_birth,
        up.hire_date,
        up.salary,
        up.status,
        up.manager_id,
        up.avatar_url,
        CONCAT(manager_profile.first_name, ' ', manager_profile.last_name) as manager_name
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_profiles manager_profile ON up.manager_id = manager_profile.user_id
      WHERE u.id = ?
    `;

    try {
      const [rows] = await db.execute(query, [id]);
      if (rows.length === 0) {
        throw new Error('Employee not found');
      }
      return this.formatEmployee(rows[0]);
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw new Error('Failed to fetch employee');
    }
  }

  // Create new employee
  async createEmployee(employeeData, createdBy) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Create user record
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [employeeData.email, employeeData.password, employeeData.role || 'EMPLOYEE']
      );

      const userId = userResult.insertId;

      // Create user profile
      await connection.execute(
        `INSERT INTO user_profiles (
          user_id, first_name, last_name, department, position, phone, address,
          date_of_birth, hire_date, salary, status, manager_id, avatar_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          employeeData.firstName,
          employeeData.lastName,
          employeeData.department,
          employeeData.position,
          employeeData.phone,
          employeeData.address,
          employeeData.dateOfBirth,
          employeeData.hireDate,
          employeeData.salary,
          employeeData.status || 'ACTIVE',
          employeeData.managerId,
          employeeData.avatarUrl
        ]
      );

      await connection.commit();
      return await this.getEmployeeById(userId);
    } catch (error) {
      await connection.rollback();
      console.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    } finally {
      connection.release();
    }
  }

  // Update employee
  async updateEmployee(id, employeeData, updatedBy) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update user table if email or role changed
      if (employeeData.email || employeeData.role) {
        const userUpdateFields = [];
        const userUpdateValues = [];

        if (employeeData.email) {
          userUpdateFields.push('email = ?');
          userUpdateValues.push(employeeData.email);
        }

        if (employeeData.role) {
          userUpdateFields.push('role = ?');
          userUpdateValues.push(employeeData.role);
        }

        if (userUpdateFields.length > 0) {
          await connection.execute(
            `UPDATE users SET ${userUpdateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            [...userUpdateValues, id]
          );
        }
      }

      // Update user profile
      const profileUpdateFields = [];
      const profileUpdateValues = [];

      const profileFields = [
        'firstName', 'lastName', 'department', 'position', 'phone', 'address',
        'dateOfBirth', 'hireDate', 'salary', 'status', 'managerId', 'avatarUrl'
      ];

      const dbFields = [
        'first_name', 'last_name', 'department', 'position', 'phone', 'address',
        'date_of_birth', 'hire_date', 'salary', 'status', 'manager_id', 'avatar_url'
      ];

      profileFields.forEach((field, index) => {
        if (employeeData[field] !== undefined) {
          profileUpdateFields.push(`${dbFields[index]} = ?`);
          profileUpdateValues.push(employeeData[field]);
        }
      });

      if (profileUpdateFields.length > 0) {
        await connection.execute(
          `UPDATE user_profiles SET ${profileUpdateFields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
          [...profileUpdateValues, id]
        );
      }

      await connection.commit();
      return await this.getEmployeeById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    } finally {
      connection.release();
    }
  }

  // Delete employee
  async deleteEmployee(id, deletedBy) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if employee exists
      const [existingEmployee] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (existingEmployee.length === 0) {
        throw new Error('Employee not found');
      }

      // Delete user profile first (foreign key constraint)
      await connection.execute('DELETE FROM user_profiles WHERE user_id = ?', [id]);
      
      // Delete user
      await connection.execute('DELETE FROM users WHERE id = ?', [id]);

      await connection.commit();
      return { success: true, message: 'Employee deleted successfully' };
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
    } finally {
      connection.release();
    }
  }

  // Get employee statistics
  async getEmployeeStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM users WHERE role = "EMPLOYEE"',
        'SELECT COUNT(*) as active FROM user_profiles WHERE status = "ACTIVE"',
        'SELECT COUNT(*) as inactive FROM user_profiles WHERE status = "INACTIVE"',
        'SELECT department, COUNT(*) as count FROM user_profiles WHERE department IS NOT NULL GROUP BY department',
        'SELECT AVG(salary) as avgSalary FROM user_profiles WHERE salary IS NOT NULL'
      ];

      const [
        [totalResult],
        [activeResult],
        [inactiveResult],
        [departmentResult],
        [salaryResult]
      ] = await Promise.all(queries.map(query => db.execute(query)));

      return {
        total: totalResult[0].total,
        active: activeResult[0].active,
        inactive: inactiveResult[0].inactive,
        byDepartment: departmentResult,
        averageSalary: salaryResult[0].avgSalary || 0
      };
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      throw new Error('Failed to fetch employee statistics');
    }
  }

  // Get unique departments
  async getDepartments() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT department FROM user_profiles WHERE department IS NOT NULL ORDER BY department'
      );
      return rows.map(row => row.department);
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw new Error('Failed to fetch departments');
    }
  }

  // Format employee data
  formatEmployee(row) {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      profile: {
        firstName: row.first_name,
        lastName: row.last_name,
        department: row.department,
        position: row.position,
        phone: row.phone,
        address: row.address,
        dateOfBirth: row.date_of_birth,
        hireDate: row.hire_date,
        salary: row.salary,
        status: row.status,
        managerId: row.manager_id,
        avatarUrl: row.avatar_url,
        age: row.date_of_birth ? this.calculateAge(row.date_of_birth) : null
      },
      managerName: row.manager_name
    };
  }

  // Calculate age from date of birth
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

module.exports = new EmployeeService();