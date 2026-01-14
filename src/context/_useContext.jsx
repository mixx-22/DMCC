import { useContext } from "react";
import { RolesContext, UsersContext, TeamsContext } from "./_contexts";

export const useRoles = () => {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error("useRoles must be used within RolesProvider");
  }
  return context;
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within UsersProvider");
  return context;
};

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) throw new Error("useTeams must be used within TeamsProvider");
  return context;
};
