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
The application uses **cookie-only token management** with security best practices:

#### Features:
- **Cookie Storage Only**: Tokens are stored exclusively in cookies (no localStorage)
- **Configurable Cookie Name**: Set via `VITE_TOKEN_KEY` environment variable
- **Automatic Expiry**: JWT tokens are parsed and cookie expiry is set automatically based on the token's `exp` claim
- **Security Flags**: Cookies are configured with:
  - `SameSite=strict` - Prevents CSRF attacks
  - `Secure=true` (in production) - Only transmitted over HTTPS
  - Path-scoped to `/`
- **Automatic Token Inclusion**: All API requests automatically include the token from cookies

#### How it works:
1. On login, the server returns a JWT token in the response body
2. The token is automatically stored in a cookie with appropriate security settings
3. Token expiry is extracted from JWT and set on the cookie
4. All API requests automatically include the token via the Authorization header
5. On logout or 401 error, the cookie is cleared

#### Usage:
See [TOKEN_USAGE.md](./TOKEN_USAGE.md) for detailed usage examples and best practices.

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


