# DMCC - Document Management & Certification Monitoring

A comprehensive document management system with certification and permit monitoring capabilities.

## Features

### Document Management
- Upload documents with details
- Document versioning
- Check-in/check-out workflow
- Supervisor approval workflow
- Document archival system
- Document starring/favoriting

### Certification & Permit Monitoring
- Upload scanned documents
- Track expiration dates
- Notifications for documents expiring within 2 months
- Certificate age visualization
- Remaining days tracking

### Dashboard
- Recent opened documents and folders
- Starred/favorite documents
- Activity logs with filtering
- Certificate age pie charts
- Pending approvals overview

### User & Role Management
- User profiles with role assignments
- Role-based permissions
- Team management
- User activity tracking

## Tech Stack
- **Frontend**: Vite + React 18.2
- **UI Library**: Chakra UI v2.8
- **Routing**: React Router v6.20
- **Charts**: Recharts v3.5
- **Date Handling**: date-fns v2.30, moment v2.30
- **Notifications**: Sonner v2.0
- **Security**: js-cookie v3.0 (for secure cookie management)

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

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DMCC
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
Create a `.env` file in the root directory:
```bash
VITE_TOKEN_KEY=authToken  # Cookie name for auth token storage
```

### Development

1. Run development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5175`

2. Run linter:
```bash
npm run lint
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/          # React Context providers for state management
├── fonts/            # Custom font files
├── helpers/          # Utility helper functions
├── images/           # Static image assets
├── pages/            # Page components (routes)
├── services/         # API and external services
├── theme/            # Chakra UI theme customization
└── utils/            # Utility functions
```

## Code Quality

### Recent Improvements
- **React Key Props**: All list renderings now use stable, unique identifiers instead of array indices as keys, improving React reconciliation and preventing state bugs
- **Component Optimization**: Improved key management in user roles, charts, document versions, and folder listings
- **Type Safety**: Defensive coding with fallback values (e.g., `r.id || r._id`)

### Best Practices
- Use ESLint for code quality (`npm run lint`)
- Follow React best practices for keys in lists
- Utilize Chakra UI components for consistent styling
- Implement proper error handling in API calls


