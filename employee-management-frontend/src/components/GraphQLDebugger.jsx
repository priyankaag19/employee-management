// Create this file: src/components/GraphQLDebugger.js
import React from 'react';
import { useQuery, gql } from '@apollo/client';

// Test each query individually to find the problematic one
const TEST_EMPLOYEES = gql`
  query TestEmployees {
    employees {
      id
      firstName
      lastName
      email
      department
      position
      avatarUrl
      phone
      hireDate
      location
    }
  }
`;

const TEST_ME = gql`
  query TestMe {
    me {
      id
      email
      profile {
        firstName
        lastName
        avatarUrl
      }
    }
  }
`;

const GraphQLDebugger = () => {
  const { data: empData, loading: empLoading, error: empError } = useQuery(TEST_EMPLOYEES);
  const { data: meData, loading: meLoading, error: meError } = useQuery(TEST_ME);

  return (
    <div className="p-6 bg-white border rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">GraphQL Debug Panel</h2>
      
      {/* Employees Query Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="font-semibold mb-2">📋 Employees Query</h3>
        {empLoading && <p className="text-blue-600">Loading employees...</p>}
        {empError && (
          <div className="text-red-600 bg-red-50 p-3 rounded">
            <p className="font-semibold">❌ EMPLOYEES ERROR:</p>
            <p className="text-sm">{empError.message}</p>
          </div>
        )}
        {empData && (
          <div className="text-green-600 bg-green-50 p-3 rounded">
            <p className="font-semibold">✅ EMPLOYEES SUCCESS:</p>
            <p className="text-sm">Found {empData.employees?.length || 0} employees</p>
          </div>
        )}
      </div>

      {/* Me Query Test */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="font-semibold mb-2">👤 Me Query</h3>
        {meLoading && <p className="text-blue-600">Loading user profile...</p>}
        {meError && (
          <div className="text-red-600 bg-red-50 p-3 rounded">
            <p className="font-semibold">❌ ME QUERY ERROR:</p>
            <p className="text-sm">{meError.message}</p>
            <p className="text-xs mt-1">This is likely your useAuth hook!</p>
          </div>
        )}
        {meData && (
          <div className="text-green-600 bg-green-50 p-3 rounded">
            <p className="font-semibold">✅ ME QUERY SUCCESS:</p>
            <p className="text-sm">User: {meData.me?.profile?.firstName}</p>
          </div>
        )}
      </div>

      {/* Raw Query Tests */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-2">🔍 Query Analysis</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Employee Query Fields:</strong> id, firstName, lastName, email, department, position, avatarUrl, phone, hireDate, location</p>
          <p><strong>Me Query Fields:</strong> id, email, profile.firstName, profile.lastName, profile.avatarUrl</p>
          <p className="text-blue-600"><strong>All using 'avatarUrl' ✅</strong></p>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">🚨 If you see errors above:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Me Query Error:</strong> Fix your useAuth hook - change 'avatar' to 'avatarUrl'</li>
          <li>• <strong>Employee Query Error:</strong> Fix your resolvers - change 'avatar:' to 'avatarUrl:'</li>
          <li>• <strong>Both working:</strong> The issue is in another component</li>
        </ul>
      </div>
    </div>
  );
};

export default GraphQLDebugger;