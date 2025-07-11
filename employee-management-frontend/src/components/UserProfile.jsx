import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_ME = gql`
  query Me {
    me {
      id
      email
      role
      profile {
        firstName
        lastName
        avatarUrl
        __typename
      }
      __typename
    }
  }
`;

const UserProfile = () => {
  const { data, loading, error } = useQuery(GET_ME, {
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
    onError: (error) => {
      console.error("❌ USER PROFILE ERROR:", error);
      console.error("GraphQL Errors:", error.graphQLErrors);
      console.error("Network Error:", error.networkError);
    }
  });

  if (loading) return <div>Loading profile...</div>;

  if (error) {
    return (
      <div style={{ border: '2px solid red', padding: '10px', margin: '10px' }}>
        <h3>❌ Profile Error:</h3>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div>
      <h2>User Profile</h2>
      {data?.me && (
        <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <div>
            <img 
              src={data.me.profile?.avatarUrl || "/default-avatar.png"} 
              alt="avatar" 
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
            />
          </div>
          <h3>{data.me.profile?.firstName} {data.me.profile?.lastName}</h3>
          <p>Email: {data.me.email}</p>
          <p>Role: {data.me.role}</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
