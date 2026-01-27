import { useContext } from "react";
import {
  RolesContext,
  UsersContext,
  TeamsContext,
  AppContext,
  UserContext,
  LayoutContext,
  TeamProfileContext,
  UserProfileContext,
  RoleContext,
  SchedulesContext,
  ScheduleProfileContext,
  OrganizationsContext,
  DocumentsContext,
  FileTypesContext,
  FileTypeContext,
  PermissionContext,
} from "./_contexts";

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return context;
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return context;
};

export const useRoles = () => {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error("useRoles must be used within RolesProvider");
  }
  return context;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within UsersProvider");
  return context;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) throw new Error("useTeams must be used within TeamsProvider");
  return context;
};

export const useTeamProfile = () => {
  const context = useContext(TeamProfileContext);
  if (!context) {
    throw new Error("useTeamProfile must be used within TeamProfileProvider");
  }
  return context;
};

export const useSchedules = () => {
  const context = useContext(SchedulesContext);
  if (!context)
    throw new Error("useSchedules must be used within SchedulesProvider");
  return context;
};

export const useScheduleProfile = () => {
  const context = useContext(ScheduleProfileContext);
  if (!context) {
    throw new Error(
      "useScheduleProfile must be used within ScheduleProfileProvider",
    );
  }
  return context;
};

export const useOrganizations = () => {
  const context = useContext(OrganizationsContext);
  if (!context)
    throw new Error(
      "useOrganizations must be used within OrganizationsProvider",
    );
  return context;
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
};

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error("useDocuments must be used within DocumentsProvider");
  }
  return context;
};

export const useFileTypes = () => {
  const context = useContext(FileTypesContext);
  if (!context) {
    throw new Error("useFileTypes must be used within FileTypesProvider");
  }
  return context;
};

export const useFileType = () => {
  const context = useContext(FileTypeContext);
  if (!context) {
    throw new Error("useFileType must be used within FileTypeProvider");
  }
  return context;
};
