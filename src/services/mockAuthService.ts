
export interface MockUser {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name: string;
  isOnboardingComplete: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: MockUser;
  error?: string;
}

// Public (sanitized) user info without password exposure
export interface MockUserPublic {
  id: string;
  email: string;
  name: string;
  isOnboardingComplete: boolean;
}

const MOCK_USERS_KEY = 'medimo_mock_users';
const CURRENT_USER_KEY = 'medimo_current_user';

// Default test users (Sarah, David, and Kenji for isolation tests)
const defaultTestUsers: MockUser[] = [
  {
    id: "USR-2024-001",
    email: "sarah.johnson@email.com",
    password: "Password123!",
    name: "Sarah Johnson",
    isOnboardingComplete: true
  },
  {
    id: "USR-2024-002",
    email: "david.martinez@example.com",
    password: "Password123!",
    name: "David Martinez",
    isOnboardingComplete: true
  },
  {
    // Kenji Nakamura - Vastly different test user for data isolation verification
    // If ANY of Sarah or David's data appears for this user, it's a FAIL
    id: "USR-2024-003",
    email: "kenji.nakamura@test.jp",
    password: "Isolation2026!",
    name: "Kenji Nakamura",
    isOnboardingComplete: true
  }
];

export class MockAuthService {
  private static initializeStorage(): void {
    const existingUsersRaw = localStorage.getItem(MOCK_USERS_KEY);
    if (!existingUsersRaw) {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultTestUsers));
      return;
    }
    try {
      const existingUsers: MockUser[] = JSON.parse(existingUsersRaw);
      // Ensure both default users exist for backward compatibility
      let changed = false;
      defaultTestUsers.forEach(def => {
        if (!existingUsers.find(u => u.email.toLowerCase() === def.email.toLowerCase())) {
          existingUsers.push(def);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));
      }
    } catch {
      // If parsing fails, reset to defaults to ensure demo continuity
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultTestUsers));
    }
  }

  private static getUsers(): MockUser[] {
    this.initializeStorage();
    const users = localStorage.getItem(MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private static saveUsers(users: MockUser[]): void {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }

  static async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const users = this.getUsers();
    const normalizedEmailInput = email.toLowerCase();

    // Check if user already exists
    if (users.find(user => user.email.toLowerCase() === normalizedEmailInput)) {
      return {
        success: false,
        error: 'User with this email already exists'
      };
    }

    // Create new user
    const newUser: MockUser = {
      id: `USR-${Date.now()}`,
      email: normalizedEmailInput, // Store email as lowercase
      password, // In real app, this would be hashed
      name,
      isOnboardingComplete: true  // Skip onboarding - name/email/password already collected
    };

    users.push(newUser);
    this.saveUsers(users);

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return {
      success: true,
      user: newUser
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const users = this.getUsers();
    const normalizedEmailInput = email.toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmailInput && u.password === password);

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return {
      success: true,
      user
    };
  }

  static getCurrentUser(): MockUser | null {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Failed to parse current user data:', e);
      localStorage.removeItem(CURRENT_USER_KEY); // Clear corrupted entry
      return null;
    }
  }

  static logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  static async updateUserOnboardingStatus(userId: string, isComplete: boolean): Promise<void> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].isOnboardingComplete = isComplete;
      this.saveUsers(users);

      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.isOnboardingComplete = isComplete;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      }
    }
  }

  // Return all users (sanitized) for account switching UI
  static getAllUsersPublic(): MockUserPublic[] {
    return this.getUsers().map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      isOnboardingComplete: u.isOnboardingComplete
    }));
  }
}
