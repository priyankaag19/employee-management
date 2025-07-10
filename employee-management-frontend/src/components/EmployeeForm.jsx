// components/EmployeeForm.jsx
import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
      firstName
      lastName
      email
    }
  }
`;

export default function EmployeeForm() {
  const [form, setForm] = useState({});
  const [createEmployee] = useMutation(CREATE_EMPLOYEE);

  const handleSubmit = (e) => {
    e.preventDefault();
    createEmployee({ variables: { input: form } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="First Name" onChange={e => setForm({ ...form, firstName: e.target.value })} />
      <input placeholder="Last Name" onChange={e => setForm({ ...form, lastName: e.target.value })} />
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      {/* Add other fields */}
      <button type="submit">Save</button>
    </form>
  );
}
