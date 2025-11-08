// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import type { User } from '../types';

// interface AuthProviderProps {
//   children: ReactNode;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   loginAction: (token: string, user: User) => void;
//   logoutAction: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(() => {
//     try {
//       const stored = localStorage.getItem('user');
//       return stored ? JSON.parse(stored) : null;
//     } catch {
//       return null;
//     }
//   });

//   const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

//   useEffect(() => {
//     // keep localStorage in sync when token or user change
//     if (token) {
//       localStorage.setItem('token', token);
//     } else {
//       localStorage.removeItem('token');
//     }

//     if (user) {
//       localStorage.setItem('user', JSON.stringify(user));
//     } else {
//       localStorage.removeItem('user');
//     }
//   }, [token, user]);

//   const loginAction = (newToken: string, newUser: User) => {
//     setToken(newToken);
//     setUser(newUser);
//   };

//   const logoutAction = () => {
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         isAuthenticated: !!token,
//         loginAction,
//         logoutAction,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };





// // import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// // import api from '../services/api'; // your axios instance
// // import type { User } from '../types';

// // type UserRole = 'admin' | 'faculty' | 'student';

// // interface AuthContextValue {
// //   currentUser: User | null;
// //   isAuthenticated: boolean;
// //   loginAction: (token: string, user: User) => void;
// //   logoutAction: () => void;
// // }

// // const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// // const USER_STORAGE_KEY = 'scfmp_user';
// // const TOKEN_STORAGE_KEY = 'scfmp_token';

// // export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// //   const [currentUser, setCurrentUser] = useState<User | null>(() => {
// //     try {
// //       const raw = localStorage.getItem(USER_STORAGE_KEY);
// //       return raw ? (JSON.parse(raw) as User) : null;
// //     } catch {
// //       return null;
// //     }
// //   });

// //   // Ensure token header is set if a token exists in storage (useful on page refresh)
// //   useEffect(() => {
// //     const token = localStorage.getItem(TOKEN_STORAGE_KEY);
// //     if (token) {
// //       // set default header for axios instance
// //       api.defaults.headers = api.defaults.headers ?? {};
// //       // @ts-ignore - axios header typing can be finicky; this is safe
// //       api.defaults.headers.Authorization = `Bearer ${token}`;
// //     } else {
// //       if (api.defaults.headers) {
// //         // @ts-ignore
// //         delete api.defaults.headers.Authorization;
// //       }
// //     }
// //   }, []);

// //   const loginAction = (token: string, user: User) => {
// //     // persist
// //     localStorage.setItem(TOKEN_STORAGE_KEY, token);
// //     localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
// //     // set axios default header for immediate requests
// //     api.defaults.headers = api.defaults.headers ?? {};
// //     // @ts-ignore
// //     api.defaults.headers.Authorization = `Bearer ${token}`;
// //     // update state
// //     setCurrentUser(user);
// //   };

// //   const logoutAction = () => {
// //     localStorage.removeItem(TOKEN_STORAGE_KEY);
// //     localStorage.removeItem(USER_STORAGE_KEY);
// //     if (api.defaults.headers) {
// //       // @ts-ignore
// //       delete api.defaults.headers.Authorization;
// //     }
// //     setCurrentUser(null);
// //   };

// //   const value = useMemo(
// //     () => ({
// //       currentUser,
// //       isAuthenticated: !!currentUser,
// //       loginAction,
// //       logoutAction,
// //     }),
// //     [currentUser]
// //   );

// //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// // };

// // export function useAuth(): AuthContextValue {
// //   const ctx = useContext(AuthContext);
// //   if (!ctx) {
// //     throw new Error('useAuth must be used within AuthProvider');
// //   }
// //   return ctx;
// // }




import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import api from '../services/api'; // ✅ add axios instance
import type { User } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loginAction: (token: string, user: User) => void;
  logoutAction: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('scfmp_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('scfmp_token')
  );

  // Keep localStorage and axios headers in sync
  useEffect(() => {
    if (token) {
      localStorage.setItem('scfmp_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('scfmp_token');
      delete api.defaults.headers.common['Authorization'];
    }

    if (currentUser) {
      localStorage.setItem('scfmp_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('scfmp_user');
    }
  }, [token, currentUser]);

  const loginAction = (newToken: string, newUser: User) => {
    setToken(newToken);
    setCurrentUser(newUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logoutAction = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('scfmp_token');
    localStorage.removeItem('scfmp_user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!token,
        loginAction,
        logoutAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
