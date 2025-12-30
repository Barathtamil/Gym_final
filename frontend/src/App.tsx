import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import AttendanceList from "./pages/AttendanceList";
import Staffs from "./pages/Staffs";
import Plans from "./pages/Plans";
import Branches from "./pages/Branches";
import Expenses from "./pages/Expenses";
import Enquiries from "./pages/Enquiries";
import MemberAttendance from "./pages/MemberAttendance";
import MemberView from "./pages/MemberView";
import PendingRegistrations from "./pages/PendingRegistrations";
import MembershipGrowth from "./pages/statistics/MembershipGrowth";
import AttendanceTrend from "./pages/statistics/AttendanceTrend";
import RevenueTrend from "./pages/statistics/RevenueTrend";
import MembershipStatus from "./pages/statistics/MembershipStatus";
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
      <Route path="/statistics/membership-growth" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><MembershipGrowth /></ProtectedRoute>} />
      <Route path="/statistics/attendance-trend" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><AttendanceTrend /></ProtectedRoute>} />
      <Route path="/statistics/revenue-trend" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><RevenueTrend /></ProtectedRoute>} />
      <Route path="/statistics/membership-status" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><MembershipStatus /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Members /></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><MemberView /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><AttendanceList /></ProtectedRoute>} />
      <Route path="/staffs" element={<ProtectedRoute allowedRoles={['admin']}><Staffs /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute allowedRoles={['admin']}><Plans /></ProtectedRoute>} />
      <Route path="/branches" element={<ProtectedRoute allowedRoles={['admin']}><Branches /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Expenses /></ProtectedRoute>} />
      <Route path="/enquiries" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Enquiries /></ProtectedRoute>} />
      <Route path="/pending-registrations" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><PendingRegistrations /></ProtectedRoute>} />
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
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
