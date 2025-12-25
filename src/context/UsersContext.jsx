import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const UsersContext = createContext();

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within UsersProvider");
  return context;
};

const USERS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_USERS;
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const getApiUrl = (endpoint) => `${API_ENDPOINT}${endpoint}`;

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(USERS_ENDPOINT));
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <UsersContext.Provider value={{ users, loading, error, fetchUsers }}>
      {children}
    </UsersContext.Provider>
  );
};
