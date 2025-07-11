// import { useQuery, gql } from "@apollo/client";

// // Correct GraphQL query that matches your backend schema
// const GET_EMPLOYEES = gql`
//   query Employees(
//     $page: Int
//     $limit: Int
//     $sortBy: String
//     $sortOrder: SortOrder
//     $filters: EmployeeFilters
//   ) {
//     employees(
//       page: $page
//       limit: $limit
//       sortBy: $sortBy
//       sortOrder: $sortOrder
//       filters: $filters
//     ) {
//       employees {
//         id
//         firstName
//         lastName
//         email
//         phoneNumber
//         department
//         position
//         hireDate
//         salary
//         status
//         avatar
//         managerId
//         createdAt
//         updatedAt
//         manager {
//           id
//           firstName
//           lastName
//           email
//         }
//       }
//       pagination {
//         currentPage
//         totalPages
//         totalItems
//         hasNextPage
//         hasPreviousPage
//       }
//     }
//   }
// `;

// // Simple test query to verify connection
// const GET_EMPLOYEES_SIMPLE = gql`
//   query {
//     employees {
//       employees {
//         id
//         firstName
//         lastName
//         email
//         avatar
//       }
//       pagination {
//         currentPage
//         totalPages
//         totalItems
//       }
//     }
//   }
// `;

// const EmployeeList = () => {
//   // Use the full query with proper variables structure
//   const { data, loading, error } = useQuery(GET_EMPLOYEES, {
//     variables: {
//       page: 1,
//       limit: 10,
//       sortBy: "first_name",
//       sortOrder: "ASC",
//       filters: {
//         search: null,
//         department: null,
//         status: null
//       }
//     },
//     errorPolicy: 'all',
//     onError: (error) => {
//       console.error("GraphQL Error:", error);
//       console.error("GraphQL Error Details:", error.graphQLErrors);
//       console.error("Network Error:", error.networkError);
//     }
//   });

//   // For testing - uncomment this and comment the above query if you want to test the simple version first
//   // const { data, loading, error } = useQuery(GET_EMPLOYEES_SIMPLE);

//   if (loading) return <div>Loading employees...</div>;
  
//   if (error) {
//     console.error("Full error object:", error);
//     return (
//       <div>
//         <h3>Error loading employees:</h3>
//         <pre>{JSON.stringify(error, null, 2)}</pre>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2>Employee List</h2>
//       <div>
//         {data?.employees?.employees?.map((emp) => (
//           <div key={emp.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
//             <div>
//               <img 
//                 src={emp.avatar || "/default-avatar.png"} 
//                 alt="avatar" 
//                 style={{ width: '50px', height: '50px', borderRadius: '50%' }}
//               />
//             </div>
//             <h3>{emp.firstName} {emp.lastName}</h3>
//             <p>Email: {emp.email}</p>
//             <p>Department: {emp.department}</p>
//             <p>Position: {emp.position}</p>
//             <p>Status: {emp.status}</p>
//             {emp.manager && (
//               <p>Manager: {emp.manager.firstName} {emp.manager.lastName}</p>
//             )}
//           </div>
//         ))}
//       </div>
      
//       {data?.employees?.pagination && (
//         <div>
//           <p>
//             Page {data.employees.pagination.currentPage} of {data.employees.pagination.totalPages}
//           </p>
//           <p>Total Items: {data.employees.pagination.totalItems}</p>
//           <p>Has Next Page: {data.employees.pagination.hasNextPage ? 'Yes' : 'No'}</p>
//           <p>Has Previous Page: {data.employees.pagination.hasPreviousPage ? 'Yes' : 'No'}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeList;


import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_EMPLOYEES = gql`
  query Employees(
    $page: Int
    $limit: Int
    $sortBy: String
    $sortOrder: SortOrder
    $filters: EmployeeFilters
  ) {
    employees(
      page: $page
      limit: $limit
      sortBy: $sortBy
      sortOrder: $sortOrder
      filters: $filters
    ) {
      employees {
        id
        firstName
        lastName
        email
        phoneNumber
        department
        position
        hireDate
        salary
        status
        avatarUrl
        managerId
        createdAt
        updatedAt
        manager {
          id
          firstName
          lastName
          email
        }
      }
      pagination {
        currentPage
        totalPages
        totalItems
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const EmployeeList = () => {
  const { data, loading, error } = useQuery(GET_EMPLOYEES, {
    variables: {
      page: 1,
      limit: 10,
      sortBy: "firstName",
      sortOrder: "ASC",
      filters: {
        search: null,
        department: null,
        status: null
      }
    },
    errorPolicy: 'all',
    onError: (error) => {
      console.error("❌ EMPLOYEE ERROR:", error);
      console.error("GraphQL Errors:", error.graphQLErrors);
      console.error("Network Error:", error.networkError);
    }
  });

  if (loading) return <div>Loading employees...</div>;

  if (error) {
    return (
      <div style={{ border: '2px solid red', padding: '10px', margin: '10px' }}>
        <h3>❌ Employee Error:</h3>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div>
      <h2>Employee List</h2>
      <div>
        {data?.employees?.employees?.map((emp) => (
          <div key={emp.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <div>
              <img 
                src={emp.avatarUrl || "/default-avatar.png"} 
                alt="avatar" 
                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              />
            </div>
            <h3>{emp.firstName} {emp.lastName}</h3>
            <p>Email: {emp.email}</p>
            <p>Department: {emp.department}</p>
            <p>Position: {emp.position}</p>
            <p>Status: {emp.status}</p>
            {emp.manager && (
              <p>Manager: {emp.manager.firstName} {emp.manager.lastName}</p>
            )}
          </div>
        ))}
      </div>

      {data?.employees?.pagination && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          <p>
            Page {data.employees.pagination.currentPage} of {data.employees.pagination.totalPages}
          </p>
          <p>Total Items: {data.employees.pagination.totalItems}</p>
          <p>Has Next Page: {data.employees.pagination.hasNextPage ? 'Yes' : 'No'}</p>
          <p>Has Previous Page: {data.employees.pagination.hasPreviousPage ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;