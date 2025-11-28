import React from 'react';
import { Home, Users, Settings } from 'lucide-react';

const BottomNav = ({ currentPage, onNavigate }) => {
  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Home',
      description: 'Dashboard' 
    },
    { 
      id: 'admin', 
      icon: Users, 
      label: 'Admin',
      description: 'Management' 
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Settings',
      description: 'Preferences' 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-6 py-3">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
         const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex flex-col items-center gap-1 transition-all duration-300
                px-4 py-2 rounded-xl min-w-[70px]
                ${isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Icon 
                size={24} 
                className={`transition-transform ${isActive ? 'scale-110' : ''}`}
              />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;