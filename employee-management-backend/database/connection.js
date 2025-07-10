const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database tables
async function initializeDatabase() {
  const logger = require('../utils/logger');
  
  try {
    // Create employees table
    const createEmployeesTable = `
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15),
        department VARCHAR(50) NOT NULL,
        position VARCHAR(100) NOT NULL,
        salary DECIMAL(10, 2) NOT NULL,
        hire_date DATE NOT NULL,
        status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
        manager_id INT,
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        zip_code VARCHAR(10),
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `;

    // Create users table for authentication
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'hr', 'employee') DEFAULT 'employee',
        employee_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `;

    // Create departments table
    const createDepartmentsTable = `
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        manager_id INT,
        budget DECIMAL(12, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `;

    // Create attendance table
    const createAttendanceTable = `
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        break_duration INT DEFAULT 0,
        total_hours DECIMAL(4, 2),
        status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_date (employee_id, date)
      )
    `;

    // Create leave_requests table
    const createLeaveRequestsTable = `
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        leave_type ENUM('vacation', 'sick', 'personal', 'maternity', 'paternity', 'emergency') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_requested INT NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
      )
    `;

    // Execute table creation queries
    await pool.execute(createEmployeesTable);
    await pool.execute(createUsersTable);
    await pool.execute(createDepartmentsTable);
    await pool.execute(createAttendanceTable);
    await pool.execute(createLeaveRequestsTable);

    logger.info('✅ Database tables created successfully');

    // Check if data already exists
    const [existingEmployees] = await pool.execute('SELECT COUNT(*) as count FROM employees');
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');

    if (existingEmployees[0].count === 0) {
      await insertSampleData();
    }

    logger.info('✅ Database initialization completed');
    return true;

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Insert sample data
async function insertSampleData() {
  const logger = require('../utils/logger');
  
  try {
    // Sample employees data
    const sampleEmployees = [
      {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1-555-0101',
        department: 'Engineering',
        position: 'Software Engineer',
        salary: 75000.00,
        hire_date: '2023-01-15',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '+1-555-0102'
      },
      {
        employee_id: 'EMP002',
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice.smith@company.com',
        phone: '+1-555-0201',
        department: 'Human Resources',
        position: 'HR Manager',
        salary: 65000.00,
        hire_date: '2022-03-10',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001',
        emergency_contact_name: 'Bob Smith',
        emergency_contact_phone: '+1-555-0202'
      },
      {
        employee_id: 'EMP003',
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@company.com',
        phone: '+1-555-0301',
        department: 'Sales',
        position: 'Sales Representative',
        salary: 55000.00,
        hire_date: '2023-06-20',
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        emergency_contact_name: 'Mary Johnson',
        emergency_contact_phone: '+1-555-0302'
      },
      {
        employee_id: 'EMP004',
        first_name: 'Sarah',
        last_name: 'Williams',
        email: 'sarah.williams@company.com',
        phone: '+1-555-0401',
        department: 'Marketing',
        position: 'Marketing Specialist',
        salary: 60000.00,
        hire_date: '2023-02-28',
        address: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        zip_code: '77001',
        emergency_contact_name: 'David Williams',
        emergency_contact_phone: '+1-555-0402'
      },
      {
        employee_id: 'EMP005',
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael.brown@company.com',
        phone: '+1-555-0501',
        department: 'Finance',
        position: 'Financial Analyst',
        salary: 70000.00,
        hire_date: '2022-11-15',
        address: '654 Maple Ave',
        city: 'Phoenix',
        state: 'AZ',
        zip_code: '85001',
        emergency_contact_name: 'Lisa Brown',
        emergency_contact_phone: '+1-555-0502'
      },
      {
        employee_id: 'EMP006',
        first_name: 'Emma',
        last_name: 'Davis',
        email: 'emma.davis@company.com',
        phone: '+1-555-0601',
        department: 'Engineering',
        position: 'Senior Software Engineer',
        salary: 95000.00,
        hire_date: '2021-09-01',
        address: '987 Cedar St',
        city: 'Seattle',
        state: 'WA',
        zip_code: '98101',
        emergency_contact_name: 'James Davis',
        emergency_contact_phone: '+1-555-0602'
      },
      {
        employee_id: 'EMP007',
        first_name: 'Chris',
        last_name: 'Wilson',
        email: 'chris.wilson@company.com',
        phone: '+1-555-0701',
        department: 'Operations',
        position: 'Operations Manager',
        salary: 80000.00,
        hire_date: '2022-05-12',
        address: '147 Birch Ave',
        city: 'Denver',
        state: 'CO',
        zip_code: '80201',
        emergency_contact_name: 'Alex Wilson',
        emergency_contact_phone: '+1-555-0702'
      },
      {
        employee_id: 'EMP008',
        first_name: 'Lisa',
        last_name: 'Taylor',
        email: 'lisa.taylor@company.com',
        phone: '+1-555-0801',
        department: 'Customer Service',
        position: 'Customer Service Representative',
        salary: 45000.00,
        hire_date: '2023-08-01',
        address: '258 Spruce St',
        city: 'Miami',
        state: 'FL',
        zip_code: '33101',
        emergency_contact_name: 'Mark Taylor',
        emergency_contact_phone: '+1-555-0802'
      }
    ];

    // Insert employees
    for (const employee of sampleEmployees) {
      const insertQuery = `
        INSERT INTO employees (
          employee_id, first_name, last_name, email, phone, department, 
          position, salary, hire_date, address, city, state, zip_code,
          emergency_contact_name, emergency_contact_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await pool.execute(insertQuery, [
        employee.employee_id, employee.first_name, employee.last_name,
        employee.email, employee.phone, employee.department, employee.position,
        employee.salary, employee.hire_date, employee.address, employee.city,
        employee.state, employee.zip_code, employee.emergency_contact_name,
        employee.emergency_contact_phone
      ]);
    }

    // Insert admin user
    const bcrypt = require('bcrypt');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const insertAdminQuery = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `;
    
    await pool.execute(insertAdminQuery, [
      'admin',
      'admin@company.com',
      adminPassword,
      'admin'
    ]);

    // Insert departments
    const departments = [
      { name: 'Engineering', description: 'Software development and technical operations' },
      { name: 'Human Resources', description: 'Employee management and organizational development' },
      { name: 'Sales', description: 'Revenue generation and client relationships' },
      { name: 'Marketing', description: 'Brand promotion and market analysis' },
      { name: 'Finance', description: 'Financial planning and accounting' },
      { name: 'Operations', description: 'Business operations and process management' },
      { name: 'Customer Service', description: 'Customer support and satisfaction' }
    ];

    for (const dept of departments) {
      const insertDeptQuery = `
        INSERT INTO departments (name, description)
        VALUES (?, ?)
      `;
      await pool.execute(insertDeptQuery, [dept.name, dept.description]);
    }

    logger.info('✅ Sample data inserted successfully');
    console.log('✅ Sample data inserted successfully');
    
  } catch (error) {
    logger.error('❌ Error inserting sample data:', error);
    throw error;
  }
}

// Get all employees
async function getAllEmployees() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, employee_id, first_name, last_name, email, phone, 
        department, position, salary, hire_date, status, manager_id,
        address, city, state, zip_code, emergency_contact_name, 
        emergency_contact_phone, created_at, updated_at
      FROM employees 
      ORDER BY created_at DESC
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

// Get employee by ID
async function getEmployeeById(id) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, employee_id, first_name, last_name, email, phone, 
        department, position, salary, hire_date, status, manager_id,
        address, city, state, zip_code, emergency_contact_name, 
        emergency_contact_phone, created_at, updated_at
      FROM employees 
      WHERE id = ?
    `, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

