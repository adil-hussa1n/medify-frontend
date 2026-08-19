import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../api/mock/data';
import { mockDb } from '../api/mock/mockDb';

interface AuthContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  setCurrentUserById: (userId: string) => void;
  allDemoUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => mockDb.getCurrentUser());

  const switchRole = (role: UserRole) => {
    const targetUser = mockUsers.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      mockDb.setCurrentUser(targetUser.id);
    }
  };

  const setCurrentUserById = (userId: string) => {
    const targetUser = mockUsers.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      mockDb.setCurrentUser(targetUser.id);
    }
  };

  useEffect(() => {
    mockDb.setCurrentUser(currentUser.id);
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        setCurrentUserById,
        allDemoUsers: mockUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
