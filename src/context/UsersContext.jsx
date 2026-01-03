import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import apiService from "../services/api";

const UsersContext = createContext();

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within UsersProvider");
  return context;
};

const USERS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_USERS;
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Example mock data for local development
const MOCK_USERS = [
  {
    id: "1",
    name: "Jane Doe",
    email: "jane@example.com",
    department: "Engineering",
    userType: "Admin",
    avatar: "",
  },
  {
    id: "2",
    name: "John Smith",
    email: "john@example.com",
    department: "HR",
    userType: "User",
    avatar: "",
  },
];

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!USE_API) {
      // Use mock data for local development
      setTimeout(() => {
        setUsers(MOCK_USERS);
        setLoading(false);
      }, 500);
      return;
    }
    try {
      // Use apiService.request which automatically includes the token from cookie
      const data = await apiService.request(USERS_ENDPOINT, {
        method: 'GET',
      });
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
