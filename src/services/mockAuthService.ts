
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

const MOCK_USERS_KEY = 'medimo_mock_users';
const CURRENT_USER_KEY = 'medimo_current_user';

// Default test user
const defaultTestUser: MockUser = {
  id: "USR-2024-001",
  email: "sarah.johnson@email.com",
  password: "Password123!",
  name: "Sarah Johnson",
  isOnboardingComplete: true
};

export class MockAuthService {
  private static initializeStorage(): void {
    const existingUsers = localStorage.getItem(MOCK_USERS_KEY);
    if (!existingUsers) {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([defaultTestUser]));
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

  static async register(email: string, password: string, name: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return {
        success: false,
        error: 'User with this email already exists'
      };
    }

    // Create new user
    const newUser: MockUser = {
      id: `USR-${Date.now()}`,
      email,
      password, // In real app, this would be hashed
      name,
      isOnboardingComplete: false
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

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
    return userData ? JSON.parse(userData) : null;
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
}
