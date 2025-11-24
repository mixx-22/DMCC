import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import DocumentDetail from './pages/DocumentDetail'
import Certifications from './pages/Certifications'
import CertificationDetail from './pages/CertificationDetail'
import Approvals from './pages/Approvals'
import Accounts from './pages/Accounts'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/certifications/:id" element={<CertificationDetail />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App




