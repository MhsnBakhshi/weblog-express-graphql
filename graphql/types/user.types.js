export const User = `
  type User {
  id: ID
  avatar: String
  name: String
  username: String
  password: String
  email: String
  phone: String
  role: String
  }
`;

export const OptionalUserInput = `
  input OptionalUserInput {
  email: String
  avatar: String
  }
`;

export const Auth = `
type Auth {
  user: User
  accessToken: String
  refreshToken: String
  }
  `;

export const UserRole = `
    enum UserRole {
    USER
    ADMIN
    }
  `;