// Create new employee
async function createEmployee(employeeData) {
  try {
    const insertQuery = `
      INSERT INTO employees (
        employee_id, first_name, last_name, email, phone, department, 
        position, salary, hire_date, manager_id, address, city, state, 
        zip_code, emergency_contact_name, emergency_contact_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(insertQuery, [
      employeeData.employee_id, employeeData.first_name, employeeData.last_name,
      employeeData.email, employeeData.phone, employeeData.department,
      employeeData.position, employeeData.salary, employeeData.hire_date,
      employeeData.manager_id, employeeData.address, employeeData.city,
      employeeData.state, employeeData.zip_code, employeeData.emergency_contact_name,
      employeeData.emergency_contact_phone
    ]);
    
    return await getEmployeeById(result.insertId);
  } catch (error) {
    throw error;
  }
}

// Update employee
async function updateEmployee(id, employeeData) {
  try {
    const updateQuery = `
      UPDATE employees SET 
        first_name = ?, last_name = ?, email = ?, phone = ?, 
        department = ?, position = ?, salary = ?, manager_id = ?,
        address = ?, city = ?, state = ?, zip_code = ?,
        emergency_contact_name = ?, emergency_contact_phone = ?
      WHERE id = ?
    `;
    
    await pool.execute(updateQuery, [
      employeeData.first_name, employeeData.last_name, employeeData.email,
      employeeData.phone, employeeData.department, employeeData.position,
      employeeData.salary, employeeData.manager_id, employeeData.address,
      employeeData.city, employeeData.state, employeeData.zip_code,
      employeeData.emergency_contact_name, employeeData.emergency_contact_phone,
      id
    ]);
    
    return await getEmployeeById(id);
  } catch (error) {
    throw error;
  }
}

// Delete employee
async function deleteEmployee(id) {
  try {
    const [result] = await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};