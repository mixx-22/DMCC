import { createContext, useContext, useState, useEffect } from "react";

const RolesContext = createContext();

export const useRoles = () => {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error("useRoles must be used within RolesProvider");
  }
  return context;
};

// Initial mock data for roles with nested permissions
const INITIAL_ROLES = [
  {
    id: "1",
    title: "Admin",
    description: "Full system access with all permissions",
    permissions: {
      documents: { c: true, r: true, u: true, d: true },
      certifications: { c: true, r: true, u: true, d: true },
      users: { c: true, r: true, u: true, d: true },
      roles: { c: true, r: true, u: true, d: true },
      accounts: { c: true, r: true, u: true, d: true },
      archive: { c: false, r: true, u: false, d: true },
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Manager",
    description: "Can manage documents and view reports",
    permissions: {
      documents: { c: true, r: true, u: true, d: false },
      certifications: { c: true, r: true, u: true, d: false },
      users: { c: false, r: true, u: false, d: false },
      roles: { c: false, r: true, u: false, d: false },
      accounts: { c: false, r: true, u: false, d: false },
      archive: { c: false, r: true, u: false, d: false },
    },
    createdAt: "2024-02-10T14:30:00.000Z",
    updatedAt: "2024-03-05T09:15:00.000Z",
  },
  {
    id: "3",
    title: "User",
    description: "Basic user with read-only access",
    permissions: {
      documents: { c: false, r: true, u: false, d: false },
      certifications: { c: false, r: true, u: false, d: false },
      users: { c: false, r: false, u: false, d: false },
      roles: { c: false, r: false, u: false, d: false },
      accounts: { c: false, r: false, u: false, d: false },
      archive: { c: false, r: true, u: false, d: false },
    },
    createdAt: "2024-01-20T08:00:00.000Z",
    updatedAt: "2024-01-20T08:00:00.000Z",
  },
  {
    id: "4",
    title: "Document Editor",
    description: "Can create and edit documents only",
    permissions: {
      documents: { c: true, r: true, u: true, d: false },
      certifications: { c: false, r: true, u: false, d: false },
      users: { c: false, r: false, u: false, d: false },
      roles: { c: false, r: false, u: false, d: false },
      accounts: { c: false, r: false, u: false, d: false },
      archive: { c: false, r: false, u: false, d: false },
    },
    createdAt: "2024-03-01T11:20:00.000Z",
    updatedAt: "2024-03-01T11:20:00.000Z",
  },
];

export const RolesProvider = ({ children }) => {
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem("roles");
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  useEffect(() => {
    localStorage.setItem("roles", JSON.stringify(roles));
  }, [roles]);

  const addRole = (roleData) => {
    const newRole = {
      ...roleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRoles((prev) => [...prev, newRole]);
    return newRole;
  };

  const updateRole = (id, updates) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.id === id
          ? {
              ...role,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : role
      )
    );
  };

  const deleteRole = (id) => {
    setRoles((prev) => prev.filter((role) => role.id !== id));
  };

  const getRoleById = (id) => {
    return roles.find((role) => role.id === id);
  };

  return (
    <RolesContext.Provider
      value={{
        roles,
        addRole,
        updateRole,
        deleteRole,
        getRoleById,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
};
