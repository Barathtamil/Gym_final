import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import AttendanceList from "./pages/AttendanceList";
import Plans from "./pages/Plans";
import Branches from "./pages/Branches";
import Expenses from "./pages/Expenses";
import Enquiries from "./pages/Enquiries";
import MemberAttendance from "./pages/MemberAttendance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/member-attendance" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'member' ? '/member-attendance' : '/dashboard'} replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'member' ? '/member-attendance' : '/dashboard') : '/login'} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Dashboard /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Members /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><AttendanceList /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute allowedRoles={['admin']}><Plans /></ProtectedRoute>} />
      <Route path="/branches" element={<ProtectedRoute allowedRoles={['admin']}><Branches /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Expenses /></ProtectedRoute>} />
      <Route path="/enquiries" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Enquiries /></ProtectedRoute>} />
      <Route path="/member-attendance" element={<ProtectedRoute allowedRoles={['member']}><MemberAttendance /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
