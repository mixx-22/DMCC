import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import { DocumentsProvider } from "./context/DocumentsContext";
import Certifications from "./pages/Certifications";
import CertificationDetail from "./pages/CertificationDetail";
import Users from "./pages/Users";
import UserPage from "./pages/Users/UserPage";
import { UsersProvider } from "./context/UsersContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import Teams from "./pages/Teams";
import TeamPage from "./pages/Teams/TeamPage";
import { TeamsProvider } from "./context/TeamsContext";
import { TeamProfileProvider } from "./context/TeamProfileContext";
import Archive from "./pages/Archive";
import Roles from "./pages/Roles";
import RolePage from "./pages/Roles/RolePage";
import { RolesProvider } from "./context/RolesContext";
import { RoleProvider } from "./context/RoleContext";
import { useBreakpointValue } from "@chakra-ui/react";
import Menu from "./pages/Menu";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

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
                    <Route
                      path="/documents"
                      element={
                        <DocumentsProvider>
                          <Documents />
                        </DocumentsProvider>
                      }
                    />
                    <Route
                      path="/document/:id"
                      element={
                        <DocumentsProvider>
                          <DocumentDetail />
                        </DocumentsProvider>
                      }
                    />
                    <Route
                      path="/documents/folders/:id"
                      element={
                        <DocumentsProvider>
                          <Documents />
                        </DocumentsProvider>
                      }
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
