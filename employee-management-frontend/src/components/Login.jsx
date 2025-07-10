import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id email role }
    }
  }
`;


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { error }] = useMutation(LOGIN, {
    onCompleted: ({ login }) => {
      localStorage.setItem('token', data.login.token);
      window.location.href = '/';
    },
  });

  return (
    <form onSubmit={e => {
      e.preventDefault();
      login({ variables: { input: { email, password } } });
    }}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
      {error && <p>{error.message}</p>}
    </form>
  );
}
