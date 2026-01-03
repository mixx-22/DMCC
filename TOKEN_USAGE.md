# Token Management Usage Guide

## Overview
All authentication tokens are stored **exclusively in cookies** using the `VITE_TOKEN_KEY` environment variable as the cookie name. localStorage is NOT used for token storage.

## Configuration

### Environment Variable
Set the token cookie name in your `.env` file:
```bash
VITE_TOKEN_KEY=authToken
```

If not set, defaults to `'authToken'`.

## Usage Examples

### 1. Making Authenticated API Requests

**Using apiService (Recommended)**

The `apiService.request()` method automatically includes the token from cookies in all requests:

```javascript
import apiService from '../services/api';

// Example: Fetch users
async function getUsers() {
  try {
    const users = await apiService.request('/api/users', {
      method: 'GET',
    });
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
}

// Example: Create a document
async function createDocument(documentData) {
  try {
    const result = await apiService.request('/api/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
    return result;
  } catch (error) {
    console.error('Failed to create document:', error);
  }
}

// Example: Update a user
async function updateUser(userId, updates) {
  try {
    const result = await apiService.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return result;
  } catch (error) {
    console.error('Failed to update user:', error);
  }
}

// Example: Delete a certification
async function deleteCertification(certId) {
  try {
    await apiService.request(`/api/certifications/${certId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete certification:', error);
  }
}
```

### 2. Login Flow

The login process automatically stores the token in a cookie:

```javascript
import { useUser } from '../context/useUser';

function LoginComponent() {
  const { login } = useUser();

  const handleLogin = async (username, password) => {
    const result = await login(username, password);
    
    if (result.success) {
      // Token is automatically stored in cookie
      // Navigate to dashboard or home page
      console.log('Login successful');
    } else {
      console.error('Login failed:', result.error);
    }
  };

  return (
    // Your login form JSX
  );
}
```

### 3. Logout Flow

```javascript
import { useUser } from '../context/useUser';

function LogoutButton() {
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    // Token cookie is automatically cleared
    // User is redirected to login page
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### 4. Accessing Token in Components (if needed)

```javascript
import { useUser } from '../context/useUser';

function MyComponent() {
  const { authToken, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      {/* Your authenticated content */}
      <p>You are logged in</p>
    </div>
  );
}
```

### 5. Direct Cookie Service Usage (Advanced)

For advanced use cases, you can use the cookieService directly:

```javascript
import cookieService from '../services/cookieService';

// Check if user has a token
const hasToken = cookieService.hasToken();

// Get the token (rarely needed since apiService handles this)
const token = cookieService.getToken();

// Manually set a token with custom expiry (1 hour)
cookieService.setToken('your-token', 1);

// Set a JWT token (automatically parses expiry)
cookieService.setJWTToken('your-jwt-token');

// Remove token (used in logout)
cookieService.removeToken();

// Parse JWT payload
const payload = cookieService.parseJWT('your-jwt-token');
console.log('Token expires at:', payload.exp);
```

## Important Notes

### ✅ DO:
- Use `apiService.request()` for ALL authenticated API calls
- Let the login/logout functions handle token storage automatically
- Use the `isAuthenticated` flag from `useUser()` to check auth status

### ❌ DON'T:
- Store tokens in localStorage
- Manually add Authorization headers (apiService does this)
- Use raw `fetch()` for authenticated requests
- Access cookies directly (use cookieService)

## Token Security Features

All tokens stored in cookies have the following security settings:

- **SameSite=Strict**: Prevents CSRF attacks
- **Secure**: Only transmitted over HTTPS in production
- **Path=/**: Available application-wide
- **Auto-expiry**: Automatically parsed from JWT `exp` claim

## Automatic Token Handling

### On Login:
1. Server returns JWT token
2. Token is parsed to extract `exp` claim
3. Token stored in cookie with matching expiry
4. Token automatically included in all `apiService.request()` calls

### On API Requests:
1. Token retrieved from cookie
2. Added to `Authorization: Bearer <token>` header
3. Sent with request

### On 401 Unauthorized:
1. Token cookie is cleared
2. User redirected to login page

### On Logout:
1. Token cookie is cleared
2. Session storage is cleared
3. User data is removed from localStorage

## Example: Complete Feature Implementation

Here's a complete example of implementing a feature with authenticated API calls:

```javascript
import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useUser } from '../context/useUser';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useUser();

  // Fetch documents on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Token automatically included from cookie
      const data = await apiService.request('/api/documents', {
        method: 'GET',
      });
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (docData) => {
    try {
      // Token automatically included from cookie
      const newDoc = await apiService.request('/api/documents', {
        method: 'POST',
        body: JSON.stringify(docData),
      });
      setDocuments([...documents, newDoc]);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const updateDocument = async (docId, updates) => {
    try {
      // Token automatically included from cookie
      const updatedDoc = await apiService.request(`/api/documents/${docId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setDocuments(documents.map(d => d.id === docId ? updatedDoc : d));
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const deleteDocument = async (docId) => {
    try {
      // Token automatically included from cookie
      await apiService.request(`/api/documents/${docId}`, {
        method: 'DELETE',
      });
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Documents</h1>
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          <button onClick={() => updateDocument(doc.id, { title: 'Updated' })}>
            Update
          </button>
          <button onClick={() => deleteDocument(doc.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={() => createDocument({ title: 'New Doc' })}>
        Create Document
      </button>
    </div>
  );
}

export default DocumentsPage;
```

## Summary

**Key Points:**
1. Tokens are stored **only in cookies** (no localStorage)
2. Cookie name is configurable via `VITE_TOKEN_KEY`
3. ALL requests use `apiService.request()` which automatically includes the token
4. Login/logout handle token management automatically
5. Security flags (SameSite, Secure) are automatically applied
6. JWT expiry is automatically parsed and set on the cookie
