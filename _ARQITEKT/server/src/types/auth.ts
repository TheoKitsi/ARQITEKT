export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  email?: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface StoredUser {
  profile: UserProfile;
  githubAccessToken: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UsersStore {
  users: StoredUser[];
}
