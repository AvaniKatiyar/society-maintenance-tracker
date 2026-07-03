import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShieldAlert,
  Home
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Complaints', path: '/admin/complaints', icon: ShieldAlert },
    { name: 'Notice Board', path: '/notices', icon: Bell },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const residentLinks = [
    { name: 'Dashboard', path: '/resident/dashboard', icon: LayoutDashboard },
    { name: 'My Complaints', path: '/complaints', icon: FileText },
    { name: 'Notice Board', path: '/notices', icon: Bell },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : residentLinks;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Sidebar Drawer on Mobile & Navigation on Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:flex lg:flex-col lg:h-screen`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-600 rounded-lg text-white">
              <Home className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white tracking-wide">SocietyPortal</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-sm font-semibold transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mr-2"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <img
                src={user?.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{user?.fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize">
                  {user?.role?.toLowerCase()} {user?.flatNumber ? `• Flat ${user.flatNumber}` : ''}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
