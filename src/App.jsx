import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Documents, DocumentDetail } from "./components/Document";
import Search from "./pages/Search";
import Certifications from "./pages/Certifications";
import CertificationDetail from "./pages/CertificationDetail";
import Users from "./pages/Users";
import UserPage from "./pages/Users/UserPage";
import { UsersProvider } from "./context/UsersContext";
import Teams from "./pages/Teams";
import TeamPage from "./pages/Teams/TeamPage";
import { TeamsProvider } from "./context/TeamsContext";
import { TeamProfileProvider } from "./context/TeamProfileContext";
import Schedules from "./pages/Schedules";
import SchedulePage from "./pages/Schedules/SchedulePage";
import { SchedulesProvider } from "./context/SchedulesContext";
import { ScheduleProfileProvider } from "./context/ScheduleProfileContext";
import Archive from "./pages/Archive";
import Roles from "./pages/Roles";
import RolePage from "./pages/Roles/RolePage";
import { RolesProvider } from "./context/RolesContext";
import { RoleProvider } from "./context/RoleContext";
import FileTypes from "./pages/FileTypes";
import { FileTypesProvider } from "./context/FileTypesContext";
import { useBreakpointValue } from "@chakra-ui/react";
import Menu from "./pages/Menu";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Settings from "./pages/Settings";
import { useApp } from "./context/_useContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import FormTemplateBuilder from "./pages/FormTemplateBuilder";
import FormResponse from "./pages/Document/FormResponse";
import QualityDocuments from "./pages/QualityDocuments";
import ResponsiveTabsDemo from "./pages/ResponsiveTabsDemo";
import OrganizationTabsDemo from "./pages/OrganizationTabsDemo";
import UIControlDemo from "./pages/UIControlDemo";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { currentUser } = useApp();
  const position = useBreakpointValue({
    base: "bottom-center",
    md: "bottom-left",
  });

  return (
    <>
      <Toaster position={position} richColors />
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route
            path="/login"
            element={
              currentUser ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/demo/responsive-tabs"
            element={<ResponsiveTabsDemo />}
          />
          <Route
            path="/demo/organization-tabs"
            element={<OrganizationTabsDemo />}
          />
          <Route
            path="/demo/ui-control"
            element={<UIControlDemo />}
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/change-password"
                      element={<ChangePassword />}
                    />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/document/:id" element={<DocumentDetail />} />
                    <Route
                      path="/documents/folders/:id"
                      element={<Documents />}
                    />
                    <Route
                      path="/quality-documents"
                      element={<QualityDocuments />}
                    />
                    <Route
                      path="/documents/form/:id"
                      element={<FormResponse />}
                    />
                    <Route path="/search" element={<Search />} />
                    <Route
                      path="/create-form"
                      element={<FormTemplateBuilder />}
                    />
                    <Route
                      path="/edit-form/:id"
                      element={<FormTemplateBuilder />}
                    />
                    <Route path="/archive" element={<Archive />} />
                    <Route
                      path="/certifications"
                      element={<Certifications />}
                    />
                    <Route
                      path="/certifications/:id"
                      element={<CertificationDetail />}
                    />
                    <Route
                      path="/users"
                      element={
                        <UsersProvider>
                          <Users />
                        </UsersProvider>
                      }
                    />
                    <Route
                      path="/users/:id"
                      element={
                        <UserProfileProvider>
                          <UserPage />
                        </UserProfileProvider>
                      }
                    />
                    <Route
                      path="/teams"
                      element={
                        <TeamsProvider>
                          <Teams />
                        </TeamsProvider>
                      }
                    />
                    <Route
                      path="/teams/:id"
                      element={
                        <TeamProfileProvider>
                          <TeamPage />
                        </TeamProfileProvider>
                      }
                    />
                    <Route
                      path="/audit-schedules"
                      element={
                        <SchedulesProvider>
                          <Schedules />
                        </SchedulesProvider>
                      }
                    />
                    <Route
                      path="/audit-schedule/:id"
                      element={
                        <ScheduleProfileProvider>
                          <SchedulePage />
                        </ScheduleProfileProvider>
                      }
                    />
                    <Route
                      path="/roles"
                      element={
                        <RolesProvider>
                          <Roles />
                        </RolesProvider>
                      }
                    />
                    <Route
                      path="/roles/:id"
                      element={
                        <RoleProvider>
                          <RolePage />
                        </RoleProvider>
                      }
                    />
                    <Route
                      path="/file-types"
                      element={
                        <FileTypesProvider>
                          <FileTypes />
                        </FileTypesProvider>
                      }
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
