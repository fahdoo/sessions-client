export {}

// Docs: https://clerk.com/docs/guides/basic-rbac#set-the-admin-role-for-your-user
// Create a type for the roles
export type Roles = 'admin' | 'user'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}
