const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'employee_management',
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000
    });
  }

  async query(sql, params = []) {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async initTables() {
    // Create users table
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create user_profiles table
    await this.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create employees table
    await this.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(100),
        position VARCHAR(100),
        salary DECIMAL(10,2),
        hire_date DATE,
        status ENUM('ACTIVE', 'INACTIVE', 'TERMINATED') DEFAULT 'ACTIVE',
        manager_id INT,
        avatar_url VARCHAR(500),
        address TEXT,
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // Create attendance table
    await this.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        total_hours DECIMAL(4,2),
        status ENUM('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY') DEFAULT 'PRESENT',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_date (employee_id, date)
      )
    `);

    // Create sample data
    await this.seedData();
  }

  async seedData() {
    // Check if data already exists
    const userCount = await this.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count > 0) return;

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await this.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['admin@company.com', hashedPassword, 'ADMIN']
    );

    // Create admin profile
    await this.query(
      'INSERT INTO user_profiles (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
      [adminResult.insertId, 'Admin', 'User', '+1234567890', '123 Admin St, City, Country']
    );

    // Create sample employees
    const employees = [
      {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1234567891',
        department: 'Engineering',
        position: 'Senior Software Engineer',
        salary: 95000,
        hireDate: '2022-01-15',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1234567892',
        department: 'Marketing',
        position: 'Marketing Manager',
        salary: 75000,
        hireDate: '2021-03-22',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        employeeId: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1234567893',
        department: 'Sales',
        position: 'Sales Representative',
        salary: 60000,
        hireDate: '2023-05-10',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        employeeId: 'EMP004',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+1234567894',
        department: 'HR',
        position: 'HR Specialist',
        salary: 55000,
        hireDate: '2022-08-03',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        employeeId: 'EMP005',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@company.com',
        phone: '+1234567895',
        department: 'Finance',
        position: 'Financial Analyst',
        salary: 70000,
        hireDate: '2021-11-18',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      {
        employeeId: 'EMP006',
        firstName: 'Lisa',
        lastName: 'Davis',
        email: 'lisa.davis@company.com',
        phone: '+1234567896',
        department: 'Engineering',
        position: 'Frontend Developer',
        salary: 85000,
        hireDate: '2023-02-14',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      },
      {
        employeeId: 'EMP007',
        firstName: 'Robert',
        lastName: 'Miller',
        email: 'robert.miller@company.com',
        phone: '+1234567897',
        department: 'Operations',
        position: 'Operations Manager',
        salary: 80000,
        hireDate: '2020-06-30',
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face'
      },
      {
        employeeId: 'EMP008',
        firstName: 'Emily',
        lastName: 'Garcia',
        email: 'emily.garcia@company.com',
        phone: '+1234567898',
        department: 'Design',
        position: 'UX Designer',
        salary: 72000,
        hireDate: '2022-12-05',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
      }
    ];

    for (const emp of employees) {
      await this.query(
        `INSERT INTO employees (employee_id, first_name, last_name, email, phone, department, position, salary, hire_date, avatar_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [emp.employeeId, emp.firstName, emp.lastName, emp.email, emp.phone, emp.department, emp.position, emp.salary, emp.hireDate, emp.avatarUrl]
      );
    }
  }
}

module.exports = new Database();