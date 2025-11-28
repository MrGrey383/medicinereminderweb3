import React from 'react';
import { Home, Users, Settings, Pill, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

const Sidebar = ({ currentPage, onNavigate, user }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'admin', icon: Users, label: 'Admin Panel' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
            <Pill className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">MedReminder</h1>
            <p className="text-xs text-gray-500">Stay Healthy</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300
                ${isActive
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {(user?.displayName || user?.email)?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;