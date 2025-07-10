import { useQuery, gql } from "@apollo/client";

const GET_EMPLOYEES = gql`
  query Employees(
    $page: Int
    $limit: Int
    $sortBy: String
    $sortOrder: SortOrder
    $search: String
    $department: String
    $status: String
  ) {
    employees(
      page: $page
      limit: $limit
      sortBy: $sortBy
      sortOrder: $sortOrder
      search: $search
      department: $department
      status: $status
    ) {
      employees {
        id
        firstName
        lastName
        email
        department
        position
        avatarUrl
      }
      pagination {
        currentPage
        totalPages
      }
    }
  }
`;


export default function EmployeeList({ onEmployeeClick }) {
  const { data, loading, error } = useQuery(GET_EMPLOYEES, {
  variables: {
    page: 1,
    limit: 10,
    sortBy: "first_name",
    sortOrder: "ASC",
    search: "",
    department: "",
    status: ""
  }
});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading employees: {error.message}</p>;

  const employees = data?.employees?.employees || [];

  return (
    <div className="grid">
      {employees.map((emp) => (
        <div key={emp.id} className="card" onClick={() => onEmployeeClick(emp)}>
          <img src={emp.avatarUrl || "/default-avatar.png"} alt="avatar" />
          <h3>{emp.firstName} {emp.lastName}</h3>
          <p>{emp.email}</p>
          <p>{emp.position} - {emp.department}</p>
        </div>
      ))}
    </div>
  );
}
