import React, { useState, useEffect, createContext, useContext } from 'react';
import Toast from './Toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const success = (message, duration) => addNotification('success', message, duration);
  const error = (message, duration) => addNotification('error', message, duration);
  const warning = (message, duration) => addNotification('warning', message, duration);
  const info = (message, duration) => addNotification('info', message, duration);

  return (
    <NotificationContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <Toast
            key={notif.id}
            type={notif.type}
            message={notif.message}
            duration={notif.duration}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};