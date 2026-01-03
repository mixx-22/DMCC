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
import Certifications from "./pages/Certifications";
import CertificationDetail from "./pages/CertificationDetail";
import Users from "./pages/Users";
import { UsersProvider } from "./context/UsersContext";
import Archive from "./pages/Archive";
import Roles from "./pages/Roles";
import RoleView from "./pages/Roles/RoleView";
import RoleEdit from "./pages/Roles/RoleEdit";
import { RolesProvider } from "./context/RolesContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { currentUser } = useApp();

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
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
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/documents/:id" element={<DocumentDetail />} />
                  <Route path="/archive" element={<Archive />} />
                  <Route path="/certifications" element={<Certifications />} />
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
                    path="/roles"
                    element={
                      <RolesProvider>
                        <Roles />
                      </RolesProvider>
                    }
                  />
                  <Route
                    path="/roles/:id/view"
                    element={
                      <RolesProvider>
                        <RoleView />
                      </RolesProvider>
                    }
                  />
                  <Route
                    path="/roles/:id/edit"
                    element={
                      <RolesProvider>
                        <RoleEdit />
                      </RolesProvider>
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
