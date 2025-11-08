// import { useState, useEffect } from 'react';
// import { Login } from './pages/Login';
// import { AdminDashboard } from './components/AdminDashboard';
// import { FacultyDashboard } from './pages/FacultyDashboard';
// import { StudentDashboard } from './pages/StudentDashboard';
// import { Toaster } from './components/ui/sonner';

// import type { User } from './types';
// export type UserRole = 'admin' | 'faculty' | 'student';

// function App() {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Check for existing session
//     const storedUser = localStorage.getItem('scfmp_user');
//     if (storedUser) {
//       setCurrentUser(JSON.parse(storedUser));
//     }
//     setIsLoading(false);
//   }, []);

//   const handleLogin = (user: User) => {
//     setCurrentUser(user);
//     localStorage.setItem('scfmp_user', JSON.stringify(user));
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     localStorage.removeItem('scfmp_user');
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     return (
//       <>
//         <Login />
//         <Toaster />
//       </>
//     );
//   }

//   return (
//     <>
//       {currentUser.role === 'admin' && (
//         <AdminDashboard />
//       )}
//       {currentUser.role === 'faculty' && (
//         <FacultyDashboard />
//       )}
//       {currentUser.role === 'student' && (
//         <StudentDashboard />
//       )}
//       <Toaster />
//     </>
//   );
// }

// export default App;




// src/App.tsx
import { ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

import { Login } from './pages/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { StudentDashboard } from './pages/StudentDashboard';

import { AuthProvider, useAuth } from './contexts/AuthContext'; // expects an AuthProvider and useAuth hook
import type { User } from './types';
export type UserRole = 'admin' | 'faculty' | 'student';

/**
 * ProtectedRoute
 * - allowedRoles: optional array of roles that are allowed to view this route
 * - if user not logged in -> redirect to /login
 * - if user logged in but role not allowed -> redirect to home (or 403 page)
 */
function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }): ReactElement {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role as UserRole)) {
    // Authenticated but not authorized for this route
    // You can replace this with a 403 page if you have one
    return <Navigate to="/" replace />;
  }

  // Render the matched child route
  return <Outlet />;
}

/**
 * HomeRedirect
 * - Simple component to redirect user to their dashboard based on role
 */
function HomeRedirect(): ReactElement {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  switch ((currentUser.role ?? '').toString().toLowerCase()) {
    case 'admin':
      return <Navigate to="/admin/AdminDashboard" replace />;
    case 'faculty':
      return <Navigate to="/faculty/Dashboard" replace />;
    case 'student':
    default:
      return <Navigate to="/student/Dashboard" replace />;
  }
}

function AppRoutes(): ReactElement {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          currentUser ? (
            // If already logged in, send them to their home/dashboard
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Root redirects to role-specific dashboard */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Protected admin route(s) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/AdminDashboard" element={<AdminDashboard />} />
        {/* Add other /admin/* routes here */}
      </Route>

      {/* Protected faculty route(s) */}
      <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
        <Route path="/faculty/Dashboard" element={<FacultyDashboard />} />
        {/* Add other /faculty/* routes here */}
      </Route>

      {/* Protected student route(s) */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/Dashboard" element={<StudentDashboard />} />
        {/* Add other /student/* routes here */}
      </Route>

      {/* Fallback: unknown routes go to root (which will redirect or send to login) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * App (root)
 * Wraps routes with AuthProvider and BrowserRouter.
 * Exports default App.
 */
function App(): ReactElement {
  return (
    <AuthProvider>
      
        <AppRoutes />
        <Toaster />
     
    </AuthProvider>
  );
}

export default App;
