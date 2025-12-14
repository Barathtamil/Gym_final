import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: '1',
      name: 'John Admin',
      username: 'admin',
      role: 'admin',
      branchId: '1',
      mobileNumber: '9876543210',
      isActive: true,
    },
  },
  staff: {
    password: 'staff123',
    user: {
      id: '2',
      name: 'Mike Staff',
      username: 'staff',
      role: 'staff',
      branchId: '1',
      mobileNumber: '9876543211',
      isActive: true,
    },
  },
  member: {
    password: 'member123',
    user: {
      id: '3',
      name: 'Alex Member',
      username: 'member',
      role: 'member',
      branchId: '1',
      mobileNumber: '9876543212',
      isActive: true,
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('matrix_gym_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser = mockUsers[username];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      localStorage.setItem('matrix_gym_user', JSON.stringify(mockUser.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('matrix_gym_user');
  };

  const hasRole = (roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
