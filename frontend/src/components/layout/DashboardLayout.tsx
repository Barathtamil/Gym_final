import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Building2,
  Receipt,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Dumbbell,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemePicker } from '@/components/ui/theme-picker';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: ('admin' | 'staff')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'staff'] },
  { label: 'Members', icon: Users, path: '/members', roles: ['admin', 'staff'] },
  { label: 'Attendance', icon: CalendarCheck, path: '/attendance', roles: ['admin', 'staff'] },
  { label: 'Staffs', icon: UserCog, path: '/staffs', roles: ['admin'] },
  { label: 'Plans', icon: CreditCard, path: '/plans', roles: ['admin'] },
  { label: 'Branches', icon: Building2, path: '/branches', roles: ['admin'] },
  { label: 'Expenses', icon: Receipt, path: '/expenses', roles: ['admin', 'staff'] },
  { label: 'Enquiries', icon: HelpCircle, path: '/enquiries', roles: ['admin', 'staff'] },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    hasRole(item.roles)
  );

  const sidebarVariants = {
    open: { width: 280, transition: { duration: 0.3 } },
    closed: { width: 80, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={isSidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40"
      >
        {/* Logo */}
        <motion.div
          className="p-6 border-b border-sidebar-border"
          whileHover={{ scale: 1.02 }}
        >
          <Link to="/dashboard" className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
            >
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-2xl font-display text-sidebar-foreground"
                >
                  MATRIX GYM
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-gym">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Info, Theme Picker & Logout */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 bg-sidebar-accent rounded-lg"
              >
                <p className="text-sm font-semibold text-sidebar-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Theme Picker */}
          <ThemePicker isSidebarOpen={isSidebarOpen} />
          
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full hover:bg-sidebar-accent"
        >
          <motion.div animate={{ rotate: isSidebarOpen ? 0 : 180 }}>
            <X className="w-3 h-3" />
          </motion.div>
        </Button>
      </motion.aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-primary" />
          <span className="text-xl font-display">MATRIX GYM</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border z-50 pt-20"
            >
              <nav className="p-4 space-y-2">
                {filteredNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-sidebar-border space-y-2">
                <div className="mb-4 p-3 bg-sidebar-accent rounded-lg">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <ThemePicker />
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        className={cn(
          'flex-1 min-h-screen pt-16 lg:pt-0 transition-all duration-300',
          isSidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'
        )}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
