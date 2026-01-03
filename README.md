# DMCC - Document Management & Certification Monitoring

A comprehensive document management system with certification and permit monitoring capabilities.

## Features

### Document Management
- Upload documents with details
- Document versioning
- Supervisor approval workflow

### Certification & Permit Monitoring
- Upload scanned documents
- Track expiration dates
- Notifications for documents expiring within 2 months

### Dashboard
- Recent opened documents
- Starred/favorite documents
- Activity logs

## Tech Stack
- Vite + React
- Chakra UI v2
- React Router
- js-cookie (for secure cookie management)

## Authentication & Security

### Token Management
The application uses **cookie-based token management** with security best practices:

#### Features:
- **Dual Storage**: Tokens are stored in cookies (primary) with localStorage as fallback for backward compatibility
- **Automatic Expiry**: JWT tokens are parsed and cookie expiry is set automatically based on the token's `exp` claim
- **Security Flags**: Cookies are configured with:
  - `SameSite=strict` - Prevents CSRF attacks
  - `Secure=true` (in production) - Only transmitted over HTTPS
  - Path-scoped to `/`
- **Credentials Include**: API requests include credentials for server-set HttpOnly cookies

#### How it works:
1. On login, the server returns a JWT token in the response body
2. The token is automatically stored in a cookie with appropriate security settings
3. Token expiry is extracted from JWT and set on the cookie
4. All API requests automatically include the token via cookies
5. On logout or token expiry, both cookies and localStorage are cleared

#### Cookie Service API:
The `cookieService` utility (`src/services/cookieService.js`) provides:
- `setToken(token, expiresInHours)` - Store token with custom expiry
- `setJWTToken(token)` - Store JWT token with automatic expiry parsing
- `getToken()` - Retrieve stored token
- `removeToken()` - Clear token on logout
- `hasToken()` - Check if token exists
- `parseJWT(token)` - Parse JWT payload

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```


