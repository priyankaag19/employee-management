// hooks/useAuth.js
import { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";

const ME = gql`
  query Me {
    me {
      id
      email
      role
      profile {
        firstName
        lastName
        avatar
      }
    }
  }
`;

export default function useAuth() {
  const { data, loading, error } = useQuery(ME);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (data?.me) setUser(data.me);
  }, [data]);

  return { user, loading, error, isAdmin: user?.role === "ADMIN" };
}
