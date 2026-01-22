import { useEffect } from "react";
import { UsersContext } from "./_contexts";
import { createCRUDProvider } from "./factories/createCRUDContext";
import { useUsers } from "./_useContext";

const USERS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_USERS;

// Example mock data for local development
const MOCK_USERS = [
  {
    _id: "user-1",
    userId: "EMP001",
    employeeId: "EMP001",
    username: "janedoe-EMP001",
    firstName: "Jane",
    middleName: "",
    lastName: "Doe",
    email: "jane@example.com",
    department: "Engineering",
    position: "Senior Engineer",
    contactNumber: "+639171234567",
    role: [
      { id: "1", title: "Admin" },
      { id: "2", title: "Manager" },
    ],
    isActive: true,
  },
  {
    _id: "user-2",
    userId: "EMP002",
    employeeId: "EMP002",
    username: "johnsmith-EMP002",
    firstName: "John",
    middleName: "M",
    lastName: "Smith",
    email: "john@example.com",
    department: "HR",
    position: "HR Manager",
    contactNumber: "+639181234567",
    role: [{ id: "3", title: "User" }],
    isActive: true,
  },
];

// Filter function for search
const filterUsers = (users, searchTerm) => {
  const searchLower = searchTerm.toLowerCase();
  return users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });
};

// Create the provider using the factory
const BaseUsersProvider = createCRUDProvider({
  Context: UsersContext,
  resourceName: "users",
  resourceKey: "users",
  endpoint: USERS_ENDPOINT,
  mockData: MOCK_USERS,
  filterMockData: filterUsers,
});

// Wrapper to add initial fetch on mount
export const UsersProvider = ({ children }) => {
  return (
    <BaseUsersProvider>
      <InitialFetch>{children}</InitialFetch>
    </BaseUsersProvider>
  );
};

// Component to handle initial data fetch
function InitialFetch({ children }) {
  const { fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}
