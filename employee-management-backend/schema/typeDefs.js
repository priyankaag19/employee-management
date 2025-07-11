// 1. Fix in typeDefs.js - Update the Employee type to include missing fields

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime
  scalar Upload

  enum Role {
    ADMIN
    EMPLOYEE
  }

  enum EmployeeStatus {
    ACTIVE
    INACTIVE
    TERMINATED
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  enum SortOrder {
    ASC
    DESC
  }

  type User {
    id: ID!
    email: String!
    role: Role!
    profile: UserProfile
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserProfile {
    id: ID!
    userId: ID!
    firstName: String!
    lastName: String!
    phone: String
    avatarUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Employee {
    id: ID!
    employeeId: String!
    firstName: String!
    lastName: String!
    name: String!      # Add this computed field
    email: String!
    phone: String
    dateOfBirth: DateTime
    age: Int
    gender: Gender
    department: String!
    position: String!
    salary: Float
    hireDate: DateTime!
    managerId: ID
    manager: Employee
    directReports: [Employee!]!
    status: EmployeeStatus!
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    emergencyContact: String
    emergencyPhone: String
    skills: [String!]!
    experience: Int
    education: String
    certifications: [String!]!
    performanceRating: Float
    avatarUrl: String  # Make sure this field exists
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type EmployeeStats {
    totalEmployees: Int!
    activeEmployees: Int!
    inactiveEmployees: Int!
    terminatedEmployees: Int!
    departmentCounts: [DepartmentCount!]!
    averageAge: Float
    averageSalary: Float
    totalSalaryExpense: Float
    newHiresThisMonth: Int!
    newHiresThisYear: Int!
  }

  type DepartmentCount {
    department: String!
    count: Int!
    averageSalary: Float
  }

  type AuthPayload {
    token: String!
    user: User!
    expiresIn: String!
  }

  type PaginatedEmployees {
    employees: [Employee!]!
    pagination: PaginationInfo!
  }

  type PaginationInfo {
    totalItems: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  type BulkOperationResult {
    success: Boolean!
    affectedCount: Int!
    errors: [String!]!
    message: String!
  }

  input EmployeeInput {
    employeeId: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    dateOfBirth: DateTime
    gender: Gender
    department: String!
    position: String!
    salary: Float
    hireDate: DateTime!
    managerId: ID
    status: EmployeeStatus = ACTIVE
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    emergencyContact: String
    emergencyPhone: String
    skills: [String!] = []
    experience: Int
    education: String
    certifications: [String!] = []
    performanceRating: Float
    avatarUrl: String  
  }

  input EmployeeUpdateInput {
    employeeId: String  # Add this field
    firstName: String
    lastName: String
    email: String
    phone: String
    dateOfBirth: DateTime
    gender: Gender
    department: String
    position: String
    salary: Float
    hireDate: DateTime  # Add this field
    managerId: ID
    status: EmployeeStatus
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    emergencyContact: String
    emergencyPhone: String
    skills: [String!]
    experience: Int
    education: String
    certifications: [String!]
    performanceRating: Float
    avatarUrl: String 
  }

  input BulkUpdateInput {
    ids: [ID!]!
    updates: EmployeeUpdateInput!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!  # Add these fields to match your resolver
    lastName: String!
    phone: String
    role: Role = EMPLOYEE
  }

  input UserProfileInput {
    firstName: String!
    lastName: String!
    phone: String
    avatarUrl: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input EmployeeFilters {
    search: String
    department: String
    position: String
    status: EmployeeStatus
    managerId: ID
    gender: Gender
    minAge: Int
    maxAge: Int
    minSalary: Float
    maxSalary: Float
    hiredAfter: DateTime
    hiredBefore: DateTime
    city: String
    state: String
    country: String
    hasManager: Boolean
    skills: [String!]
    minExperience: Int
    maxExperience: Int
    performanceRating: Float
  }

  type Query {
    # Employee queries
    employees(
      page: Int = 1
      limit: Int = 10
      sortBy: String = "first_name"
      sortOrder: SortOrder = ASC
      filters: EmployeeFilters
    ): PaginatedEmployees!
    
    employee(id: ID!): Employee
    
    employeeByEmployeeId(employeeId: String!): Employee
    
    employeeStats: EmployeeStats!
    
    departments: [String!]!
    
    positions: [String!]!
    
    managers: [Employee!]!
    
    searchEmployees(
      query: String!
      limit: Int = 10
    ): [Employee!]!
    
    # User queries
    me: User
    
    users(
      page: Int = 1
      limit: Int = 10
      role: Role
    ): [User!]!
    
    # Analytics queries
    departmentStats: [DepartmentCount!]!
    
    salaryAnalytics: [Employee!]!
    
    performanceAnalytics: [Employee!]!
  }

  type Mutation {
    # Authentication
    login(input: LoginInput!): AuthPayload!
    
    register(input: RegisterInput!): AuthPayload!
    
    logout: Boolean!
    
    # Employee mutations
    createEmployee(input: EmployeeInput!): Employee!
    
    updateEmployee(id: ID!, input: EmployeeUpdateInput!): Employee!
    
    deleteEmployee(id: ID!): Boolean!
    
    # Bulk operations
    bulkUpdateEmployees(input: BulkUpdateInput!): BulkOperationResult!
    
    bulkDeleteEmployees(ids: [ID!]!): BulkOperationResult!
    
    bulkCreateEmployees(inputs: [EmployeeInput!]!): BulkOperationResult!
    
    # Status management
    activateEmployee(id: ID!): Employee!
    
    deactivateEmployee(id: ID!): Employee!
    
    terminateEmployee(id: ID!): Employee!
    
    # Avatar upload
    uploadAvatar(id: ID!, file: Upload!): Employee!
    
    # Import/Export
    importEmployees(file: Upload!): BulkOperationResult!
    
    exportEmployees(format: String = "CSV"): String!
    
    # User management
    updateUserProfile(input: UserProfileInput!): User!
    
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    
    deleteUser(id: ID!): Boolean!
  }

  type Subscription {
    employeeAdded: Employee!
    employeeUpdated: Employee!
    employeeDeleted: ID!
    userRegistered: User!
  }
`;

module.exports = typeDefs;